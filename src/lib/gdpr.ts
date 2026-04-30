import "server-only";
import { prisma } from "./prisma";

export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      hostProfile: true,
      mollieConnect: {
        select: {
          mollieProfileId: true,
          chargesEnabled: true,
          payoutsEnabled: true,
          isOnboarded: true,
          createdAt: true,
        },
      },
      experiences: { where: { deletedAt: null } },
      bookings: {
        include: {
          participants: true,
          events: true,
          timeSlot: { include: { experience: { select: { title: true } } } },
        },
      },
      reviews: true,
      wishlistItems: { include: { experience: { select: { title: true } } } },
      waitlistEntries: { include: { timeSlot: true } },
      notifications: true,
    },
  });

  if (!user) return null;

  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    user,
  };
}
