import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";

export { getIp } from "./get-ip";

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const limiters = new Map<string, Ratelimit>();

interface Config {
  tokens: number;
  window: `${number} ${"s" | "m" | "h" | "d"}`;
}

export async function rateLimit(
  bucket: string,
  identifier: string,
  config: Config,
): Promise<{ success: boolean; remaining: number; reset: number; limit: number }> {
  if (!redis) {
    return { success: true, remaining: config.tokens, reset: 0, limit: config.tokens };
  }

  let limiter = limiters.get(bucket);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.tokens, config.window),
      prefix: `erlebnisly:rl:${bucket}`,
      analytics: true,
    });
    limiters.set(bucket, limiter);
  }

  return limiter.limit(identifier);
}
