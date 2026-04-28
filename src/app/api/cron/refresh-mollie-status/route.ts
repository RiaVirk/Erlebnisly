import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refreshMollieOnboarding } from "@/lib/mollie-onboarding";
import { env } from "@/lib/env";

// Runs every 6 hours. Re-checks onboarding status for hosts not yet approved.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const candidates = await prisma.mollieConnect.findMany({
    where: { isOnboarded: false },
    select: { userId: true },
    take: 200,
  });

  const results = await Promise.allSettled(
    candidates.map((c) => refreshMollieOnboarding(c.userId)),
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ checked: candidates.length, succeeded });
}
