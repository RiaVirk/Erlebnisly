import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toZonedTime } from "date-fns-tz";
import CalendarView from "./_components/CalendarView";

export const metadata = { title: "Calendar | Erlebnisly" };

export default async function CalendarPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/onboarding");

  // Fetch bookings for the next 12 months + last 2 months so the calendar
  // has enough data to navigate through without a loading state.
  const rangeStart = new Date();
  rangeStart.setMonth(rangeStart.getMonth() - 2);
  rangeStart.setDate(1);

  const rangeEnd = new Date();
  rangeEnd.setMonth(rangeEnd.getMonth() + 12);

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      status: { in: ["CONFIRMED", "COMPLETED", "RESERVED_HOLD"] },
      timeSlot: { startTime: { gte: rangeStart, lte: rangeEnd } },
    },
    include: {
      timeSlot: {
        include: {
          experience: {
            select: { title: true, timezone: true, location: true },
          },
        },
      },
    },
    orderBy: { timeSlot: { startTime: "asc" } },
  });

  // Serialize for the client — convert UTC to the experience's local timezone
  const events = bookings.map((b) => {
    const tz = b.timeSlot.experience.timezone;
    const local = toZonedTime(b.timeSlot.startTime, tz);
    return {
      id: b.id,
      title: b.timeSlot.experience.title,
      location: b.timeSlot.experience.location,
      status: b.status,
      totalPriceCents: b.totalPriceCents,
      participantCount: b.participantCount,
      // YYYY-MM-DD in the experience's local timezone
      dateKey: `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`,
      timeLabel: local.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: tz }),
      timezone: tz,
    };
  });

  return (
    <>
      <header className="sticky top-0 h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40">
        <div>
          <p className="type-label-caps text-ds-on-surface-variant">MY ACCOUNT</p>
          <h1 className="type-title-sm text-ds-on-surface">Calendar</h1>
        </div>
        <p className="type-body-sm text-ds-on-surface-variant">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} scheduled
        </p>
      </header>

      <div className="p-8 max-w-5xl mx-auto">
        <CalendarView events={events} />
      </div>
    </>
  );
}
