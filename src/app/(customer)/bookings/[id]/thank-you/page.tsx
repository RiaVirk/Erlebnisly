import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import BookingStatusPoller from "./_components/BookingStatusPoller";
import Link from "next/link";

const STATUS_INFO: Record<string, { label: string; chipClass: string; icon: string }> = {
  CONFIRMED:     { label: "Confirmed",       chipClass: "bg-ds-secondary/10 text-ds-secondary",          icon: "check_circle" },
  RESERVED_HOLD: { label: "Payment pending", chipClass: "bg-amber-100 text-amber-700",                   icon: "schedule" },
  EXPIRED_HOLD:  { label: "Expired",         chipClass: "bg-ds-error-container text-ds-on-error-container", icon: "cancel" },
  NEEDS_REVIEW:  { label: "Under review",    chipClass: "bg-orange-100 text-orange-700",                 icon: "pending" },
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
    include: { timeSlot: { include: { experience: true } } },
  });
  if (!booking) notFound();
  if (booking.userId !== user.id && user.role !== "ADMIN") redirect("/bookings");

  const tz = booking.timeSlot.experience.timezone;
  const localStart = toZonedTime(booking.timeSlot.startTime, tz);

  const statusInfo = STATUS_INFO[booking.status] ?? {
    label: booking.status.replace(/_/g, " "),
    chipClass: "bg-ds-surface-container text-ds-on-surface-variant",
    icon: "info",
  };

  return (
    <div className="max-w-lg mx-auto py-16 px-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="material-symbols-outlined text-5xl text-ds-secondary block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
          {booking.status === "CONFIRMED" ? "celebration" : "receipt_long"}
        </span>
        <h1 className="type-headline-md text-ds-on-surface">
          {booking.status === "CONFIRMED" ? "You're booked!" : "Booking received"}
        </h1>
        <p className="type-body-sm text-ds-on-surface-variant">
          Reference #{booking.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Status chip */}
      <div className={`flex items-center justify-center gap-2 rounded-ds-lg px-4 py-3 type-label-caps ${statusInfo.chipClass}`}>
        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{statusInfo.icon}</span>
        {statusInfo.label}
      </div>

      {/* Booking detail card */}
      <div className="bg-white rounded-ds-lg border border-ds-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="px-6 py-4 border-b border-ds-outline-variant">
          <h2 className="type-title-sm text-ds-on-surface">{booking.timeSlot.experience.title}</h2>
          <p className="type-body-sm text-ds-on-surface-variant">{booking.timeSlot.experience.location}</p>
        </div>
        <div className="px-6 py-4 space-y-3">
          {[
            { label: "Date & time", value: formatTz(localStart, "EEE, d MMM yyyy 'at' HH:mm", { timeZone: tz }) },
            { label: "Participants", value: String(booking.participantCount) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="type-body-sm text-ds-on-surface-variant">{label}</span>
              <span className="type-body-sm text-ds-on-surface">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-ds-outline-variant pt-3 mt-1">
            <span className="type-body-sm font-semibold text-ds-on-surface">Total paid</span>
            <span className="type-body-sm font-bold text-ds-on-surface">{formatCentsEUR(booking.totalPriceCents)}</span>
          </div>
        </div>
      </div>

      {booking.status === "RESERVED_HOLD" && (
        <BookingStatusPoller bookingId={booking.id} />
      )}

      <div className="flex justify-center">
        <Link
          href="/bookings"
          className="type-body-sm text-ds-on-surface-variant hover:text-ds-on-surface transition-colors"
        >
          ← Back to my bookings
        </Link>
      </div>
    </div>
  );
}
