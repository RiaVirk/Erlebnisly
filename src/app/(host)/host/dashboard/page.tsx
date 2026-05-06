import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getHostKpis } from "@/lib/actions/host-stats";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";

export const metadata = { title: "Dashboard | Host Portal" };

function eur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

const STATUS_CHIP: Record<string, { cls: string; label: string }> = {
  CONFIRMED:             { cls: "bg-emerald-50 text-emerald-700",   label: "Confirmed" },
  COMPLETED:             { cls: "bg-slate-100 text-slate-600",      label: "Completed" },
  CANCELLED_BY_CUSTOMER: { cls: "bg-red-50 text-red-700",          label: "Cancelled" },
  CANCELLED_BY_HOST:     { cls: "bg-red-50 text-red-700",          label: "Cancelled" },
  REFUND_PENDING:        { cls: "bg-amber-50 text-amber-700",       label: "Refund pending" },
};

export default async function HostDashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    include: { hostProfile: true },
  });
  if (!dbUser) redirect("/onboarding");
  if (dbUser.role !== "HOST" && dbUser.role !== "ADMIN") redirect("/dashboard");

  const [kpis, recentBookings, recentExperiences, recentReviews] = await Promise.all([
    getHostKpis(dbUser.id),

    prisma.booking.findMany({
      where: { timeSlot: { experience: { hostId: dbUser.id } } },
      include: {
        user: { select: { name: true, imageUrl: true } },
        timeSlot: {
          include: { experience: { select: { title: true, timezone: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.experience.findMany({
      where: { hostId: dbUser.id, deletedAt: null },
      include: {
        category: { select: { name: true } },
        _count: { select: { reviews: true, timeSlots: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),

    prisma.review.findMany({
      where: { experience: { hostId: dbUser.id } },
      include: {
        user: { select: { name: true, imageUrl: true } },
        experience: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const hostName = dbUser.name ?? "Host";
  const hostInitials = hostName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const bio = dbUser.hostProfile?.bio ?? "Share your passion with the world through Erlebnisly.";
  const hostLocation = dbUser.hostProfile?.location ?? "Berlin";
  const totalExperiences = recentExperiences.length;
  const avgRatingDisplay = kpis.averageRating ? kpis.averageRating.toFixed(1) : "—";

  // Loyalty tier based on bookings
  const tier = kpis.bookingsThisMonth >= 20 ? "Platinum Host"
    : kpis.bookingsThisMonth >= 10 ? "Gold Host"
    : kpis.bookingsThisMonth >= 5  ? "Silver Host"
    : "Rising Host";

  const tierProgress = Math.min(100, (kpis.bookingsThisMonth / 20) * 100);

  return (
    <div className="min-h-screen bg-ds-background">

      {/* ── Topbar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-[16px] flex items-center justify-between px-4 lg:px-8 gap-4"
        style={{ boxShadow: "0 2px 20px rgba(255,77,0,0.06), 0 1px 8px rgba(0,0,0,0.05)" }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg,transparent 0%,rgba(255,77,0,0.15) 30%,rgba(255,77,0,0.15) 70%,transparent 100%)" }} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ds-on-surface-variant">Host Portal</p>
          <h1 className="text-[15px] font-bold text-ds-on-surface leading-tight tracking-tight">Overview</h1>
        </div>
        <Link
          href="/host/experiences/new"
          className="flex items-center gap-1.5 text-white text-[13px] font-bold px-4 py-2 rounded-xl hover:-translate-y-0.5 transition-all duration-200"
          style={{ background: "#FF4D00", boxShadow: "0 4px 16px rgba(255,77,0,0.35)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          New Experience
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-7 space-y-7">

        {/* ── Hero profile card ────────────────────────────────── */}
        <section
          className="rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 lg:gap-8"
          style={{ background: "rgba(255,77,0,0.03)", boxShadow: "0 0 0 1px rgba(255,77,0,0.08), 0 4px 24px rgba(0,0,0,0.05)" }}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            {dbUser.imageUrl ? (
              <img
                src={dbUser.imageUrl}
                alt={hostName}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-white"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
              />
            ) : (
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center border-4 border-white text-white text-[32px] font-extrabold"
                style={{ background: "linear-gradient(135deg,#FF4D00 0%,#b83200 100%)", boxShadow: "0 8px 32px rgba(255,77,0,0.3)" }}
              >
                {hostInitials}
              </div>
            )}
            <Link
              href="/host/settings"
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-ds-outline-variant hover:border-ds-primary transition-colors"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            >
              <span className="material-symbols-outlined text-ds-on-surface-variant" style={{ fontSize: 16 }}>edit</span>
            </Link>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
              <h2 className="text-[28px] font-extrabold text-ds-on-surface tracking-tight leading-tight">{hostName}</h2>
              <span
                className="px-3 py-1 text-[11px] font-bold rounded-full w-fit mx-auto md:mx-0"
                style={{ background: "rgba(255,77,0,0.1)", color: "#FF4D00" }}
              >
                VERIFIED HOST
              </span>
              {dbUser.hostProfile?.isVerified && (
                <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </div>
            <p className="text-[14px] text-ds-on-surface-variant leading-relaxed max-w-2xl">{bio}</p>
            <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
              <span className="flex items-center gap-1.5 text-[13px] text-ds-on-surface-variant">
                <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 16 }}>location_on</span>
                {hostLocation}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-ds-on-surface-variant">
                <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 16 }}>mail</span>
                {dbUser.email ?? "—"}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-ds-on-surface-variant">
                <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 16 }}>travel_explore</span>
                {totalExperiences} experience{totalExperiences !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="flex md:flex-col gap-4 md:gap-3 shrink-0">
            <div className="text-center">
              <p className="text-[24px] font-extrabold text-ds-primary leading-none">{avgRatingDisplay}</p>
              <p className="text-[11px] text-ds-on-surface-variant mt-0.5">Avg rating</p>
            </div>
            <div className="w-px md:w-full md:h-px bg-ds-outline-variant" />
            <div className="text-center">
              <p className="text-[24px] font-extrabold text-ds-on-surface leading-none">{kpis.totalReviews}</p>
              <p className="text-[11px] text-ds-on-surface-variant mt-0.5">Reviews</p>
            </div>
          </div>
        </section>

        {/* ── Main grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left column (4 cols) ─────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Host tier card */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#FF4D00 0%,#b83200 100%)", boxShadow: "0 8px 32px rgba(255,77,0,0.40)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />
              <span className="material-symbols-outlined absolute -right-3 -bottom-3 text-white/10 pointer-events-none select-none"
                style={{ fontSize: 100, fontVariationSettings: "'FILL' 1", lineHeight: 1 }}>
                military_tech
              </span>
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 mb-1">Host Status</p>
                <h3 className="text-[22px] font-extrabold text-white tracking-tight">{tier}</h3>
                <div className="w-full h-1.5 rounded-full mt-3 mb-1.5" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${tierProgress}%` }} />
                </div>
                <p className="text-[11px] text-white/70">
                  {Math.max(0, 20 - kpis.bookingsThisMonth)} bookings to Platinum
                </p>
              </div>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Upcoming", value: kpis.upcomingBookings, icon: "event", bg: "bg-blue-50", color: "text-blue-600" },
                { label: "This month", value: kpis.bookingsThisMonth, icon: "confirmation_number", bg: "bg-violet-50", color: "text-violet-600" },
              ].map(({ label, value, icon, bg, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-ds-outline-variant p-5"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <span className={`material-symbols-outlined ${color}`} style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <p className="text-[28px] font-extrabold text-ds-on-surface leading-none">{value}</p>
                  <p className="text-[12px] text-ds-on-surface-variant mt-1">{label}</p>
                </div>
              ))}
              <div className="col-span-2 bg-white rounded-2xl border border-ds-outline-variant p-5"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] font-bold uppercase tracking-[0.07em] text-ds-on-surface-variant">Revenue this month</p>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,77,0,0.1)" }}>
                    <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>payments</span>
                  </div>
                </div>
                <p className="text-[32px] font-extrabold text-ds-primary leading-none tracking-tight">
                  {eur(kpis.revenueThisMonthCents)}
                </p>
                <p className="text-[12px] text-ds-on-surface-variant mt-1">After platform fee</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-ds-outline-variant overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <p className="px-5 pt-4 pb-3 text-[13px] font-bold text-ds-on-surface">Quick Actions</p>
              {[
                { label: "Add New Experience",  sub: "Create & publish",        icon: "add_circle",         href: "/host/experiences/new" },
                { label: "View All Bookings",   sub: "Manage reservations",     icon: "confirmation_number", href: "/host/bookings" },
                { label: "Check Schedule",      sub: "Availability calendar",   icon: "calendar_month",      href: "/host/availability" },
                { label: "Earnings Report",     sub: "Monthly payouts",         icon: "bar_chart",           href: "/host/earnings" },
              ].map(({ label, sub, icon, href }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-ds-surface-container-low transition-colors border-t border-ds-outline-variant/50 first:border-t-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,77,0,0.08)" }}>
                    <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 16 }}>{icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ds-on-surface">{label}</p>
                    <p className="text-[11px] text-ds-on-surface-variant">{sub}</p>
                  </div>
                  <span className="material-symbols-outlined text-ds-outline ml-auto shrink-0" style={{ fontSize: 16 }}>chevron_right</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right column (8 cols) ────────────────────────── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Recent bookings */}
            <div className="bg-white rounded-2xl border border-ds-outline-variant overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <h3 className="text-[16px] font-bold text-ds-on-surface">Recent Bookings</h3>
                <Link href="/host/bookings" className="text-[13px] font-semibold text-ds-on-surface-variant hover:text-ds-primary transition-colors">
                  View all →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr>
                      {["Guest", "Experience", "Date", "Status", "Amount"].map((h, i) => (
                        <th key={h} className={`px-6 py-2.5 text-[11px] font-bold tracking-[0.07em] uppercase text-ds-on-surface-variant bg-ds-surface-container-low border-b border-ds-outline-variant ${i >= 3 ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-[14px] text-ds-on-surface-variant">No bookings yet.</td></tr>
                    ) : recentBookings.map((b) => {
                      const chip = STATUS_CHIP[b.status] ?? { cls: "bg-slate-100 text-slate-600", label: b.status };
                      const tz = b.timeSlot.experience.timezone;
                      const dateStr = formatInTimeZone(b.timeSlot.startTime, tz, "d MMM yyyy");
                      return (
                        <tr key={b.id} className="border-b border-ds-outline-variant/50 last:border-0 hover:bg-ds-surface-container-low transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2.5">
                              {b.user.imageUrl ? (
                                <img src={b.user.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-ds-surface-container-high flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-ds-on-surface-variant" style={{ fontSize: 16 }}>person</span>
                                </div>
                              )}
                              <p className="text-[13px] font-semibold text-ds-on-surface truncate max-w-[100px]">{b.user.name ?? "Guest"}</p>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-[13px] text-ds-on-surface-variant max-w-[160px]">
                            <p className="truncate">{b.timeSlot.experience.title}</p>
                          </td>
                          <td className="px-6 py-3 text-[13px] tabular-nums text-ds-on-surface-variant">{dateStr}</td>
                          <td className="px-6 py-3 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${chip.cls}`}>{chip.label}</span>
                          </td>
                          <td className="px-6 py-3 text-right text-[13px] font-bold text-ds-on-surface tabular-nums">{eur(b.totalPriceCents)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Experiences */}
            <div className="bg-white rounded-2xl border border-ds-outline-variant overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <h3 className="text-[16px] font-bold text-ds-on-surface">My Experiences</h3>
                <Link href="/host/experiences" className="text-[13px] font-semibold text-ds-on-surface-variant hover:text-ds-primary transition-colors">
                  Manage all →
                </Link>
              </div>
              {recentExperiences.length === 0 ? (
                <div className="px-6 pb-8 text-center">
                  <span className="material-symbols-outlined text-ds-outline text-5xl block mb-3 mt-4">travel_explore</span>
                  <p className="text-[15px] font-semibold text-ds-on-surface mb-1">No experiences yet</p>
                  <p className="text-[13px] text-ds-on-surface-variant mb-4">Create your first experience to start receiving bookings.</p>
                  <Link href="/host/experiences/new"
                    className="inline-flex items-center gap-1.5 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl"
                    style={{ background: "#FF4D00", boxShadow: "0 4px 16px rgba(255,77,0,0.35)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    Create Experience
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-5 pb-5">
                  {recentExperiences.map((e) => (
                    <Link key={e.id} href={`/host/experiences/${e.id}`}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-ds-outline-variant hover:border-ds-primary/30 hover:bg-ds-surface-container-low transition-all">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-ds-surface-container">
                        {e.images[0] ? (
                          <img src={e.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(255,77,0,0.08)" }}>
                            <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 22 }}>travel_explore</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-ds-on-surface truncate">{e.title}</p>
                        <p className="text-[11px] text-ds-on-surface-variant">{e.category.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-ds-on-surface-variant">{e._count.reviews} reviews</span>
                          <span className="text-ds-outline">·</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${e.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {e.isPublished ? "Live" : "Draft"}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-ds-outline shrink-0" style={{ fontSize: 16 }}>chevron_right</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent reviews */}
            {recentReviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-ds-outline-variant overflow-hidden"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                  <h3 className="text-[16px] font-bold text-ds-on-surface">Recent Reviews</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-[14px] font-bold text-ds-on-surface">{avgRatingDisplay}</span>
                    <span className="text-[12px] text-ds-on-surface-variant">({kpis.totalReviews})</span>
                  </div>
                </div>
                <div className="divide-y divide-ds-outline-variant/50">
                  {recentReviews.map((r) => (
                    <div key={r.id} className="px-6 py-4 flex items-start gap-3">
                      {r.user.imageUrl ? (
                        <img src={r.user.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-ds-surface-container-high flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-ds-on-surface-variant" style={{ fontSize: 18 }}>person</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-[13px] font-semibold text-ds-on-surface">{r.user.name ?? "Guest"}</p>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-amber-400"
                                style={{ fontSize: 13, fontVariationSettings: i < r.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-ds-on-surface-variant mb-1">{r.experience.title}</p>
                        {r.comment && <p className="text-[13px] text-ds-on-surface-variant leading-relaxed italic">"{r.comment}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
