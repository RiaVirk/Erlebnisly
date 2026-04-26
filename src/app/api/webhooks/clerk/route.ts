import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();

  const wh = new Webhook(env.CLERK_WEBHOOK_SIGNING_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": headersList.get("svix-id") ?? "",
      "svix-timestamp": headersList.get("svix-timestamp") ?? "",
      "svix-signature": headersList.get("svix-signature") ?? "",
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0]?.email_address ?? null,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        imageUrl: image_url ?? null,
      },
    });
  }

  if (event.type === "user.deleted") {
    const { id } = event.data;
    await prisma.user.updateMany({
      where: { clerkId: id as string },
      data: { deletedAt: new Date() },
    });
    // Soft delete only — do NOT cascade. Bookings must remain for financial records.
  }

  return new Response("OK", { status: 200 });
}