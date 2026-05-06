"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { seedHostDemoData } from "@/lib/seed-host-demo";
import type { Role } from "@prisma/client";

export async function setUserRole(
  role: "CUSTOMER" | "HOST"
): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  try {
    const clerk = await clerkClient();

    // 1. Update Clerk public metadata so the session token carries the role
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    // 2. Update DB role
    await prisma.user.update({
      where: { clerkId: userId },
      data: { role: role as Role },
    });

    // 3. If HOST — create HostProfile and seed demo data so the dashboard
    //    is populated with fictitious experiences, bookings, and earnings
    //    immediately on first login. Idempotent: skips if data already exists.
    if (role === "HOST") {
      const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!dbUser) return { error: "User not found in database" };

      await prisma.hostProfile.upsert({
        where: { userId: dbUser.id },
        update: {},
        create: { userId: dbUser.id },
      });

      // Fire-and-forget: don't block the redirect on seeding
      seedHostDemoData(dbUser.id).catch((err) =>
        console.error("[setUserRole] seedHostDemoData failed:", err)
      );
    }

    return {};
  } catch (err) {
    console.error("[setUserRole]", err);
    return { error: "Failed to update role. Please try again." };
  }
}