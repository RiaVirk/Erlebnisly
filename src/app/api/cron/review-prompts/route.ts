import { NextRequest, NextResponse } from "next/server";
import { addHours } from "date-fns";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { notify } from "@/lib/notify";
import ReviewPromptEmail from "@/emails/ReviewPromptEmail";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // COMPLETED bookings whose slot ended 24–48 h ago, no review yet, no prompt already sent.
  const candidates = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      review: null,
      timeSlot: {
        endTime: {
          lt: addHours(new Date(), -24),
          gt: addHours(new Date(), -48),
        },
      },
      events: {
        none: { reason: { contains: "review_prompt_sent" } },
      },
    },
    include: {
      user: { select: { id: true, name: true } },
      timeSlot: {
        include: {
          experience: { select: { id: true, title: true } },
        },
      },
    },
    take: 100,
  });

  for (const b of candidates) {
    await notify({
      userId: b.userId,
      type: "review_prompt",
      title: `Wie war ${b.timeSlot.experience.title}?`,
      body: "Teile deine Erfahrung und hilf anderen Gästen.",
      data: { bookingId: b.id, experienceId: b.timeSlot.experience.id },
      email: {
        subject: `Wie war ${b.timeSlot.experience.title}?`,
        react: ReviewPromptEmail({
          customerName: b.user.name ?? "there",
          experienceTitle: b.timeSlot.experience.title,
          reviewUrl: `${env.APP_URL}/bookings/${b.id}#review`,
        }),
      },
    });

    // Stamp the audit trail so we don't double-send on the next cron run.
    await prisma.bookingEvent.create({
      data: {
        bookingId: b.id,
        previousStatus: "COMPLETED",
        newStatus: "COMPLETED",
        reason: "review_prompt_sent",
      },
    });
  }

  return NextResponse.json({ prompted: candidates.length });
}
