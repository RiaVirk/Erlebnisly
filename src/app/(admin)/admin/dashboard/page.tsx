import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths } from "date-fns";
import { formatCentsEUR } from "@/lib/pricing/utils";

export const metadata = { title: "Admin Dashboard | Erlebnisly" };

async function platformStats() {
  const [totalUsers, totalHosts, totalBookings, gmv, needsReview] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: "HOST", deletedAt: null } }),
    prisma.booking.count({
      where: { status: { in: ["CONFIRMED", "COMPLETED", "PARTIALLY_REFUNDED"] } },
    }),
    prisma.booking.aggregate({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED", "PARTIALLY_REFUNDED"] },
        createdAt: { gte: startOfMonth(subMonths(new Date(), 0)) },
      },
      _sum: { totalPriceCents: true, platformFeeCents: true },
    }),
    prisma.booking.count({ where: { status: "NEEDS_REVIEW" } }),
  ]);
  return { totalUsers, totalHosts, totalBookings, gmv, needsReview };
}

export default async function AdminDashboardPage() {
  const s = await platformStats();

  const kpis = [
    { label: "Total users", value: s.totalUsers.toLocaleString("de-DE") },
    { label: "Hosts", value: s.totalHosts.toLocaleString("de-DE") },
    { label: "Confirmed bookings", value: s.totalBookings.toLocaleString("de-DE") },
    {
      label: "GMV this month",
      value: formatCentsEUR(s.gmv._sum.totalPriceCents ?? 0),
    },
    {
      label: "Platform fee this month",
      value: formatCentsEUR(s.gmv._sum.platformFeeCents ?? 0),
    },
    {
      label: "Needs review",
      value: s.needsReview.toString(),
      alert: s.needsReview > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`rounded-lg border p-5 ${k.alert ? "border-red-300 bg-red-50" : "bg-white"}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {k.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${k.alert ? "text-red-700" : ""}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
