import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import Link from "next/link";
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

export default async function CustomerBookingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id, deletedAt: null },
    include: { timeSlot: { include: { experience: { select: { title: true, timezone: true, category: { select: { name: true } } } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <header className="sticky top-0 h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex justify-between items-center px-8 z-40">
        <div>
          <p className="type-label-caps text-ds-on-surface-variant">MY ACCOUNT</p>
          <h1 className="type-title-sm text-ds-on-surface">My Bookings</h1>
        </div>
        <Link href="/experiences" className="flex items-center gap-2 bg-ds-primary text-ds-on-primary px-4 py-2 rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-title-sm">search</span>Browse More
        </Link>
      </header>

      <div className="p-8 max-w-360 mx-auto">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-ds-lg border border-dashed border-ds-outline-variant p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-ds-outline mb-4 block">confirmation_number</span>
            <p className="type-title-sm text-ds-on-surface mb-2">No bookings yet</p>
            <p className="type-body-sm text-ds-on-surface-variant mb-6">Browse experiences and book your first adventure.</p>
            <Link href="/experiences" className="inline-flex items-center gap-2 bg-ds-primary text-ds-on-primary px-5 py-2.5 rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-title-sm">search</span>Browse experiences
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-ds-lg border border-ds-outline-variant overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
            <table className="w-full text-left">
              <thead className="bg-ds-surface-container-low border-b border-ds-outline-variant">
                <tr>
                  {["Experience", "Date & Time", "Participants", "Status", "Total"].map((h) => (
                    <th key={h} className={`px-6 py-3 type-label-caps text-ds-on-surface-variant ${h === "Total" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ds-outline-variant">
                {bookings.map((b) => {
                  const tz = b.timeSlot.experience.timezone;
                  const local = toZonedTime(b.timeSlot.startTime, tz);
                  return (
                    <tr key={b.id} className="hover:bg-ds-surface-container-low transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <Link href={`/bookings/${b.id}/thank-you`} className="flex items-center gap-3">
                          <div>
                            <p className="type-body-sm font-semibold text-ds-on-surface">{b.timeSlot.experience.title}</p>
                            <p className="type-body-sm text-ds-on-surface-variant">{b.timeSlot.experience.category.name}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 type-data-tabular text-ds-on-surface-variant">
                        {formatTz(local, "EEE, d MMM yyyy 'at' HH:mm", { timeZone: tz })}
                      </td>
                      <td className="px-6 py-4 type-data-tabular text-ds-on-surface text-center">{b.participantCount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full type-label-caps ${STATUS_CHIP[b.status] ?? "bg-ds-surface-container text-ds-on-surface-variant"}`}>
                          {b.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right type-data-tabular font-semibold text-ds-on-surface">
                        {formatCentsEUR(b.totalPriceCents)}
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
