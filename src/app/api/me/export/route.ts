import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GDPR Art. 20 — personal data export. Implementation added in GDPR step.
export async function GET(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  return NextResponse.json({ message: "Not yet implemented" }, { status: 501 });
}
