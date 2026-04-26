import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{experience.title}</h1>
            <Badge variant={experience.isPublished ? "default" : "secondary"}>
              {experience.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{experience.shortDescription}</p>
        </div>
        <PublishButton experienceId={experience.id} isPublished={experience.isPublished} />
      </div>

      <Card className="p-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Price</p>
          <p className="font-semibold">{formatCentsEUR(experience.basePriceCents)} / person</p>
        </div>
        <div>
          <p className="text-muted-foreground">Duration</p>
          <p className="font-semibold">{experience.durationMinutes} min</p>
        </div>
        <div>
          <p className="text-muted-foreground">Max group</p>
          <p className="font-semibold">{experience.maxParticipants} people</p>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Time Slots</h2>
        <TimeSlotForm experienceId={experience.id} />

        <div className="mt-4 space-y-2">
          {experience.timeSlots.map((slot) => {
            const tz = experience.timezone;
            const localStart = toZonedTime(slot.startTime, tz);
            const localEnd = toZonedTime(slot.endTime, tz);
            return (
              <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">
                  {formatTz(localStart, "EEE, d MMM yyyy HH:mm", { timeZone: tz })}
                  {" → "}
                  {formatTz(localEnd, "HH:mm", { timeZone: tz })}
                  {slot.isBlocked && (
                    <Badge variant="destructive" className="ml-2">Blocked</Badge>
                  )}
                </span>
              </div>
            );
          })}
          {experience.timeSlots.length === 0 && (
            <p className="text-muted-foreground text-sm">No time slots yet. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}