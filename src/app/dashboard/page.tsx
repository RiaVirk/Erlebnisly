import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { formatCentsEUR } from "@/lib/pricing/utils";

const STATUS_CHIP: Record<string, string> = {
  CONFIRMED:            "bg-ds-secondary/10 text-ds-secondary",
  COMPLETED:            "bg-ds-surface-container text-ds-on-surface-variant",
  RESERVED_HOLD:        "bg-amber-100 text-amber-700",
  CANCELLED_BY_CUSTOMER:"bg-ds-error-container text-ds-on-error-container",
  CANCELLED_BY_HOST:    "bg-ds-error-container text-ds-on-error-container",
  CANCELLED_BY_ADMIN:   "bg-ds-error-container text-ds-on-error-container",
  REFUND_PENDING:       "bg-orange-100 text-orange-700",
  REFUNDED:             "bg-ds-surface-container-highest text-ds-on-surface-variant",
  EXPIRED_HOLD:         "bg-ds-surface-container-highest text-ds-on-surface-variant",
  NEEDS_REVIEW:         "bg-orange-100 text-orange-700",
};

function StatusChip({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full type-label-caps ${STATUS_CHIP[status] ?? "bg-ds-surface-container text-ds-on-surface-variant"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default async function DashboardPage() {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  if (role === "HOST") redirect("/host/dashboard");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/onboarding");

  const now = new Date();

  const [upcomingBookings, recentBookings, completedCount, totalSpentResult] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: user.id, status: "CONFIRMED", deletedAt: null, timeSlot: { startTime: { gte: now } } },
      include: { timeSlot: { include: { experience: { select: { title: true, timezone: true, category: { select: { name: true } } } } } } },
      orderBy: { timeSlot: { startTime: "asc" } },
      take: 3,
    }),
    prisma.booking.findMany({
      where: { userId: user.id, deletedAt: null },
      include: { timeSlot: { include: { experience: { select: { title: true, timezone: true, category: { select: { name: true } } } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.count({ where: { userId: user.id, status: "COMPLETED", deletedAt: null } }),
    prisma.booking.aggregate({
      where: { userId: user.id, status: { in: ["CONFIRMED", "COMPLETED"] }, deletedAt: null },
      _sum: { totalPriceCents: true },
    }),
  ]);

  const totalSpent = totalSpentResult._sum.totalPriceCents ?? 0;
  const nextBooking = upcomingBookings[0] ?? null;

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-ds-outline-variant h-16 flex items-center justify-between px-8 shrink-0">
        <div>
          <p className="type-body-sm text-ds-on-surface-variant">Welcome back,</p>
          <p className="type-title-sm text-ds-on-surface leading-tight">{user.name ?? "Explorer"}</p>
        </div>
        <Link
          href="/experiences"
          className="flex items-center gap-2 bg-ds-secondary text-ds-on-secondary px-4 py-2 rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-title-sm">search</span>
          Browse Experiences
        </Link>
      </header>

      <main className="flex-1 px-8 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Completed Trips", value: completedCount, sub: "experiences finished", icon: "check_circle" },
            { label: "Upcoming", value: upcomingBookings.length, sub: "confirmed bookings", icon: "event" },
            { label: "Total Spent", value: formatCentsEUR(totalSpent), sub: "across all bookings", icon: "payments" },
          ].map(({ label, value, sub, icon }) => (
            <div key={label} className="bg-white rounded-ds-lg border border-ds-outline-variant p-6 shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between mb-3">
                <p className="type-label-caps text-ds-on-surface-variant">{label}</p>
                <span className="material-symbols-outlined text-ds-secondary text-title-sm">{icon}</span>
              </div>
              <p className="type-display-lg text-ds-on-surface">{value}</p>
              <p className="type-body-sm text-ds-on-surface-variant mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Next booking */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="type-title-sm text-ds-on-surface">Next Up</h2>
            <Link href="/bookings" className="type-body-sm font-semibold text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">
              View all →
            </Link>
          </div>

          {nextBooking ? (
            <div className="bg-ds-primary-container text-white rounded-ds-lg p-6 flex items-start justify-between gap-6 shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-ds-secondary-fixed-dim text-title-sm">travel_explore</span>
                  <span className="type-label-caps text-ds-on-primary-container">
                    {nextBooking.timeSlot.experience.category.name}
                  </span>
                </div>
                <h3 className="type-title-sm">{nextBooking.timeSlot.experience.title}</h3>
                <p className="type-body-sm text-ds-on-primary-container">
                  {formatInTimeZone(nextBooking.timeSlot.startTime, nextBooking.timeSlot.experience.timezone, "EEEE, d MMMM yyyy 'at' HH:mm")}
                </p>
                <p className="type-body-sm text-ds-on-primary-container">
                  {nextBooking.participantCount} participant{nextBooking.participantCount > 1 ? "s" : ""}
                  {" · "}{formatCentsEUR(nextBooking.totalPriceCents)}
                </p>
              </div>
              <div className="shrink-0 text-right space-y-2">
                <StatusChip status="CONFIRMED" />
                <Link href={`/bookings/${nextBooking.id}/thank-you`} className="block type-body-sm text-ds-on-primary-container hover:text-white transition-colors mt-2">
                  View details →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-ds-lg border border-dashed border-ds-outline-variant p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-ds-outline mb-3 block">event_busy</span>
              <p className="type-body-sm text-ds-on-surface-variant mb-4">No upcoming bookings</p>
              <Link href="/experiences" className="bg-ds-secondary text-ds-on-secondary px-5 py-2 rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity inline-block">
                Find an experience
              </Link>
            </div>
          )}
        </section>

        {/* Upcoming list */}
        {upcomingBookings.length > 1 && (
          <section>
            <h2 className="type-title-sm text-ds-on-surface mb-4">All Upcoming</h2>
            <div className="space-y-3">
              {upcomingBookings.slice(1).map((b) => (
                <Link key={b.id} href={`/bookings/${b.id}/thank-you`}>
                  <div className="bg-white rounded-ds-lg border border-ds-outline-variant p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="type-body-sm font-semibold text-ds-on-surface">{b.timeSlot.experience.title}</p>
                        <p className="type-body-sm text-ds-on-surface-variant">
                          {formatInTimeZone(b.timeSlot.startTime, b.timeSlot.experience.timezone, "d MMM yyyy · HH:mm")}
                        </p>
                      </div>
                    </div>
                    <p className="type-body-sm font-semibold text-ds-on-surface">{formatCentsEUR(b.totalPriceCents)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Booking history table */}
        <section>
          <h2 className="type-title-sm text-ds-on-surface mb-4">Booking History</h2>
          {recentBookings.length === 0 ? (
            <div className="bg-white rounded-ds-lg border border-ds-outline-variant p-8 text-center">
              <p className="type-body-sm text-ds-on-surface-variant">
                No bookings yet.{" "}
                <Link href="/experiences" className="text-ds-secondary underline font-semibold">Browse experiences</Link>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-ds-lg border border-ds-outline-variant overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
              <table className="w-full text-left">
                <thead className="bg-ds-surface-container-low border-b border-ds-outline-variant">
                  <tr>
                    {["Experience", "Date", "Status", "Amount"].map((h) => (
                      <th key={h} className={`px-6 py-3 type-label-caps text-ds-on-surface-variant ${h === "Amount" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ds-outline-variant">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-ds-surface-container-low transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="type-body-sm font-semibold text-ds-on-surface">{b.timeSlot.experience.title}</p>
                            <p className="type-body-sm text-ds-on-surface-variant">{b.participantCount} participant{b.participantCount > 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 type-data-tabular text-ds-on-surface-variant">
                        {formatInTimeZone(b.timeSlot.startTime, b.timeSlot.experience.timezone, "d MMM yyyy")}
                      </td>
                      <td className="px-6 py-4"><StatusChip status={b.status} /></td>
                      <td className="px-6 py-4 text-right type-data-tabular font-semibold text-ds-on-surface">
                        {formatCentsEUR(b.totalPriceCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t border-ds-outline-variant text-center">
                <Link href="/bookings" className="type-body-sm font-semibold text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">
                  View all bookings →
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
