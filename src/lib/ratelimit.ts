"server-only";

import { env } from "@/lib/env";

// Returns the client IP from the x-forwarded-for header (Next.js 16 — req.ip removed).
export function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() ?? "anonymous";
}

// Ratelimit is optional: only active when Upstash env vars are present.
// Install @upstash/ratelimit and @upstash/redis, then uncomment below.
export async function checkRateLimit(
  _identifier: string,
  _limit = 10,
  _window = "10 s",
): Promise<{ success: boolean }> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return { success: true };
  }
  // const { Ratelimit } = await import("@upstash/ratelimit");
  // const { Redis } = await import("@upstash/redis");
  // const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
  // const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(_limit, _window) });
  // return ratelimit.limit(_identifier);
  return { success: true };
}
