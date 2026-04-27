import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

// This route is called by Vercel Cron every minute.
// It finds all RESERVED_HOLD bookings whose holdExpiresAt has passed
// and transitions them to EXPIRED_HOLD.

export async function GET(req: NextRequest) {
  // Verify this request is from the cron runner, not a random visitor
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();

  // Find all expired holds
  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: "RESERVED_HOLD",
      holdExpiresAt: { lt: now }, // holdExpiresAt < now
    },
    select: { id: true, status: true },
  });

  let successCount = 0;
  const errors: string[] = [];

  // Process each expired booking individually so one failure doesn't block others
  for (const booking of expiredBookings) {
    try {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "EXPIRED_HOLD" },
        }),
        prisma.bookingEvent.create({
          data: {
            bookingId: booking.id,
            actorId: null, // system triggered
            previousStatus: "RESERVED_HOLD",
            newStatus: "EXPIRED_HOLD",
            reason: "Reservation hold timed out after 15 minutes",
          },
        }),
      ]);
      successCount++;
    } catch (err) {
      console.error(`[expire-holds] failed for booking ${booking.id}:`, err);
      errors.push(booking.id);
    }
  }

  console.log(
    `[expire-holds] Expired ${successCount}/${expiredBookings.length} holds. Errors: ${errors.length}`
  );

  return NextResponse.json({
    processed: expiredBookings.length,
    expired: successCount,
    errors,
  });
}