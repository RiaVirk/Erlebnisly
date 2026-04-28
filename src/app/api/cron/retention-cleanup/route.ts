import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

// Hard-deletes anonymized rows older than the German 10-year financial retention period.
// Implementation added in the GDPR step.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.json({ ok: true, deleted: 0 });
}
