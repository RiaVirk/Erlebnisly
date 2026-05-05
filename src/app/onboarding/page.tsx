import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingClient from "./_components/OnboardingClient";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Ensure the DB record exists (webhook may not have fired yet for brand-new users)
  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!existing) {
    const clerk    = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    await prisma.user.upsert({
      where:  { clerkId: userId },
      update: {},
      create: {
        clerkId:  userId,
        email:    clerkUser.emailAddresses[0]?.emailAddress ?? null,
        name:     [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
        imageUrl: clerkUser.imageUrl ?? null,
      },
    });
  }

  // Every signed-in user sees the role picker on every sign-in.
  // After picking, setUserRole() + session.reload() routes them to the right dashboard.
  return <OnboardingClient />;
}
