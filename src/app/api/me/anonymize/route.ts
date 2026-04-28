import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GDPR Art. 17 — account anonymisation. Implementation added in GDPR step.
export async function POST(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  return NextResponse.json({ message: "Not yet implemented" }, { status: 501 });
}
