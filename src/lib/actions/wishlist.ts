"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(experienceId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { ok: false as const, error: "Not signed in" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return { ok: false as const, error: "No user" };

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_experienceId: { userId: dbUser.id, experienceId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { ok: true as const, isInWishlist: false };
  }

  await prisma.wishlistItem.create({
    data: { userId: dbUser.id, experienceId },
  });
  revalidatePath("/wishlist");
  return { ok: true as const, isInWishlist: true };
}
