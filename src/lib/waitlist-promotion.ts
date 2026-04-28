import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { Resend } from "resend";
import { addHours } from "date-fns";
import { SignJWT } from "jose";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Call this whenever a booking is cancelled or a hold expires.
 * Finds the next waitlist candidate for the slot and sends a 12-hour claim email.
 */
export async function promoteNextWaitlistEntry(timeSlotId: string) {
  const slot = await prisma.timeSlot.findUnique({
    where: { id: timeSlotId },
    include: { experience: { select: { maxParticipants: true, title: true } } },
  });
  if (!slot || slot.isBlocked) return;

  const cap = slot.capacity ?? slot.experience.maxParticipants;
  const taken = await prisma.booking.aggregate({
    where: {
      timeSlotId,
      status: { in: ["CONFIRMED", "RESERVED_HOLD"] },
      OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: new Date() } }],
    },
    _sum: { participantCount: true },
  });
  const spotsLeft = cap - (taken._sum.participantCount ?? 0);
  if (spotsLeft <= 0) return;

  const candidate = await prisma.waitlistEntry.findFirst({
    where: {
      timeSlotId,
      claimedAt: null,
      requestedSpots: { lte: spotsLeft },
      OR: [
        { promotedAt: null },
        { promotionExpiresAt: { lt: new Date() } },
      ],
    },
    orderBy: { position: "asc" },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!candidate) return;

  const secret = new TextEncoder().encode(env.ENCRYPTION_KEY);
  const token = await new SignJWT({
    entryId: candidate.id,
    userId: candidate.userId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(secret);

  const promotionExpiresAt = addHours(new Date(), 12);

  await prisma.waitlistEntry.update({
    where: { id: candidate.id },
    data: { promotedAt: new Date(), promotionExpiresAt },
  });

  const claimUrl = `${env.APP_URL}/experiences/claim?token=${token}&slotId=${timeSlotId}`;

  if (candidate.user.email) {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: candidate.user.email,
      subject: `A spot opened for you — ${slot.experience.title}`,
      html: `
        <p>Hi ${candidate.user.name ?? "there"},</p>
        <p>Great news — a spot just opened for <strong>${slot.experience.title}</strong>.</p>
        <p>
          <a href="${claimUrl}" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
            Claim your spot
          </a>
        </p>
        <p>This link expires in <strong>12 hours</strong>. After that, it goes to the next person.</p>
      `,
    });
  }
}
