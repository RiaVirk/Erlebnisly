import { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { promoteNextWaitlistEntry } from "@/lib/waitlist-promotion";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Two cases that need a promotion attempt:
  // 1. Never promoted — booking may have been cancelled freeing capacity
  // 2. Previously promoted but the offer expired — next person must be promoted
  const slotsNeedingPromotion = await prisma.waitlistEntry.findMany({
    where: {
      claimedAt: null,
      OR: [
        { promotedAt: null },
        {
          promotedAt: { not: null },
          promotionExpiresAt: { lt: new Date() },
        },
      ],
    },
    select: { timeSlotId: true },
    distinct: ["timeSlotId"],
  });

  let promoted = 0;
  for (const { timeSlotId } of slotsNeedingPromotion) {
    // promoteNextWaitlistEntry guards against full slots internally — safe to call always
    await promoteNextWaitlistEntry(timeSlotId).catch((err) =>
      console.error(`[cron/promote-waitlist] ${timeSlotId}:`, err)
    );
    promoted++;
  }

  return Response.json({ promoted, checkedSlots: slotsNeedingPromotion.length });
}
