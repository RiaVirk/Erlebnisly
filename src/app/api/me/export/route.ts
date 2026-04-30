import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { exportUserData } from "@/lib/gdpr";
import { NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const ip = getIp(req);
  const { success } = await rateLimit("gdpr-export", ip, { tokens: 3, window: "1 h" });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "3600" } },
    );
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ error: "No user" }, { status: 404 });

  const data = await exportUserData(dbUser.id);
  const json = JSON.stringify(data, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="erlebnisly-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
