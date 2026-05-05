import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import { env } from "@/lib/env";
import BookingStatusPoller from "./_components/BookingStatusPoller";
import { BookingAiChat } from "./_components/BookingAiChat";
import Link from "next/link";

const STATUS_INFO: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  CONFIRMED:     { label: "Confirmed",       bg: "bg-[#d1fae5]", text: "text-[#065f46]", icon: "check_circle" },
  RESERVED_HOLD: { label: "Payment pending", bg: "bg-amber-100",  text: "text-amber-700", icon: "schedule" },
  EXPIRED_HOLD:  { label: "Expired",         bg: "bg-red-100",    text: "text-red-700",   icon: "cancel" },
  NEEDS_REVIEW:  { label: "Under review",    bg: "bg-orange-100", text: "text-orange-700",icon: "pending" },
};

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      timeSlot: {
        include: {
          experience: {
            include: { category: { select: { name: true } } },
          },
        },
      },
    },
  });
  if (!booking) notFound();
  if (booking.userId !== user.id && user.role !== "ADMIN") redirect("/bookings");

  const exp   = booking.timeSlot.experience;
  const tz    = exp.timezone;
  const local = toZonedTime(booking.timeSlot.startTime, tz);
  const localEnd = toZonedTime(
    new Date(booking.timeSlot.startTime.getTime() + exp.durationMinutes * 60_000), tz
  );

  const dateLabel  = formatTz(local,    "EEE, d MMM yyyy", { timeZone: tz });
  const timeLabel  = formatTz(local,    "HH:mm",           { timeZone: tz });
  const timeEnd    = formatTz(localEnd, "HH:mm",           { timeZone: tz });
  const ref        = booking.id.slice(0, 8).toUpperCase();
  const statusInfo = STATUS_INFO[booking.status] ?? {
    label: booking.status.replace(/_/g, " "),
    bg: "bg-ds-surface-container", text: "text-ds-on-surface-variant", icon: "info",
  };
  const isConfirmed = booking.status === "CONFIRMED";
  const mapsKey    = env.GOOGLE_MAPS_API_KEY;
  const mapSrc     = exp.latitude && exp.longitude
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${exp.latitude},${exp.longitude}&zoom=15`
    : `https://www.google.com/maps/embed/v1/search?key=${mapsKey}&q=${encodeURIComponent(exp.location + ", Germany")}`;
  const heroImg    = exp.images?.[0] ?? null;
  const perPerson  = Math.round(booking.totalPriceCents / booking.participantCount);

  // Context string passed to Gemini so it can answer booking-specific questions
  const aiContext = [
    `Booking reference: #${ref}`,
    `Experience: ${exp.title}`,
    `Category: ${exp.category.name}`,
    `Location: ${exp.location}`,
    `Date: ${dateLabel} at ${timeLabel}–${timeEnd}`,
    `Duration: ${exp.durationMinutes} minutes`,
    `Participants: ${booking.participantCount}`,
    `Total paid: €${(booking.totalPriceCents / 100).toFixed(2)}`,
    `Status: ${booking.status}`,
  ].join("\n");

  return (
    <div className="min-h-screen bg-ds-background">

      {/* ── Success hero ──────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center pt-12 pb-8 px-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-sm ${isConfirmed ? "bg-[#d1fae5]" : "bg-amber-100"}`}>
          <span
            className={`material-symbols-outlined text-[48px] ${isConfirmed ? "text-[#065f46]" : "text-amber-700"}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isConfirmed ? "check_circle" : "receipt_long"}
          </span>
        </div>
        <h1 className="type-display-lg text-ds-on-surface mb-2">
          {isConfirmed ? "Booking Confirmed!" : "Booking Received"}
        </h1>
        <p className="type-body-md text-ds-on-surface-variant max-w-md">
          {isConfirmed
            ? "Your reservation has been successfully processed. You're all set for your upcoming activity."
            : "We've received your booking and are processing your payment."}
        </p>
        <span className="mt-3 type-label-caps text-ds-on-surface-variant tracking-widest">
          REFERENCE #{ref}
        </span>
      </div>

      {/* ── Bento grid ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT column ─────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Activity card */}
            <div className="bg-white rounded-ds-xl border border-ds-outline-variant shadow-sm overflow-hidden">
              {/* Image banner */}
              {heroImg && (
                <div className="relative h-52 overflow-hidden bg-ds-surface-container">
                  <img src={heroImg} alt={exp.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span
                    className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full type-label-caps ${statusInfo.bg} ${statusInfo.text}`}
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{statusInfo.icon}</span>
                    {statusInfo.label}
                  </span>
                  <div className="absolute bottom-4 left-4">
                    <span className="type-label-caps text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {exp.category.name}
                    </span>
                  </div>
                </div>
              )}

              <div className="px-6 py-5">
                {!heroImg && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full type-label-caps mb-3 ${statusInfo.bg} ${statusInfo.text}`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{statusInfo.icon}</span>
                    {statusInfo.label}
                  </span>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="type-headline-md text-ds-on-surface">{exp.title}</h2>
                    <p className="type-body-sm text-ds-on-surface-variant mt-0.5">{exp.category.name}</p>
                  </div>
                  <span className="type-label-caps text-ds-on-surface-variant whitespace-nowrap">ID: #{ref}</span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-ds-outline-variant pt-5">
                  <div className="flex items-center gap-2.5 text-ds-on-surface-variant">
                    <span className="material-symbols-outlined text-ds-outline" style={{ fontSize: 18 }}>calendar_today</span>
                    <span className="type-body-sm text-ds-on-surface">{dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-ds-on-surface-variant">
                    <span className="material-symbols-outlined text-ds-outline" style={{ fontSize: 18 }}>schedule</span>
                    <span className="type-body-sm text-ds-on-surface">{timeLabel} – {timeEnd}</span>
                  </div>
                  <div className="flex items-center gap-2.5 col-span-full">
                    <span className="material-symbols-outlined text-ds-outline" style={{ fontSize: 18 }}>location_on</span>
                    <span className="type-body-sm text-ds-on-surface">{exp.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-ds-outline" style={{ fontSize: 18 }}>group</span>
                    <span className="type-body-sm text-ds-on-surface">{booking.participantCount} participant{booking.participantCount > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-ds-outline" style={{ fontSize: 18 }}>timer</span>
                    <span className="type-body-sm text-ds-on-surface">
                      {exp.durationMinutes >= 60
                        ? `${Math.round(exp.durationMinutes / 60 * 10) / 10}h`
                        : `${exp.durationMinutes} min`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="bg-white rounded-ds-xl border border-ds-outline-variant shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.04] pointer-events-none select-none">
                <span className="material-symbols-outlined" style={{ fontSize: 120 }}>assignment_turned_in</span>
              </div>
              <h3 className="type-title-sm text-ds-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 20 }}>checklist</span>
                Next Steps
              </h3>
              <div className="space-y-5 relative z-10">
                {[
                  {
                    n: "1", title: "Check your email",
                    desc: "A detailed confirmation and digital ticket has been sent to your inbox.",
                  },
                  {
                    n: "2", title: "Add to your calendar",
                    desc: "Sync this event to your calendar so you never miss it.",
                  },
                  {
                    n: "3", title: "Arrive 15 minutes early",
                    desc: "Give yourself time to check in and prepare before the activity starts.",
                  },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-ds-surface-container-low border border-ds-outline-variant flex items-center justify-center shrink-0 type-label-caps text-ds-on-surface">
                      {n}
                    </div>
                    <div>
                      <p className="type-body-sm font-semibold text-ds-on-surface">{title}</p>
                      <p className="type-body-sm text-ds-on-surface-variant mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT column ────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Transaction summary */}
            <div className="bg-ds-surface-container-low rounded-ds-xl border border-ds-outline-variant p-6">
              <h3 className="type-label-caps text-ds-on-surface-variant tracking-widest uppercase mb-5">
                Transaction Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between type-body-sm">
                  <span className="text-ds-on-surface-variant">
                    Activity fee × {booking.participantCount}
                  </span>
                  <span className="text-ds-on-surface">{formatCentsEUR(perPerson)} × {booking.participantCount}</span>
                </div>
                <div className="flex justify-between type-body-sm">
                  <span className="text-ds-on-surface-variant">Service fee</span>
                  <span className="text-ds-on-surface">Included</span>
                </div>
                <div className="flex justify-between type-body-sm">
                  <span className="text-ds-on-surface-variant">VAT (19%)</span>
                  <span className="text-ds-on-surface">Included</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-ds-outline-variant">
                  <span className="type-title-sm text-ds-on-surface">Total Paid</span>
                  <span className="type-title-sm font-bold text-ds-primary">{formatCentsEUR(booking.totalPriceCents)}</span>
                </div>
              </div>

              <a
                href="#"
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-ds-outline-variant rounded-ds type-body-sm text-ds-on-surface hover:bg-ds-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                Download Receipt (PDF)
              </a>
            </div>

            {/* Google Maps */}
            {mapsKey && (
              <div className="bg-white rounded-ds-xl border border-ds-outline-variant overflow-hidden shadow-sm">
                <div className="h-48">
                  <iframe
                    title="Activity location"
                    width="100%" height="100%"
                    className="border-0 block"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapSrc}
                  />
                </div>
                <div className="px-4 py-3 flex items-center gap-2 border-t border-ds-outline-variant">
                  <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 16 }}>location_on</span>
                  <span className="type-body-sm text-ds-on-surface-variant truncate">{exp.location}</span>
                  <a
                    href={exp.latitude && exp.longitude
                      ? `https://www.google.com/maps?q=${exp.latitude},${exp.longitude}`
                      : `https://www.google.com/maps/search/${encodeURIComponent(exp.location + ", Germany")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="ml-auto type-label-caps text-ds-primary hover:underline whitespace-nowrap shrink-0"
                  >
                    Get directions →
                  </a>
                </div>
              </div>
            )}

            {/* AI Assistance — Gemini-powered, booking-context-aware */}
            <BookingAiChat context={aiContext} />

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Link
                href="/bookings"
                className="w-full py-3.5 bg-ds-primary text-ds-on-primary rounded-ds type-body-sm font-semibold shadow-[0_4px_16px_rgba(255,77,0,0.3)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                View My Bookings
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </Link>
              <Link
                href="/dashboard"
                className="w-full py-3.5 bg-white text-ds-on-surface border border-ds-outline-variant rounded-ds type-body-sm font-semibold hover:bg-ds-surface-container-low active:scale-[0.98] transition-all text-center"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* ── Feedback row ────────────────────────────────────────── */}
        <div className="mt-10 border-t border-ds-outline-variant pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="type-body-sm text-ds-on-surface-variant">How was your booking experience?</p>
          <div className="flex gap-2">
            {["Excellent", "Good", "Issues Found"].map((label) => (
              <button
                key={label}
                className="px-4 py-2 rounded-full border border-ds-outline-variant type-body-sm text-ds-on-surface-variant hover:bg-ds-surface-container hover:border-ds-outline transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Policy footer ───────────────────────────────────────── */}
        <div className="mt-10 border-t border-ds-outline-variant pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="type-label-caps text-ds-on-surface uppercase tracking-widest mb-4">Activity Policy</h4>
            <ul className="space-y-2.5">
              {[
                "Cancellations allowed up to 48 hours before the start time.",
                "Please bring appropriate clothing and footwear.",
                "Safety guidelines will be briefed on arrival.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 type-body-sm text-ds-on-surface-variant">
                  <span className="material-symbols-outlined text-ds-outline shrink-0 mt-0.5" style={{ fontSize: 15 }}>info</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="type-label-caps text-ds-on-surface uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/agb" className="type-body-sm text-ds-primary hover:underline flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="type-body-sm text-ds-primary hover:underline flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="type-body-sm text-ds-primary hover:underline flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                  Manage Bookings
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {booking.status === "RESERVED_HOLD" && (
        <BookingStatusPoller bookingId={booking.id} />
      )}
    </div>
  );
}
