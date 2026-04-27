import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { Badge } from "@/components/ui/badge";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import BookingStatusPoller from "./_components/BookingStatusPoller";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CONFIRMED:      { label: "Confirmed ✓",    color: "bg-green-100 text-green-800" },
  RESERVED_HOLD:  { label: "Payment pending", color: "bg-yellow-100 text-yellow-800" },
  EXPIRED_HOLD:   { label: "Expired",         color: "bg-red-100 text-red-800" },
  NEEDS_REVIEW:   { label: "Under review",    color: "bg-orange-100 text-orange-800" },
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
      timeSlot: { include: { experience: true } },
    },
  });

  if (!booking) notFound();

  // Ownership check — customers can only see their own bookings
  if (booking.userId !== user.id && user.role !== "ADMIN") redirect("/bookings");

  const tz = booking.timeSlot.experience.timezone;
  const localStart = toZonedTime(booking.timeSlot.startTime, tz);

  const statusInfo = STATUS_LABELS[booking.status] ?? {
    label: booking.status,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="max-w-lg mx-auto py-16 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {booking.status === "CONFIRMED" ? "You're booked! 🎉" : "Booking received"}
        </h1>
        <p className="text-muted-foreground mt-2">Booking #{booking.id.slice(0, 8)}</p>
      </div>

      <div className={`rounded-xl p-4 text-center font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </div>

      <div className="border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">{booking.timeSlot.experience.title}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date & time</span>
            <span>{formatTz(localStart, "EEE, d MMM yyyy 'at' HH:mm", { timeZone: tz })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Participants</span>
            <span>{booking.participantCount}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total paid</span>
            <span>{formatCentsEUR(booking.totalPriceCents)}</span>
          </div>
        </div>
      </div>

      {/* If still pending, poll for status updates */}
      {booking.status === "RESERVED_HOLD" && (
        <BookingStatusPoller bookingId={booking.id} />
      )}
    </div>
  );
}