import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Coins, Star, Users } from "lucide-react";
import { KpiCard } from "@/components/host/KpiCard";
import { getHostKpis } from "@/lib/actions/host-stats";
import Link from "next/link";

export const metadata = { title: "Dashboard | Host" };

export default async function HostDashboardPage() {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "HOST" && role !== "ADMIN") redirect("/");

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) redirect("/onboarding");

  const kpis = await getHostKpis(dbUser.id);
  const eur = (cents: number) => `€${(cents / 100).toFixed(2)}`;

  return (
    <>
      <header className="sticky top-0 h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40">
        <div>
          <p className="type-label-caps text-ds-on-surface-variant">HOST PORTAL</p>
          <h1 className="type-title-sm text-ds-on-surface">Dashboard</h1>
        </div>
        <Link
          href="/host/experiences/new"
          className="flex items-center gap-2 bg-ds-primary text-ds-on-primary px-4 py-2 rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-title-sm">add</span>
          New Experience
        </Link>
      </header>

      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Upcoming Bookings"
            value={String(kpis.upcomingBookings)}
            icon={CalendarDays}
          />
          <KpiCard
            label="Bookings this month"
            value={String(kpis.bookingsThisMonth)}
            icon={Users}
          />
          <KpiCard
            label="Revenue this month"
            value={eur(kpis.revenueThisMonthCents)}
            icon={Coins}
            hint="After platform fee"
          />
          <KpiCard
            label="Avg. rating"
            value={kpis.averageRating !== null ? `${kpis.averageRating.toFixed(1)} / 5` : "—"}
            icon={Star}
            hint={`${kpis.totalReviews} review${kpis.totalReviews === 1 ? "" : "s"}`}
          />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Manage Experiences", href: "/host/experiences", icon: "travel_explore", desc: "Create, edit, and publish experiences" },
            { label: "View Bookings", href: "/host/bookings", icon: "confirmation_number", desc: "See all customer bookings" },
            { label: "Earnings", href: "/host/earnings", icon: "payments", desc: "Track your monthly payouts" },
          ].map(({ label, href, icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-ds-lg border border-ds-outline-variant p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] hover:border-ds-secondary/40 transition-all group"
            >
              <span className="material-symbols-outlined text-ds-secondary text-title-sm mb-3 block">{icon}</span>
              <p className="type-body-sm font-semibold text-ds-on-surface mb-1 group-hover:text-ds-secondary transition-colors">{label}</p>
              <p className="type-body-sm text-ds-on-surface-variant">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
