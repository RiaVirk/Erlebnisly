import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

// Fires 24 h after a slot's end time for every COMPLETED booking without a review.
// Implementation added in the email / review step.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.json({ ok: true, processed: 0 });
}
