"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ReviewInput = z.object({
  bookingId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function submitReview(input: z.infer<typeof ReviewInput>) {
  const parsed = ReviewInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };

  const { userId: clerkId } = await auth();
  if (!clerkId) return { ok: false as const, error: "Not signed in" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return { ok: false as const, error: "No user" };

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: {
      review: true,
      timeSlot: { include: { experience: { select: { id: true } } } },
    },
  });
  if (!booking) return { ok: false as const, error: "Booking not found" };

  if (booking.userId !== dbUser.id) return { ok: false as const, error: "Forbidden" };

  if (booking.status !== "COMPLETED") {
    return { ok: false as const, error: "You can review only after the experience has happened." };
  }

  if (booking.review) {
    return { ok: false as const, error: "You've already reviewed this booking." };
  }

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      userId: dbUser.id,
      experienceId: booking.timeSlot.experience.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    },
  });

  revalidatePath(`/experiences/${booking.timeSlot.experience.id}`);
  revalidatePath(`/bookings/${booking.id}`);
  return { ok: true as const };
}
