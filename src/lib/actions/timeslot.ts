"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { revalidatePath } from "next/cache";

const CreateTimeSlotSchema = z.object({
  experienceId: z.string().cuid(),
  // ISO date string in the host's local timezone: "2025-06-15"
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // "HH:mm" format: "10:00"
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().min(1).optional(),
});

export async function createTimeSlot(
  rawInput: unknown
): Promise<{ error?: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return { error: "User not found" };

  const parsed = CreateTimeSlotSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { experienceId, date, startTime, endTime, capacity } = parsed.data;

  // Ownership check
  const experience = await prisma.experience.findUnique({
    where: { id: experienceId },
  });
  if (!experience) return { error: "Experience not found" };
  if (experience.hostId !== user.id && user.role !== "ADMIN")
    return { error: "Not your experience" };

  // Convert host's local time to UTC using the experience's timezone
  // date-fns-tz `fromZonedTime`: takes a date+time in a specific timezone and
  // returns the equivalent UTC Date object
  const tz = experience.timezone;
  const startUtc = fromZonedTime(`${date}T${startTime}:00`, tz);
  const endUtc = fromZonedTime(`${date}T${endTime}:00`, tz);

  if (endUtc <= startUtc) {
    return { error: "End time must be after start time" };
  }

  try {
    await prisma.timeSlot.create({
      data: {
        experienceId,
        startTime: startUtc,
        endTime: endUtc,
        capacity,
      },
    });

    revalidatePath(`/host/experiences/${experienceId}`);
    return {};
  } catch (err: unknown) {
    // Unique constraint: [experienceId, startTime]
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { error: "A slot already exists for this experience at that start time" };
    }
    console.error("[createTimeSlot]", err);
    return { error: "Failed to create slot" };
  }
}

export async function deleteTimeSlot(
  id: string
): Promise<{ error?: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return { error: "Not found" };

  const slot = await prisma.timeSlot.findUnique({
    where: { id },
    include: { experience: true },
  });
  if (!slot) return { error: "Slot not found" };
  if (slot.experience.hostId !== user.id && user.role !== "ADMIN")
    return { error: "Not authorized" };

  // Don't allow deleting slots with confirmed bookings
  const hasConfirmed = await prisma.booking.count({
    where: { timeSlotId: id, status: "CONFIRMED" },
  });
  if (hasConfirmed > 0) {
    return { error: "Cannot delete a slot with confirmed bookings" };
  }

  await prisma.timeSlot.delete({ where: { id } });
  revalidatePath(`/host/experiences/${slot.experienceId}`);
  return {};
}