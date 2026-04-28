"use server";
import { computeMinMaxPrice } from "@/lib/pricing/denormalize";
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

    const { minPriceCents, maxPriceCents } = computeMinMaxPrice({
      basePriceCents,
      minParticipants: data.minParticipants,
      maxParticipants: data.maxParticipants,
      pricingRules: null,
    });

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
        minPriceCents,
        maxPriceCents,
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
    const newBasePriceCents = basePriceEuros
      ? eurosStringToCents(basePriceEuros)
      : experience.basePriceCents;

    const { minPriceCents, maxPriceCents } = computeMinMaxPrice({
      basePriceCents: newBasePriceCents,
      minParticipants: rest.minParticipants ?? experience.minParticipants,
      maxParticipants: rest.maxParticipants ?? experience.maxParticipants,
      pricingRules: null,
    });

    const updateData: Record<string, unknown> = {
      ...rest,
      basePriceCents: newBasePriceCents,
      minPriceCents,
      maxPriceCents,
    };

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

export async function publishExperience(id: string): Promise<{
  ok: boolean;
  error?: string;
  action?: { label: string; href: string };
}> {
  const user = await getAuthenticatedUser().catch(() => null);
  if (!user) return { ok: false, error: "Not authenticated" };

  const [experience, mollieConnect] = await Promise.all([
    prisma.experience.findUnique({
      where: { id },
      select: { id: true, hostId: true, deletedAt: true },
    }),
    prisma.mollieConnect.findUnique({ where: { userId: user.id } }),
  ]);

  if (!experience || experience.deletedAt) return { ok: false, error: "Not found" };
  if (experience.hostId !== user.id && user.role !== "ADMIN")
    return { ok: false, error: "Forbidden" };

  if (!mollieConnect) {
    return {
      ok: false,
      error: "Connect your Mollie account before publishing.",
      action: { label: "Connect Mollie", href: "/host/connect-mollie" },
    };
  }
  if (!mollieConnect.chargesEnabled) {
    return {
      ok: false,
      error: "Your Mollie account isn't approved for payments yet.",
      action: { label: "Check status", href: "/host/connect-mollie" },
    };
  }
  if (!mollieConnect.mollieProfileId) {
    return {
      ok: false,
      error: "Your Mollie account has no payment profile yet.",
      action: { label: "Open Mollie dashboard", href: "https://my.mollie.com" },
    };
  }

  await prisma.experience.update({
    where: { id },
    data: { isPublished: true },
  });

  revalidatePath(`/experiences/${id}`);
  revalidatePath("/experiences");
  revalidatePath("/host/experiences");
  return { ok: true };
}