"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getHostMollieClient, HostNotConnectedError, HostNotOnboardedError } from "@/lib/mollie";
import { calculatePrice } from "@/lib/pricing/calculator";
import { env } from "@/lib/env";
import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export async function createReservationHold(input: {
  timeSlotId: string;
  participantCount: number;
  selectedAddOnIds?: string[];
  specialRequests?: string;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { ok: false, error: "Not signed in" } as const;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!dbUser) return { ok: false, error: "No user" } as const;

  // ── Transact: lock slot → check capacity → price → create booking ──
  let result: {
    booking: { id: string; totalPriceCents: number; platformFeeCents: number; currency: string };
    hostUserId: string;
    experienceTitle: string;
    slotStart: Date;
    timezone: string;
  };

  try {
    result = await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "TimeSlot" WHERE id = ${input.timeSlotId} FOR UPDATE`;

        const slot = await tx.timeSlot.findUnique({
          where: { id: input.timeSlotId },
          include: { experience: { include: { addOns: true } } },
        });
        if (!slot) throw new Error("Slot not found");
        if (slot.isBlocked) throw new Error("This slot is no longer available");
        if (slot.startTime <= new Date()) throw new Error("This slot has already started");

        const cap = slot.capacity ?? slot.experience.maxParticipants;
        const taken = await tx.booking.aggregate({
          where: {
            timeSlotId: slot.id,
            status: { in: ["CONFIRMED", "RESERVED_HOLD"] },
            OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: new Date() } }],
          },
          _sum: { participantCount: true },
        });
        if ((taken._sum.participantCount ?? 0) + input.participantCount > cap) {
          throw new Error(
            `Only ${cap - (taken._sum.participantCount ?? 0)} spot(s) left. Reduce your group size.`
          );
        }

        if (input.participantCount < slot.experience.minParticipants) {
          throw new Error(`Minimum ${slot.experience.minParticipants} participants required`);
        }

        // Server-side price calculation — never trust client
        const selectedAddOns = input.selectedAddOnIds?.length
          ? slot.experience.addOns.filter((a) => input.selectedAddOnIds!.includes(a.id))
          : [];
        const addOnsCents = selectedAddOns.reduce((s, a) => s + a.priceCents, 0);

        const breakdown = calculatePrice({
          basePriceCents: slot.experience.basePriceCents,
          participants: input.participantCount,
          addOnsCents,
          slotStartTime: slot.startTime,
          rawRules: slot.experience.pricingRules,
        });

        const conn = await tx.mollieConnect.findUnique({
          where: { userId: slot.experience.hostId },
        });
        if (!conn) throw new Error("Host has not connected Mollie — cannot accept payments");

        const platformFeeCents = Math.round(breakdown.totalCents * conn.platformFeeBps / 10_000);
        const hostPayoutCents = breakdown.totalCents - platformFeeCents;
        const vatCents = Math.round(
          breakdown.totalCents * slot.experience.vatRateBps / (10_000 + slot.experience.vatRateBps)
        );

        const booking = await tx.booking.create({
          data: {
            userId: dbUser.id,
            timeSlotId: slot.id,
            status: "RESERVED_HOLD",
            holdExpiresAt: addMinutes(new Date(), 15),
            participantCount: input.participantCount,
            currency: slot.experience.currency,
            subtotalCents: breakdown.subtotalCents,
            addOnsCents: breakdown.addOnsCents,
            totalPriceCents: breakdown.totalCents,
            platformFeeCents,
            hostPayoutCents,
            vatCents,
            addOnsSelected: selectedAddOns.length
              ? Object.fromEntries(selectedAddOns.map((a) => [a.id, 1]))
              : undefined,
            specialRequests: input.specialRequests,
          },
        });

        await tx.bookingEvent.create({
          data: {
            bookingId: booking.id,
            actorId: dbUser.id,
            newStatus: "RESERVED_HOLD",
            reason: "Customer started checkout",
          },
        });

        return {
          booking: {
            id: booking.id,
            totalPriceCents: booking.totalPriceCents,
            platformFeeCents: booking.platformFeeCents,
            currency: booking.currency,
          },
          hostUserId: slot.experience.hostId,
          experienceTitle: slot.experience.title,
          slotStart: slot.startTime,
          timezone: slot.experience.timezone,
        };
      },
      { isolationLevel: "Serializable", timeout: 10_000 }
    );
  } catch (err: unknown) {
    if (err instanceof Error) return { ok: false, error: err.message } as const;
    return { ok: false, error: "Failed to reserve slot. Please try again." } as const;
  }

  // ── Outside the transaction: create the Mollie payment ──────────
  let hostClient;
  try {
    hostClient = await getHostMollieClient(result.hostUserId);
  } catch (err) {
    if (err instanceof HostNotOnboardedError || err instanceof HostNotConnectedError) {
      await prisma.booking.update({
        where: { id: result.booking.id },
        data: { status: "EXPIRED_HOLD" },
      });
      return {
        ok: false,
        error: "This experience is temporarily unavailable for payments. Please try another.",
      } as const;
    }
    throw err;
  }

  const totalEur = (result.booking.totalPriceCents / 100).toFixed(2);
  const feeEur = (result.booking.platformFeeCents / 100).toFixed(2);
  const slotLabel = formatInTimeZone(result.slotStart, result.timezone, "PPpp");

  let payment;
  try {
    payment = await hostClient.client.payments.create({
      amount: { currency: result.booking.currency, value: totalEur },
      description: `${result.experienceTitle} on ${slotLabel}`,
      redirectUrl: `${env.APP_URL}/bookings/${result.booking.id}/thank-you`,
      webhookUrl: `${env.APP_URL}/api/mollie/webhook`,
      metadata: { bookingId: result.booking.id },
      profileId: hostClient.profileId,
      applicationFee: {
        amount: { currency: result.booking.currency, value: feeEur },
        description: "Erlebnisly platform fee",
      },
      testmode: env.NODE_ENV !== "production",
    });
  } catch (err) {
    console.error("[createReservationHold] Mollie payment creation failed", err);
    // Hold is live; it'll expire in 15 min if no payment attaches
    return {
      ok: false,
      error: "Payment initialization failed. Your reservation will expire in 15 minutes.",
    } as const;
  }

  await prisma.booking.update({
    where: { id: result.booking.id },
    data: { molliePaymentId: payment.id, molliePaymentStatus: payment.status },
  });

  const checkoutUrl = payment.getCheckoutUrl();
  if (!checkoutUrl) {
    throw new Error("Mollie did not return a checkout URL");
  }

  return { ok: true, checkoutUrl, bookingId: result.booking.id } as const;
}
