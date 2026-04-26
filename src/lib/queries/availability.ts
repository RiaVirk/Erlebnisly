import { prisma } from "@/lib/prisma";

/**
 * Returns the number of spots taken for a given time slot.
 * Counts bookings that are CONFIRMED or RESERVED_HOLD where the hold hasn't expired.
 * This is the correct way to calculate availability — never store it as a column.
 */
export async function getSlotSpotsTaken(slotId: string): Promise<number> {
  const result = await prisma.booking.aggregate({
    where: {
      timeSlotId: slotId,
      status: { in: ["CONFIRMED", "RESERVED_HOLD"] },
      OR: [
        { holdExpiresAt: null },
        { holdExpiresAt: { gt: new Date() } },
      ],
    },
    _sum: { participantCount: true },
  });
  return result._sum.participantCount ?? 0;
}

/**
 * Returns all slots for an experience with their availability pre-computed.
 */
export async function getExperienceSlotsWithAvailability(experienceId: string) {
  const experience = await prisma.experience.findUnique({
    where: { id: experienceId },
    select: { maxParticipants: true },
  });
  if (!experience) return [];

  const slots = await prisma.timeSlot.findMany({
    where: {
      experienceId,
      isBlocked: false,
      startTime: { gt: new Date() }, // future slots only
    },
    orderBy: { startTime: "asc" },
  });

  const slotsWithAvailability = await Promise.all(
    slots.map(async (slot) => {
      const taken = await getSlotSpotsTaken(slot.id);
      const capacity = slot.capacity ?? experience.maxParticipants;
      return {
        ...slot,
        capacity,
        taken,
        available: capacity - taken,
      };
    })
  );

  return slotsWithAvailability;
}