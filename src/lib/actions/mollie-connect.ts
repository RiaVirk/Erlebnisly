"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { refreshMollieOnboarding } from "@/lib/mollie-onboarding";
import { revalidatePath } from "next/cache";

/** Hard-disconnects the host's Mollie account. The host must re-run OAuth to reconnect. */
export async function disconnectMollie() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { ok: false, error: "Not signed in" } as const;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!dbUser) return { ok: false, error: "No user" } as const;

  // Unpublish all experiences so no new bookings can come in
  await prisma.experience.updateMany({
    where: { hostId: dbUser.id, isPublished: true },
    data: { isPublished: false },
  });

  await prisma.mollieConnect.deleteMany({ where: { userId: dbUser.id } });

  revalidatePath("/host/connect-mollie");
  revalidatePath("/host/experiences");
  return { ok: true } as const;
}

/** Re-polls Mollie's onboarding API and updates chargesEnabled / mollieProfileId. */
export async function refreshMollieStatus() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { ok: false, error: "Not signed in" } as const;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!dbUser) return { ok: false, error: "No user" } as const;

  try {
    const onboarding = await refreshMollieOnboarding(dbUser.id);
    revalidatePath("/host/connect-mollie");
    return { ok: true, status: onboarding.status, canReceivePayments: onboarding.canReceivePayments } as const;
  } catch (err) {
    console.error("[refreshMollieStatus]", err);
    return { ok: false, error: "Refresh failed — try again" } as const;
  }
}
