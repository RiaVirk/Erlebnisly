import { NextRequest, NextResponse } from "next/server";
import { mollie } from "@/lib/mollie";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@prisma/client";

// Mollie sends POST with form data body containing the payment ID.
// Do NOT add auth to this route — Mollie doesn't send auth headers.
// Security comes from re-fetching the payment from Mollie's API using your API key.

export async function POST(req: NextRequest) {
  try {
    // Parse the form-encoded body
    const formData = await req.formData();
    const paymentId = formData.get("id") as string | null;

    // Validate format — Mollie payment IDs start with "tr_"
    if (!paymentId || !paymentId.startsWith("tr_")) {
      console.warn("[mollie/webhook] invalid payment ID:", paymentId);
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
    }

    // IMPORTANT: Always re-fetch from Mollie. Never trust the webhook body alone.
    // This prevents replay attacks and ensures you have the current state.
    const payment = await mollie.payments.get(paymentId);

    // Extract bookingId from metadata
    const metadata = payment.metadata;
    const bookingId =
      typeof metadata === "object" &&
      metadata !== null &&
      "bookingId" in metadata
        ? String((metadata as Record<string, unknown>).bookingId)
        : null;

    if (!bookingId) {
      console.error("[mollie/webhook] payment has no bookingId in metadata", paymentId);
      // Return 200 so Mollie stops retrying — this is a data problem, not a server error
      return NextResponse.json({ received: true });
    }

    // Look up the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        timeSlot: { include: { experience: true } },
      },
    });

    if (!booking) {
      console.error("[mollie/webhook] booking not found", bookingId);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Parse refunded amount — Mollie gives strings like "25.00"
    const refundedCents = payment.amountRefunded
      ? Math.round(parseFloat(payment.amountRefunded.value) * 100)
      : 0;

    // ─── Determine the new status ────────────────────────────────────
    let newStatus: BookingStatus | null = null;
    let reason = `Mollie payment status: ${payment.status}`;

    if (payment.isPaid()) {
      // Payment succeeded — but check if the hold is still valid
      const stillHaveSpot = await verifySpotStillAvailable({
        timeSlotId: booking.timeSlotId,
        experienceMaxParticipants: booking.timeSlot.experience.maxParticipants,
        slotCapacity: booking.timeSlot.capacity,
        participantCount: booking.participantCount,
        bookingId: booking.id,
      });

      if (stillHaveSpot) {
        newStatus = "CONFIRMED";
        reason = "Payment confirmed by Mollie";
      } else {
        // Paid but hold expired and spot was given to someone else.
        // Admin must manually issue a refund.
        newStatus = "NEEDS_REVIEW";
        reason = "Paid but slot no longer available — admin refund required";
        console.error(
          "[mollie/webhook] NEEDS_REVIEW — payment received after hold expired",
          { bookingId, paymentId }
        );
      }
    } else if (payment.isCanceled() || payment.isExpired()) {
      newStatus = "EXPIRED_HOLD";
      reason = `Payment ${payment.status} by customer/Mollie`;
    } else if (
      typeof payment.isFailed === "function"
        ? payment.isFailed()
        : payment.status === "failed"
    ) {
      newStatus = "EXPIRED_HOLD";
      reason = "Payment failed";
    } else if (refundedCents > 0) {
      if (refundedCents >= booking.totalPriceCents) {
        newStatus = "REFUNDED";
        reason = "Full refund issued";
      } else {
        newStatus = "PARTIALLY_REFUNDED";
        reason = `Partial refund: ${refundedCents} cents`;
      }
    }
    // For "open" and "pending" statuses, newStatus stays null — we do nothing

    // ─── Idempotency guard ───────────────────────────────────────────
    // Mollie can call this webhook multiple times for the same event.
    // If the status hasn't changed, return early.
    if (!newStatus || newStatus === booking.status) {
      return NextResponse.json({ received: true, skipped: "no status change" });
    }

    const previousStatus = booking.status;

    // ─── Update booking + write audit event (in a transaction) ──────
    await prisma.$transaction(
      async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: newStatus,
            molliePaymentStatus: payment.status,
            amountRefundedCents: refundedCents,
          },
        });

        await tx.bookingEvent.create({
          data: {
            bookingId,
            actorId: null, // system/Mollie triggered this
            previousStatus,
            newStatus,
            reason,
          },
        });
      },
      { timeout: 15000 }
    );

    // ─── Side effects (emails, waitlist promotion) ───────────────────
    // These run OUTSIDE the transaction. If they fail, the booking
    // status is already correctly updated. Log errors but don't re-throw.
    await fireSideEffects(bookingId, previousStatus, newStatus!).catch((err) => {
      console.error("[mollie/webhook] side effect error", err);
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[mollie/webhook] unhandled error", err);
    // Return 500 so Mollie retries
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── Availability re-check ───────────────────────────────────────

async function verifySpotStillAvailable(params: {
  timeSlotId: string;
  experienceMaxParticipants: number;
  slotCapacity: number | null;
  participantCount: number;
  bookingId: string;
}): Promise<boolean> {
  const { timeSlotId, experienceMaxParticipants, slotCapacity, participantCount, bookingId } =
    params;

  const capacity = slotCapacity ?? experienceMaxParticipants;

  const result = await prisma.booking.aggregate({
    where: {
      timeSlotId,
      id: { not: bookingId }, // exclude this booking itself
      status: { in: ["CONFIRMED", "RESERVED_HOLD"] },
      OR: [
        { holdExpiresAt: null },
        { holdExpiresAt: { gt: new Date() } },
      ],
    },
    _sum: { participantCount: true },
  });

  const othersTaken = result._sum.participantCount ?? 0;
  return othersTaken + participantCount <= capacity;
}

// ─── Side effects ────────────────────────────────────────────────

async function fireSideEffects(
  bookingId: string,
  previousStatus: BookingStatus,
  newStatus: BookingStatus
) {
  // Phase 1: just log. Phase 2: send emails via Resend. Phase 3: promote waitlist.
  console.log(`[side-effects] ${bookingId}: ${previousStatus} → ${newStatus}`);

  if (newStatus === "CONFIRMED") {
    // TODO Phase 2: sendBookingConfirmationEmail(bookingId)
    // TODO Phase 3: promoteNextWaitlistEntry(booking.timeSlotId)
  }

  if (newStatus === "REFUNDED" || newStatus === "PARTIALLY_REFUNDED") {
    // TODO Phase 2: sendRefundConfirmationEmail(bookingId)
  }
}