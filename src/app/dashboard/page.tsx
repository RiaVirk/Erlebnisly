import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  RESERVED_HOLD: "bg-amber-100 text-amber-700",
  CANCELLED_BY_CUSTOMER: "bg-red-100 text-red-600",
  CANCELLED_BY_HOST: "bg-red-100 text-red-600",
  CANCELLED_BY_ADMIN: "bg-red-100 text-red-600",
  REFUND_PENDING: "bg-orange-100 text-orange-600",
  REFUNDED: "bg-slate-100 text-slate-500",
  EXPIRED_HOLD: "bg-slate-100 text-slate-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
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
      where: {
        userId: user.id,
        status: "CONFIRMED",
        deletedAt: null,
        timeSlot: { startTime: { gte: now } },
      },
      include: {
        timeSlot: {
          include: {
            experience: {
              select: { title: true, timezone: true, category: { select: { name: true, icon: true } } },
            },
          },
        },
      },
      orderBy: { timeSlot: { startTime: "asc" } },
      take: 3,
    }),
    prisma.booking.findMany({
      where: { userId: user.id, deletedAt: null },
      include: {
        timeSlot: {
          include: {
            experience: {
              select: { title: true, timezone: true, category: { select: { name: true, icon: true } } },
            },
          },
        },
      },
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
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0">
        <div>
          <p className="text-sm text-slate-400">Welcome back,</p>
          <p className="font-semibold text-slate-900 leading-tight">{user.name ?? "Explorer"}</p>
        </div>
        <Link
          href="/experiences"
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          Browse Experiences
        </Link>
      </header>

      <main className="flex-1 px-8 py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Trips</p>
            <p className="text-4xl font-black text-slate-900 mt-2">{completedCount}</p>
            <p className="text-xs text-slate-400 mt-2">experiences finished</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming</p>
            <p className="text-4xl font-black text-slate-900 mt-2">{upcomingBookings.length}</p>
            <p className="text-xs text-slate-400 mt-2">confirmed bookings</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent</p>
            <p className="text-4xl font-black text-slate-900 mt-2">{formatCentsEUR(totalSpent)}</p>
            <p className="text-xs text-slate-400 mt-2">across all bookings</p>
          </div>
        </div>

        {/* Next booking spotlight */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Next Up</h2>
            <Link href="/bookings" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              View all →
            </Link>
          </div>

          {nextBooking ? (
            <div className="bg-slate-900 text-white rounded-2xl p-6 flex items-start justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{nextBooking.timeSlot.experience.category.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {nextBooking.timeSlot.experience.category.name}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{nextBooking.timeSlot.experience.title}</h3>
                <p className="text-slate-300 text-sm">
                  {formatInTimeZone(
                    nextBooking.timeSlot.startTime,
                    nextBooking.timeSlot.experience.timezone,
                    "EEEE, d MMMM yyyy 'at' HH:mm"
                  )}
                </p>
                <p className="text-slate-400 text-sm">
                  {nextBooking.participantCount} participant{nextBooking.participantCount > 1 ? "s" : ""}
                  {" · "}
                  {formatCentsEUR(nextBooking.totalPriceCents)}
                </p>
              </div>
              <div className="shrink-0 text-right space-y-2">
                <span className="block bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  CONFIRMED
                </span>
                <Link
                  href={`/bookings/${nextBooking.id}/thank-you`}
                  className="block text-sm font-semibold text-slate-300 hover:text-white transition-colors mt-2"
                >
                  View details →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <p className="text-slate-400 text-sm mb-3">No upcoming bookings</p>
              <Link
                href="/experiences"
                className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors inline-block"
              >
                Find an experience
              </Link>
            </div>
          )}
        </section>

        {/* Upcoming bookings list (if more than 1) */}
        {upcomingBookings.length > 1 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">All Upcoming</h2>
            <div className="space-y-3">
              {upcomingBookings.slice(1).map((b) => (
                <Link key={b.id} href={`/bookings/${b.id}/thank-you`}>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{b.timeSlot.experience.category.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{b.timeSlot.experience.title}</p>
                        <p className="text-xs text-slate-400">
                          {formatInTimeZone(b.timeSlot.startTime, b.timeSlot.experience.timezone, "d MMM yyyy · HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-slate-900">{formatCentsEUR(b.totalPriceCents)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent history table */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Booking History</h2>
          {recentBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              No bookings yet.{" "}
              <Link href="/experiences" className="text-slate-900 underline font-semibold">Browse experiences</Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{b.timeSlot.experience.category.icon}</span>
                          <div>
                            <p className="font-semibold text-sm text-slate-900">{b.timeSlot.experience.title}</p>
                            <p className="text-xs text-slate-400">
                              {b.participantCount} participant{b.participantCount > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatInTimeZone(b.timeSlot.startTime, b.timeSlot.experience.timezone, "d MMM yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-sm text-slate-900">
                        {formatCentsEUR(b.totalPriceCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t border-slate-100 text-center">
                <Link href="/bookings" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
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
