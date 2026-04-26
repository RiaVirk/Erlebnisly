import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { getExperienceSlotsWithAvailability } from "@/lib/queries/availability";
import BookingWidget from "./_components/BookingWidget";

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

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left: experience details */}
      <div className="md:col-span-2 space-y-6">
        <div className="h-72 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
          <span className="text-6xl">{experience.category.icon}</span>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{experience.category.name}</p>
          <h1 className="text-3xl font-bold mt-1">{experience.title}</h1>
          <p className="text-muted-foreground mt-1">📍 {experience.location}</p>
        </div>

        <div className="prose max-w-none">
          <p>{experience.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 border rounded-lg">
            <p className="text-muted-foreground">Duration</p>
            <p className="font-semibold">{experience.durationMinutes} min</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="text-muted-foreground">Group size</p>
            <p className="font-semibold">
              {experience.minParticipants}–{experience.maxParticipants}
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="text-muted-foreground">Difficulty</p>
            <p className="font-semibold capitalize">{experience.difficulty.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Right: booking widget */}
      <div className="md:col-span-1">
        <div className="sticky top-6 border rounded-xl p-4 space-y-4">
          <div>
            <span className="text-2xl font-bold">{formatCentsEUR(experience.basePriceCents)}</span>
            <span className="text-muted-foreground text-sm"> / person</span>
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
  );
}