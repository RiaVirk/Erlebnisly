import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  if (!env.DEMO_MODE) {
    return NextResponse.json({ error: "Not in demo mode" }, { status: 404 });
  }

  const { bookingId, action, paymentId } = (await req.json()) as {
    bookingId: string;
    action: "paid" | "canceled";
    paymentId?: string;
  };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus: BookingStatus = action === "paid" ? "CONFIRMED" : "EXPIRED_HOLD";

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        molliePaymentId: paymentId ?? booking.molliePaymentId,
        molliePaymentStatus: action,
      },
    });
    await tx.bookingEvent.create({
      data: {
        bookingId,
        previousStatus: booking.status,
        newStatus,
        reason: `Demo mode: ${action}`,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
