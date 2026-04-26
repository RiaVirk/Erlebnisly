import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingClient from "./_components/OnboardingClient";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // If user already has a role set, skip onboarding
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in"); // webhook hasn't fired yet — edge case

  // If they already have a role from public metadata, send them to the right place
  // We'll check this via the DB record's role field
  if (user.role !== "CUSTOMER") {
    redirect(user.role === "HOST" ? "/host/dashboard" : "/dashboard");
  }

  return <OnboardingClient />;
}