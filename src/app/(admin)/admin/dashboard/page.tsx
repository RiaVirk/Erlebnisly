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
    { label: "Total users",            value: s.totalUsers.toLocaleString("de-DE"),                     icon: "group",              alert: false },
    { label: "Hosts",                  value: s.totalHosts.toLocaleString("de-DE"),                     icon: "travel_explore",     alert: false },
    { label: "Confirmed bookings",     value: s.totalBookings.toLocaleString("de-DE"),                  icon: "confirmation_number", alert: false },
    { label: "GMV this month",         value: formatCentsEUR(s.gmv._sum.totalPriceCents ?? 0),          icon: "payments",           alert: false },
    { label: "Platform fee this month",value: formatCentsEUR(s.gmv._sum.platformFeeCents ?? 0),         icon: "account_balance",    alert: false },
    { label: "Needs review",           value: s.needsReview.toString(),                                  icon: "flag",               alert: s.needsReview > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="type-headline-md text-ds-on-surface">Platform Dashboard</h1>
        <p className="type-body-sm text-ds-on-surface-variant mt-1">Real-time platform metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {kpis.map(({ label, value, icon, alert }) => (
          <div
            key={label}
            className={`rounded-ds-lg border p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${
              alert
                ? "border-ds-error/30 bg-ds-error-container/20"
                : "bg-white border-ds-outline-variant"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="type-label-caps text-ds-on-surface-variant">{label}</p>
              <span
                className={`material-symbols-outlined text-title-sm ${alert ? "text-ds-error" : "text-ds-secondary"}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
            </div>
            <p className={`type-display-lg ${alert ? "text-ds-error" : "text-ds-on-surface"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
