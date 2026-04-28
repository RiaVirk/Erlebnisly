import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@mollie/api-client";
import { prisma } from "@/lib/prisma";
import { getHostMollieClient } from "@/lib/mollie";
import { promoteNextWaitlistEntry } from "@/lib/waitlist-promotion";
import type { BookingStatus } from "@prisma/client";

// Classic Mollie webhooks POST form data: id=tr_xxx — no signature to verify.
// We verify by re-fetching the payment server-to-server.

export async function POST(req: NextRequest) {
  const text = await req.text();
  const params = new URLSearchParams(text);
  const molliePaymentId = params.get("id");

  if (!molliePaymentId) {
    return new NextResponse("Missing id", { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: { molliePaymentId },
    include: { timeSlot: { include: { experience: true } } },
  });

  if (!booking) {
    // Unknown payment — return 200 so Mollie stops retrying
    console.warn("[mollie/webhook] unknown payment id", molliePaymentId);
    return new NextResponse("ok", { status: 200 });
  }

  // Fetch payment from Mollie using the host's client to authenticate the org
  let payment;
  try {
    const hostClient = await getHostMollieClient(booking.timeSlot.experience.hostId);
    payment = await hostClient.client.payments.get(molliePaymentId, {
      testmode: process.env.NODE_ENV !== "production",
    });
  } catch (err) {
    console.error("[mollie/webhook] payment fetch failed", molliePaymentId, err);
    return new NextResponse("Internal error", { status: 500 });
  }

  const bookingId = (payment.metadata as { bookingId?: string } | null)?.bookingId;
  if (bookingId !== booking.id) {
    console.error("[mollie/webhook] metadata bookingId mismatch", { bookingId, bookingDbId: booking.id });
    return new NextResponse("Mismatch", { status: 400 });
  }

  const newBookingStatus = mapPaymentStatus(payment.status, booking.status);

  // Idempotency: nothing to do if status hasn't changed
  if (!newBookingStatus || newBookingStatus === booking.status) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { molliePaymentStatus: payment.status },
    });
    return new NextResponse("ok", { status: 200 });
  }

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: newBookingStatus, molliePaymentStatus: payment.status },
    }),
    prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        actorId: null,
        previousStatus: booking.status,
        newStatus: newBookingStatus,
        reason: `Mollie payment ${payment.status}`,
      },
    }),
  ]);

  // Handle refund confirmation
  if (newBookingStatus === "REFUNDED" || newBookingStatus === "PARTIALLY_REFUNDED") {
    const amountRefundedCents = payment.amountRefunded
      ? Math.round(parseFloat((payment.amountRefunded as { value: string }).value) * 100)
      : 0;

    await prisma.booking.update({
      where: { id: booking.id },
      data: { amountRefundedCents },
    });
  }

  // Free capacity → promote next waitlist candidate
  const spotReleasingStatuses: BookingStatus[] = [
    "EXPIRED_HOLD",
    "CANCELLED_BY_CUSTOMER",
    "CANCELLED_BY_HOST",
    "CANCELLED_BY_ADMIN",
    "REFUNDED",
  ];
  if (spotReleasingStatuses.includes(newBookingStatus)) {
    promoteNextWaitlistEntry(booking.timeSlotId).catch((err) =>
      console.error("[mollie/webhook] waitlist promotion failed", err)
    );
  }

  return new NextResponse("ok", { status: 200 });
}

function mapPaymentStatus(
  mollieStatus: PaymentStatus,
  currentBookingStatus: BookingStatus,
): BookingStatus | null {
  switch (mollieStatus) {
    case PaymentStatus.paid:
      return "CONFIRMED";
    case PaymentStatus.canceled:
    case PaymentStatus.expired:
      // Only transition out of RESERVED_HOLD
      return currentBookingStatus === "RESERVED_HOLD" ? "EXPIRED_HOLD" : null;
    case PaymentStatus.failed:
      return currentBookingStatus === "RESERVED_HOLD" ? "EXPIRED_HOLD" : null;
    default:
      // open, pending, authorized — no state change yet
      return null;
  }
}
