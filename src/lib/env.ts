import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1),
  MOLLIE_API_KEY: z.string().startsWith("test_").or(z.string().startsWith("live_")),
  MOLLIE_CLIENT_ID: z.string().min(1),
  MOLLIE_CLIENT_SECRET: z.string().min(1),
  MOLLIE_REDIRECT_URI: z.url(),
  APP_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  ENCRYPTION_KEY: z.string().min(44),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.email(),
  CRON_SECRET: z.string().min(32),
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  DEMO_MODE: z.enum(["true", "false"]).default("false").transform((v) => v === "true"),
});

export const env = schema.parse(process.env);
