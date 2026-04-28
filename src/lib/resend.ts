"server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var __resend: Resend | undefined;
}

export const resend =
  globalThis.__resend ?? new Resend(env.RESEND_API_KEY);

if (env.NODE_ENV !== "production") {
  globalThis.__resend = resend;
}
