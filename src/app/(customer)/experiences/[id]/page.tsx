import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { getExperienceSlotsWithAvailability } from "@/lib/queries/availability";
import BookingWidget from "./_components/BookingWidget";

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Beginner",
  MEDIUM: "Intermediate",
  HARD: "Advanced",
};

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const experience = await prisma.experience.findUnique({
    where: { id, isPublished: true, deletedAt: null },
    include: {
      category: true,
      host: { select: { name: true, imageUrl: true } },
    },
  });

  if (!experience) notFound();

  const slots = await getExperienceSlotsWithAvailability(id);

  const gradients = [
    "from-emerald-100 to-teal-200",
    "from-blue-100 to-indigo-200",
    "from-amber-100 to-orange-200",
    "from-pink-100 to-rose-200",
    "from-violet-100 to-purple-200",
  ];
  const gradient = gradients[experience.category.name.length % gradients.length];

  return (
    <>
      <header className="sticky top-0 h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex items-center px-8 z-40 gap-3">
        <a href="/experiences" className="text-ds-on-surface-variant hover:text-ds-on-surface transition-colors">
          <span className="material-symbols-outlined text-title-sm">arrow_back</span>
        </a>
        <div>
          <p className="type-label-caps text-ds-on-surface-variant">{experience.category.name}</p>
          <h1 className="type-body-sm font-semibold text-ds-on-surface line-clamp-1">{experience.title}</h1>
        </div>
      </header>

      <div className="p-8 max-w-360 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image placeholder */}
            <div className={`h-72 bg-linear-to-br ${gradient} rounded-ds-lg flex items-center justify-center shadow-[0_4px_20px_rgba(15,23,42,0.08)]`}>
              <span className="material-symbols-outlined text-[80px] text-white/60" style={{ fontVariationSettings: "'FILL' 1" }}>travel_explore</span>
            </div>

            <div>
              <span className="type-label-caps text-ds-on-surface-variant">{experience.category.name}</span>
              <h2 className="type-display-lg text-ds-on-surface mt-1">{experience.title}</h2>
              <p className="type-body-md text-ds-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-title-sm">location_on</span>
                {experience.location}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Duration", value: `${experience.durationMinutes} min`, icon: "schedule" },
                { label: "Group size", value: `${experience.minParticipants}–${experience.maxParticipants} people`, icon: "group" },
                { label: "Difficulty", value: DIFFICULTY_LABELS[experience.difficulty] ?? experience.difficulty, icon: "fitness_center" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-white border border-ds-outline-variant rounded-ds-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-ds-secondary text-title-sm">{icon}</span>
                    <p className="type-label-caps text-ds-on-surface-variant">{label}</p>
                  </div>
                  <p className="type-body-sm font-semibold text-ds-on-surface">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white border border-ds-outline-variant rounded-ds-lg p-6 shadow-sm">
              <h3 className="type-title-sm text-ds-on-surface mb-3">About this experience</h3>
              <p className="type-body-md text-ds-on-surface-variant leading-relaxed">{experience.description}</p>
            </div>

            {/* Host */}
            {experience.host.name && (
              <div className="bg-white border border-ds-outline-variant rounded-ds-lg p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-ds-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-ds-on-surface-variant">person</span>
                </div>
                <div>
                  <p className="type-label-caps text-ds-on-surface-variant">Hosted by</p>
                  <p className="type-body-sm font-semibold text-ds-on-surface">{experience.host.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-ds-outline-variant rounded-ds-lg p-6 shadow-[0_4px_20px_rgba(15,23,42,0.08)] space-y-5">
              <div className="flex items-baseline gap-1 border-b border-ds-outline-variant pb-4">
                <span className="type-headline-md text-ds-on-surface">{formatCentsEUR(experience.basePriceCents)}</span>
                <span className="type-body-sm text-ds-on-surface-variant">/ person</span>
              </div>
              <BookingWidget
                experience={{
                  id: experience.id,
                  title: experience.title,
                  basePriceCents: experience.basePriceCents,
                  maxParticipants: experience.maxParticipants,
                  minParticipants: experience.minParticipants,
                  timezone: experience.timezone,
                }}
                slots={slots}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
