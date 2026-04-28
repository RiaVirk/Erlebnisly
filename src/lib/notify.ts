"server-only";

import * as React from "react";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { env } from "@/lib/env";
import type { Prisma } from "@prisma/client";

type NotificationType =
  | "booking_confirmed"
  | "hold_expired"
  | "waitlist_promoted"
  | "review_prompt"
  | "cancellation"
  | "refund_completed"
  | "data_export_ready";

interface NotifyInput<T extends Record<string, unknown>> {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: T;
  email?: {
    subject: string;
    react: React.ReactElement;
  };
}

// Sentry is not yet installed. When @sentry/nextjs is added, replace this
// with: import * as Sentry from "@sentry/nextjs"; Sentry.captureException(err, extra);
function captureException(err: unknown, extra?: Record<string, unknown>) {
  console.error("[notify] email send failed", extra, err);
}

export async function notify<T extends Record<string, unknown>>(
  input: NotifyInput<T>,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, deletedAt: true, anonymizedAt: true },
  });
  if (!user || user.deletedAt || user.anonymizedAt) return;

  // Always write the in-app notification, even if email fails.
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: (input.data ?? {}) as Prisma.JsonObject,
    },
  });

  if (!input.email || !user.email) return;

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: user.email,
      subject: input.email.subject,
      react: input.email.react,
    });
  } catch (err) {
    captureException(err, { area: "notify", type: input.type, userId: input.userId });
  }
}
