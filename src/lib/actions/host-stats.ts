"server-only";

import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format } from "date-fns";

export interface HostKpis {
  upcomingBookings: number;
  bookingsThisMonth: number;
  revenueThisMonthCents: number;
  averageRating: number | null;
  totalReviews: number;
}

export async function getHostKpis(hostUserId: string): Promise<HostKpis> {
  const monthStart = startOfMonth(new Date());

  const [upcoming, thisMonth, ratingAgg] = await Promise.all([
    prisma.booking.count({
      where: {
        status: "CONFIRMED",
        timeSlot: {
          startTime: { gte: new Date() },
          experience: { hostId: hostUserId },
        },
      },
    }),
    prisma.booking.aggregate({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED", "PARTIALLY_REFUNDED"] },
        createdAt: { gte: monthStart },
        timeSlot: { experience: { hostId: hostUserId } },
      },
      _count: true,
      _sum: { hostPayoutCents: true },
    }),
    prisma.review.aggregate({
      where: { experience: { hostId: hostUserId } },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  return {
    upcomingBookings: upcoming,
    bookingsThisMonth: thisMonth._count,
    revenueThisMonthCents: thisMonth._sum.hostPayoutCents ?? 0,
    averageRating: ratingAgg._avg.rating,
    totalReviews: ratingAgg._count,
  };
}

export interface MonthlyEarning {
  month: string;
  earningsCents: number;
}

export async function getMonthlyEarnings(
  hostUserId: string,
  monthsBack = 12,
): Promise<MonthlyEarning[]> {
  const since = startOfMonth(subMonths(new Date(), monthsBack - 1));

  // Prisma groupBy has no date_trunc support — raw SQL stays O(months) not O(bookings).
  const rows = await prisma.$queryRaw<
    Array<{ month: Date; total: bigint }>
  >`
    SELECT
      date_trunc('month', b."createdAt") AS month,
      COALESCE(SUM(b."hostPayoutCents"), 0)::bigint AS total
    FROM "Booking" b
    JOIN "TimeSlot" t ON t.id = b."timeSlotId"
    JOIN "Experience" e ON e.id = t."experienceId"
    WHERE e."hostId" = ${hostUserId}
      AND b.status IN ('CONFIRMED', 'COMPLETED', 'PARTIALLY_REFUNDED')
      AND b."createdAt" >= ${since}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  // Fill missing months so the chart has no gaps.
  const series: MonthlyEarning[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const m = startOfMonth(subMonths(new Date(), i));
    const found = rows.find((r) => r.month.getTime() === m.getTime());
    series.push({
      month: format(m, "MMM yyyy"),
      earningsCents: Number(found?.total ?? 0n),
    });
  }
  return series;
}
