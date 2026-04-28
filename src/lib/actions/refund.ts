"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getHostMollieClient } from "@/lib/mollie";
import { decideRefund } from "@/lib/refund-policy";
import { promoteNextWaitlistEntry } from "@/lib/waitlist-promotion";
import { revalidatePath } from "next/cache";
import type { BookingStatus } from "@prisma/client";

interface CancelInput {
  bookingId: string;
  reason: string;
  overrideRefundCents?: number;
}

export async function cancelBookingAndRefund(input: CancelInput) {
  const { userId: clerkUserId, sessionClaims } = await auth();
  if (!clerkUserId) return { ok: false, error: "Not signed in" } as const;

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!dbUser) return { ok: false, error: "No user" } as const;

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { timeSlot: { include: { experience: true } } },
  });
  if (!booking) return { ok: false, error: "Booking not found" } as const;
  if (booking.status !== "CONFIRMED") {
    return { ok: false, error: "Only confirmed bookings can be cancelled" } as const;
  }

  // Authorization: customer owns it, host owns the experience, or admin
  const isCustomer = booking.userId === dbUser.id;
  const isHost = booking.timeSlot.experience.hostId === dbUser.id;
  const isAdmin = role === "ADMIN";
  if (!isCustomer && !isHost && !isAdmin) {
    return { ok: false, error: "Forbidden" } as const;
  }

  const cancelledBy: "customer" | "host" | "admin" = isAdmin
    ? "admin"
    : isHost
    ? "host"
    : "customer";

  const decision = decideRefund({
    totalPriceCents: booking.totalPriceCents,
    slotStartTime: booking.timeSlot.startTime,
    cancelledBy,
  });

  const refundCents =
    input.overrideRefundCents !== undefined && isAdmin
      ? input.overrideRefundCents
      : decision.kind !== "none"
      ? decision.refundCents
      : 0;

  const newStatus: BookingStatus =
    cancelledBy === "customer"
      ? "CANCELLED_BY_CUSTOMER"
      : cancelledBy === "host"
      ? "CANCELLED_BY_HOST"
      : "CANCELLED_BY_ADMIN";

  // If no refund due, finalize directly
  if (refundCents === 0 || !booking.molliePaymentId) {
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: newStatus },
      }),
      prisma.bookingEvent.create({
        data: {
          bookingId: booking.id,
          actorId: dbUser.id,
          previousStatus: "CONFIRMED",
          newStatus,
          reason: `${input.reason} — ${decision.reason}`,
        },
      }),
    ]);
  } else {
    // Issue the Mollie refund
    const hostClient = await getHostMollieClient(booking.timeSlot.experience.hostId);

    await hostClient.client.paymentRefunds.create({
      paymentId: booking.molliePaymentId,
      amount: {
        currency: booking.currency,
        value: (refundCents / 100).toFixed(2),
      },
      description: input.reason,
      testmode: process.env.NODE_ENV !== "production",
    });

    // Booking stays CONFIRMED until webhook confirms the refund is processed
    // Move to REFUND_PENDING in the state machine
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: "REFUND_PENDING" },
      }),
      prisma.bookingEvent.create({
        data: {
          bookingId: booking.id,
          actorId: dbUser.id,
          previousStatus: "CONFIRMED",
          newStatus: "REFUND_PENDING",
          reason: `${input.reason} — ${decision.reason} — refund ${refundCents} cents initiated`,
        },
      }),
    ]);
  }

  revalidatePath(`/bookings/${booking.id}`);
  revalidatePath("/host/bookings");

  // Fire waitlist promotion for the freed slot (non-fatal)
  promoteNextWaitlistEntry(booking.timeSlotId).catch((err) =>
    console.error("[cancelBookingAndRefund] waitlist promotion failed", err)
  );

  return { ok: true, refundCents, decision } as const;
}
