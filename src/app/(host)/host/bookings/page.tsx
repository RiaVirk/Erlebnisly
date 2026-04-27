import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { toZonedTime, format as formatTz } from "date-fns-tz";

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

export default async function HostBookingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const bookings = await prisma.booking.findMany({
    where: { deletedAt: null, timeSlot: { experience: { hostId: user.id } } },
    include: {
      timeSlot: { include: { experience: { select: { title: true, timezone: true } } } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <header className="sticky top-0 h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex justify-between items-center px-8 z-40">
        <div>
          <p className="type-label-caps text-ds-on-surface-variant">HOST PORTAL</p>
          <h1 className="type-title-sm text-ds-on-surface">Bookings</h1>
        </div>
        <p className="type-body-sm text-ds-on-surface-variant">{bookings.length} total</p>
      </header>

      <div className="p-8 max-w-360 mx-auto">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-ds-lg border border-dashed border-ds-outline-variant p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-ds-outline mb-4 block">confirmation_number</span>
            <p className="type-title-sm text-ds-on-surface mb-2">No bookings yet</p>
            <p className="type-body-sm text-ds-on-surface-variant">Bookings will appear here once customers start reserving your experiences.</p>
          </div>
        ) : (
          <div className="bg-white rounded-ds-lg border border-ds-outline-variant overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
            <table className="w-full text-left">
              <thead className="bg-ds-surface-container-low border-b border-ds-outline-variant">
                <tr>
                  {["Experience", "Date & Time", "Customer", "Participants", "Payout", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 type-label-caps text-ds-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ds-outline-variant">
                {bookings.map((b) => {
                  const tz = b.timeSlot.experience.timezone;
                  const local = toZonedTime(b.timeSlot.startTime, tz);
                  return (
                    <tr key={b.id} className="hover:bg-ds-surface-container-low transition-colors">
                      <td className="px-6 py-4">
                        <p className="type-body-sm font-semibold text-ds-on-surface">{b.timeSlot.experience.title}</p>
                      </td>
                      <td className="px-6 py-4 type-data-tabular text-ds-on-surface-variant">
                        {formatTz(local, "d MMM yyyy, HH:mm", { timeZone: tz })}
                      </td>
                      <td className="px-6 py-4 type-body-sm text-ds-on-surface">{b.user.name ?? b.user.email}</td>
                      <td className="px-6 py-4 type-data-tabular text-ds-on-surface text-center">{b.participantCount}</td>
                      <td className="px-6 py-4 type-data-tabular font-semibold text-ds-on-surface">{formatCentsEUR(b.hostPayoutCents)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full type-label-caps ${STATUS_CHIP[b.status] ?? "bg-ds-surface-container text-ds-on-surface-variant"}`}>
                          {b.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
