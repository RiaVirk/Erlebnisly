"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { eurosStringToCents } from "@/lib/pricing/utils";
import {
  CreateExperienceSchema,
  UpdateExperienceSchema,
} from "./experience-schema";
import { revalidatePath } from "next/cache";

// ─── Helper: get authenticated DB user ──────────────────────────

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User not found in database");

  return user;
}

// ─── Create ─────────────────────────────────────────────────────

export async function createExperience(
  rawInput: unknown
): Promise<{ id?: string; error?: string }> {
  const user = await getAuthenticatedUser().catch(() => null);
  if (!user) return { error: "Not authenticated" };
  if (user.role !== "HOST" && user.role !== "ADMIN")
    return { error: "Only hosts can create experiences" };

  const parsed = CreateExperienceSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const data = parsed.data;

  try {
    const basePriceCents = eurosStringToCents(data.basePriceEuros);

    const experience = await prisma.experience.create({
      data: {
        hostId: user.id,
        categoryId: data.categoryId,
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        location: data.location,
        timezone: data.timezone,
        durationMinutes: data.durationMinutes,
        minParticipants: data.minParticipants,
        maxParticipants: data.maxParticipants,
        difficulty: data.difficulty,
        currency: "EUR",
        basePriceCents,
        vatRateBps: data.vatRateBps,
        // isPublished defaults to false
      },
    });

    revalidatePath("/host/experiences");
    return { id: experience.id };
  } catch (err) {
    console.error("[createExperience]", err);
    return { error: "Failed to create experience" };
  }
}

// ─── Update ─────────────────────────────────────────────────────

export async function updateExperience(
  rawInput: unknown
): Promise<{ error?: string }> {
  const user = await getAuthenticatedUser().catch(() => null);
  if (!user) return { error: "Not authenticated" };

  const parsed = UpdateExperienceSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const { id, basePriceEuros, ...rest } = parsed.data;

  // Ownership check — MUST happen before any write
  const experience = await prisma.experience.findUnique({ where: { id } });
  if (!experience) return { error: "Experience not found" };
  if (experience.hostId !== user.id && user.role !== "ADMIN")
    return { error: "Not your experience" };

  try {
    const updateData: Record<string, unknown> = { ...rest };
    if (basePriceEuros) {
      updateData.basePriceCents = eurosStringToCents(basePriceEuros);
    }

    await prisma.experience.update({ where: { id }, data: updateData });
    revalidatePath(`/host/experiences/${id}`);
    revalidatePath(`/experiences/${id}`);
    return {};
  } catch (err) {
    console.error("[updateExperience]", err);
    return { error: "Failed to update experience" };
  }
}

// ─── Soft Delete ─────────────────────────────────────────────────

export async function deleteExperience(
  id: string
): Promise<{ error?: string }> {
  const user = await getAuthenticatedUser().catch(() => null);
  if (!user) return { error: "Not authenticated" };

  const experience = await prisma.experience.findUnique({ where: { id } });
  if (!experience) return { error: "Not found" };
  if (experience.hostId !== user.id && user.role !== "ADMIN")
    return { error: "Not your experience" };

  await prisma.experience.update({
    where: { id },
    data: { deletedAt: new Date(), isPublished: false },
  });

  revalidatePath("/host/experiences");
  return {};
}

// ─── Publish ─────────────────────────────────────────────────────

export async function publishExperience(
  id: string
): Promise<{ error?: string }> {
  const user = await getAuthenticatedUser().catch(() => null);
  if (!user) return { error: "Not authenticated" };

  const experience = await prisma.experience.findUnique({ where: { id } });
  if (!experience) return { error: "Not found" };
  if (experience.hostId !== user.id && user.role !== "ADMIN")
    return { error: "Not your experience" };

  // Golden Rule #6 — check Mollie Connect chargesEnabled
  const mollieConnect = await prisma.mollieConnect.findUnique({
    where: { userId: user.id },
  });

  // For Phase 1: allow publish if mollieConnect row doesn't exist yet
  // (testing without real Mollie OAuth). In Phase 3, remove this bypass.
  const canCharge = mollieConnect?.chargesEnabled ?? false;
  const isPhase1TestMode = process.env.NODE_ENV === "development";

  if (!canCharge && !isPhase1TestMode) {
    return {
      error:
        "You must complete Mollie payment onboarding before publishing. Go to Settings → Payments.",
    };
  }

  if (!experience.images || experience.images.length === 0) {
    return { error: "Add at least one image before publishing" };
  }

  await prisma.experience.update({
    where: { id },
    data: { isPublished: true },
  });

  revalidatePath("/host/experiences");
  revalidatePath(`/experiences/${id}`);
  return {};
}