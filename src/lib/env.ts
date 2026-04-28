import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1),
  MOLLIE_API_KEY: z.string().startsWith("test_").or(z.string().startsWith("live_")),
  MOLLIE_CLIENT_ID: z.string().min(1),
  MOLLIE_CLIENT_SECRET: z.string().min(1),
  MOLLIE_REDIRECT_URI: z.string().url(),
  APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  ENCRYPTION_KEY: z.string().min(44),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  CRON_SECRET: z.string().min(32),
});

export const env = schema.parse(process.env);