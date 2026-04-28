"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const AddOnSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  priceEuros: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, "Invalid format — use e.g. 12.50"),
  isOptional: z.boolean().default(true),
});

async function assertOwner(experienceId: string, dbUserId: string) {
  const exp = await prisma.experience.findFirst({
    where: { id: experienceId, hostId: dbUserId, deletedAt: null },
    select: { id: true },
  });
  if (!exp) throw new Error("Experience not found or you do not own it.");
}

async function getDbUser(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!user) throw new Error("User record not found.");
  return user;
}

function priceEurosToCents(s: string): number {
  const n = Number(s.replace(",", "."));
  if (Number.isNaN(n) || n < 0) throw new Error("Invalid price");
  return Math.round(n * 100);
}

export async function createAddOn(experienceId: string, formData: FormData) {
  const { userId: clerkId, isAuthenticated } = await auth();
  if (!isAuthenticated || !clerkId) throw new Error("Not authenticated.");

  const { id: dbUserId } = await getDbUser(clerkId);
  await assertOwner(experienceId, dbUserId);

  const parsed = AddOnSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    priceEuros: formData.get("priceEuros"),
    isOptional: formData.get("isOptional") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.addOn.create({
    data: {
      experienceId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      priceCents: priceEurosToCents(parsed.data.priceEuros),
      isOptional: parsed.data.isOptional,
    },
  });

  revalidatePath(`/host/experiences/${experienceId}/addons`);
  return { success: true };
}

export async function deleteAddOn(addOnId: string, experienceId: string) {
  const { userId: clerkId, isAuthenticated } = await auth();
  if (!isAuthenticated || !clerkId) throw new Error("Not authenticated.");

  const { id: dbUserId } = await getDbUser(clerkId);
  await assertOwner(experienceId, dbUserId);

  await prisma.addOn.delete({ where: { id: addOnId } });

  revalidatePath(`/host/experiences/${experienceId}/addons`);
  return { success: true };
}
