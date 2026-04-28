import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

// Runs hourly. Flips CONFIRMED → COMPLETED for bookings where the slot has passed.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();

  const completable = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      timeSlot: { startTime: { lt: now } },
    },
    select: { id: true, status: true },
    take: 500,
  });

  let completed = 0;
  for (const booking of completable) {
    try {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED" },
        }),
        prisma.bookingEvent.create({
          data: {
            bookingId: booking.id,
            actorId: null,
            previousStatus: "CONFIRMED",
            newStatus: "COMPLETED",
            reason: "Slot time passed — system completion",
          },
        }),
      ]);
      completed++;
    } catch (err) {
      console.error(`[cron/complete-bookings] failed for ${booking.id}:`, err);
    }
  }

  return NextResponse.json({ checked: completable.length, completed });
}
