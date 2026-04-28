"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getDbUserId(clerkId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) throw new Error("User not found.");
  return user.id;
}

export async function joinWaitlist(timeSlotId: string, requestedSpots = 1) {
  const { userId: clerkId, isAuthenticated } = await auth();
  if (!isAuthenticated || !clerkId) {
    return { error: "Please sign in to join the waitlist." };
  }

  const userId = await getDbUserId(clerkId);

  const existing = await prisma.waitlistEntry.findUnique({
    where: { userId_timeSlotId: { userId, timeSlotId } },
  });
  if (existing) return { error: "You are already on the waitlist for this slot." };

  const last = await prisma.waitlistEntry.findFirst({
    where: { timeSlotId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1;

  await prisma.waitlistEntry.create({
    data: { userId, timeSlotId, position, requestedSpots },
  });

  revalidatePath("/experiences");
  return { success: true, position };
}

export async function leaveWaitlist(timeSlotId: string) {
  const { userId: clerkId, isAuthenticated } = await auth();
  if (!isAuthenticated || !clerkId) return { error: "Not authenticated." };

  const userId = await getDbUserId(clerkId);

  await prisma.waitlistEntry.deleteMany({
    where: { userId, timeSlotId },
  });

  revalidatePath("/experiences");
  return { success: true };
}
