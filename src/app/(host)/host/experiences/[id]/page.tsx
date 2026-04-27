import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import Link from "next/link";
import PublishButton from "../_components/PublishButton";
import TimeSlotForm from "../_components/TimeSlotForm";
import { toZonedTime, format as formatTz } from "date-fns-tz";

export default async function ManageExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const experience = await prisma.experience.findUnique({
    where: { id, deletedAt: null },
    include: {
      category: true,
      timeSlots: { orderBy: { startTime: "asc" }, take: 20 },
    },
  });

  if (!experience) notFound();
  if (experience.hostId !== user.id && user.role !== "ADMIN") redirect("/host/experiences");

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/host/experiences" className="text-ds-on-surface-variant hover:text-ds-on-surface transition-colors shrink-0">
            <span className="material-symbols-outlined text-title-sm">arrow_back</span>
          </Link>
          <div className="min-w-0">
            <p className="type-label-caps text-ds-on-surface-variant">{experience.category.name}</p>
            <h1 className="type-body-sm font-semibold text-ds-on-surface truncate">{experience.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full type-label-caps ${experience.isPublished ? "bg-ds-secondary/10 text-ds-secondary" : "bg-ds-surface-container-highest text-ds-on-surface-variant"}`}>
            {experience.isPublished ? "Published" : "Draft"}
          </span>
          <PublishButton experienceId={experience.id} isPublished={experience.isPublished} />
        </div>
      </header>

      <div className="p-8 max-w-360 mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Price per person", value: formatCentsEUR(experience.basePriceCents), icon: "payments" },
            { label: "Duration", value: `${experience.durationMinutes} min`, icon: "schedule" },
            { label: "Max group size", value: `${experience.maxParticipants} people`, icon: "group" },
            { label: "Time slots", value: String(experience.timeSlots.length), icon: "calendar_month" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white border border-ds-outline-variant rounded-ds-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-ds-secondary text-title-sm">{icon}</span>
                <p className="type-label-caps text-ds-on-surface-variant">{label}</p>
              </div>
              <p className="type-title-sm text-ds-on-surface">{value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white border border-ds-outline-variant rounded-ds-lg p-6 shadow-sm">
          <h2 className="type-title-sm text-ds-on-surface mb-2">Description</h2>
          <p className="type-body-sm text-ds-on-surface-variant">{experience.shortDescription}</p>
        </div>

        {/* Time Slots */}
        <div className="bg-white border border-ds-outline-variant rounded-ds-lg overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ds-outline-variant">
            <h2 className="type-title-sm text-ds-on-surface">Time Slots</h2>
          </div>

          <div className="p-6">
            <TimeSlotForm experienceId={experience.id} />
          </div>

          {experience.timeSlots.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-ds-surface-container-low border-t border-b border-ds-outline-variant">
                <tr>
                  {["Start", "End", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 type-label-caps text-ds-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ds-outline-variant">
                {experience.timeSlots.map((slot) => {
                  const tz = experience.timezone;
                  const localStart = toZonedTime(slot.startTime, tz);
                  const localEnd = toZonedTime(slot.endTime, tz);
                  return (
                    <tr key={slot.id} className="hover:bg-ds-surface-container-low transition-colors">
                      <td className="px-6 py-3 type-data-tabular text-ds-on-surface">
                        {formatTz(localStart, "EEE, d MMM yyyy HH:mm", { timeZone: tz })}
                      </td>
                      <td className="px-6 py-3 type-data-tabular text-ds-on-surface-variant">
                        {formatTz(localEnd, "HH:mm", { timeZone: tz })}
                      </td>
                      <td className="px-6 py-3">
                        {slot.isBlocked ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full type-label-caps bg-ds-error-container text-ds-on-error-container">Blocked</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full type-label-caps bg-ds-secondary/10 text-ds-secondary">Available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-6 pb-6 text-center">
              <p className="type-body-sm text-ds-on-surface-variant">No time slots yet. Add one above.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
