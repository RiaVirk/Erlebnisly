"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { mollie } from "@/lib/mollie";
import { env } from "@/lib/env";
import { z } from "zod";
import { format } from "date-fns";

const CreateHoldSchema = z.object({
  experienceId: z.string().cuid(),
  timeSlotId: z.string().cuid(),
  participantCount: z.number().int().min(1).max(50),
});

export async function createReservationHold(
  rawInput: unknown
): Promise<{ checkoutUrl?: string; bookingId?: string; error?: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "You must be signed in to book" };

  const parsed = CreateHoldSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { experienceId, timeSlotId, participantCount } = parsed.data;

  // Get DB user
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return { error: "User not found" };

  // ─── Load experience and slot ───────────────────────────────────
  const experience = await prisma.experience.findUnique({
    where: { id: experienceId, isPublished: true, deletedAt: null },
  });
  if (!experience) return { error: "Experience not found or not available" };

  const slot = await prisma.timeSlot.findUnique({
    where: { id: timeSlotId },
  });
  if (!slot || slot.experienceId !== experienceId) return { error: "Time slot not found" };
  if (slot.isBlocked) return { error: "This slot is no longer available" };
  if (slot.startTime <= new Date()) return { error: "This slot has already started" };

  // ─── Calculate price SERVER-SIDE (Golden Rule #5) ───────────────
  // Phase 1: simple base price × participants
  // Phase 2: apply pricingRules
  const subtotalCents = experience.basePriceCents * participantCount;
  const addOnsCents = 0;
  const totalPriceCents = subtotalCents + addOnsCents;

  // VAT is informational (already included in price, not added on top)
  const vatCents = Math.round(
    totalPriceCents * (experience.vatRateBps / (10000 + experience.vatRateBps))
  );

  // Platform fee (15% by default — read from mollieConnect if available)
  const platformFeeBps = 1500;
  const platformFeeCents = Math.round(totalPriceCents * (platformFeeBps / 10000));
  const hostPayoutCents = totalPriceCents - platformFeeCents;

  // ─── Validate participant count ──────────────────────────────────
  if (participantCount < experience.minParticipants) {
    return { error: `Minimum ${experience.minParticipants} participants required` };
  }

  const capacity = slot.capacity ?? experience.maxParticipants;
  if (participantCount > capacity) {
    return { error: `Maximum ${capacity} participants for this slot` };
  }

  // ─── Transaction: lock the slot, check availability, create booking ──
  let bookingId: string;

  try {
    bookingId = await prisma.$transaction(
      async (tx) => {
        // Lock the slot row to prevent concurrent overbooking
        // This ensures only one transaction runs this block at a time for this slot
        await tx.$queryRaw`
          SELECT id FROM "TimeSlot"
          WHERE id = ${timeSlotId}
          FOR UPDATE
        `;

        // Count spots already taken (active holds + confirmed)
        const taken = await tx.booking.aggregate({
          where: {
            timeSlotId,
            status: { in: ["CONFIRMED", "RESERVED_HOLD"] },
            OR: [
              { holdExpiresAt: null },
              { holdExpiresAt: { gt: new Date() } },
            ],
          },
          _sum: { participantCount: true },
        });

        const spotsTaken = taken._sum.participantCount ?? 0;

        if (spotsTaken + participantCount > capacity) {
          throw new Error(
            `Only ${capacity - spotsTaken} spots left. Please reduce your group size.`
          );
        }

        // Create the booking
        const booking = await tx.booking.create({
          data: {
            userId: user.id,
            timeSlotId,
            status: "RESERVED_HOLD",
            holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            participantCount,
            currency: "EUR",
            subtotalCents,
            addOnsCents,
            totalPriceCents,
            platformFeeCents,
            hostPayoutCents,
            vatCents,
          },
        });

        // Create the audit event (Golden Rule #3)
        await tx.bookingEvent.create({
          data: {
            bookingId: booking.id,
            actorId: user.id,
            previousStatus: null,
            newStatus: "RESERVED_HOLD",
            reason: "Customer initiated booking",
          },
        });

        return booking.id;
      },
      { timeout: 10000 } // 10 second timeout
    );
  } catch (err: unknown) {
    // Re-throw user-friendly messages
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to reserve slot. Please try again." };
  }

  // ─── Create Mollie payment (OUTSIDE the transaction) ────────────
  // If Mollie fails, the hold exists but has no payment ID.
  // The 15-minute expiry cron will clean it up.
  try {
    const slotDate = format(slot.startTime, "d MMM yyyy");
    const payment = await mollie.payments.create({
      amount: {
        currency: "EUR",
        value: (totalPriceCents / 100).toFixed(2), // must be string: "49.99"
      },
      description: `${experience.title} on ${slotDate}`,
      redirectUrl: `${env.APP_URL}/bookings/${bookingId}/thank-you`,
      webhookUrl: `${env.APP_URL}/api/webhooks/mollie`,
      metadata: { bookingId },
    });

    // Save molliePaymentId to booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: { molliePaymentId: payment.id },
    });

    return { checkoutUrl: payment.getCheckoutUrl() ?? undefined, bookingId };
  } catch (err) {
    console.error("[createReservationHold] Mollie error:", err);
    // Booking hold was created but payment failed — it'll expire in 15 min.
    // Return the bookingId so customer can see status.
    return {
      error: "Payment initialization failed. Your reservation will expire in 15 minutes.",
      bookingId,
    };
  }
}