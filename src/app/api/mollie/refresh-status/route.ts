import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { refreshMollieOnboarding } from "@/lib/mollie-onboarding";

export async function POST(req: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!dbUser) return NextResponse.json({ error: "No user" }, { status: 404 });

  try {
    const onboarding = await refreshMollieOnboarding(dbUser.id);
    return NextResponse.json({
      status: onboarding.status,
      canReceivePayments: onboarding.canReceivePayments,
      canReceiveSettlements: onboarding.canReceiveSettlements,
      dashboardUrl: onboarding._links?.dashboard?.href ?? null,
    });
  } catch (err) {
    console.error("[mollie/refresh-status]", err);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
