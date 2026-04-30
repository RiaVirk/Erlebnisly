import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { subYears } from "date-fns";

// Run weekly: cron "0 4 * * 0"
// Hard-deletes anonymized users whose last booking is older than 10 years,
// satisfying both GDPR Art. 17 (erasure) and §257 HGB (10-year retention).
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const cutoff = subYears(new Date(), 10);

  const stale = await prisma.user.findMany({
    where: {
      anonymizedAt: { lt: cutoff },
      bookings: { every: { createdAt: { lt: cutoff } } },
    },
    select: { id: true },
  });

  for (const u of stale) {
    await prisma.user.delete({ where: { id: u.id } });
  }

  return NextResponse.json({ deleted: stale.length });
}
