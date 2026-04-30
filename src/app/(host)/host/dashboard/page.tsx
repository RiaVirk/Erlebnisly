import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Coins, Star, Users } from "lucide-react";
import { KpiCard } from "@/components/host/KpiCard";
import { getHostKpis } from "@/lib/actions/host-stats";

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
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Bevorstehende Buchungen"
          value={String(kpis.upcomingBookings)}
          icon={CalendarDays}
        />
        <KpiCard
          label="Buchungen diesen Monat"
          value={String(kpis.bookingsThisMonth)}
          icon={Users}
        />
        <KpiCard
          label="Einnahmen diesen Monat"
          value={eur(kpis.revenueThisMonthCents)}
          icon={Coins}
          hint="Nach Plattformgebühr"
        />
        <KpiCard
          label="Ø Bewertung"
          value={
            kpis.averageRating !== null
              ? `${kpis.averageRating.toFixed(1)} / 5`
              : "—"
          }
          icon={Star}
          hint={`${kpis.totalReviews} Bewertung${kpis.totalReviews === 1 ? "" : "en"}`}
        />
      </div>
    </div>
  );
}
