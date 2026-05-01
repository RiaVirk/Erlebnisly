/**
 * npx tsx prisma/seed-bookings.ts
 *
 * Finds every CUSTOMER in the DB and creates realistic demo bookings:
 *   – 3 upcoming CONFIRMED bookings  (next 1–8 weeks)
 *   – 4 past COMPLETED bookings      (last 1–6 months)
 *   – 1 past CANCELLED booking       (last 2–4 months)
 *   – 1 past REFUNDED booking        (last 3–5 months)
 *
 * Safe to run multiple times — it skips customers who already have bookings.
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { addDays, subDays, subMonths, setHours, setMinutes } from "date-fns";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function fakePaymentId(prefix = "tr") {
  return `${prefix}_demo_${Math.random().toString(36).slice(2, 14)}`;
}

const START_HOURS = [9, 10, 11, 14, 15, 16, 18];

async function main() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER", deletedAt: null },
  });

  if (customers.length === 0) {
    console.log("No CUSTOMER users found. Sign up first, then re-run.");
    return;
  }

  const experiences = await prisma.experience.findMany({
    where: { isPublished: true, deletedAt: null },
    take: 20,
  });

  if (experiences.length === 0) {
    console.log("No published experiences. Run `npx prisma db seed` first.");
    return;
  }

  let totalCreated = 0;

  const force = process.argv.includes("--force");

  for (const customer of customers) {
    const existing = await prisma.booking.count({ where: { userId: customer.id } });
    if (existing > 0 && !force) {
      console.log(`  ↳ ${customer.email ?? customer.id} — already has ${existing} bookings (use --force to reset)`);
      continue;
    }
    if (existing > 0 && force) {
      // Delete all booking-related data for this customer before re-seeding
      const bookingIds = (await prisma.booking.findMany({ where: { userId: customer.id }, select: { id: true } })).map(b => b.id);
      await prisma.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.bookingEvent.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.booking.deleteMany({ where: { userId: customer.id } });
      console.log(`  🗑  ${customer.email ?? customer.id} — cleared ${existing} existing bookings`);
    }

    console.log(`\nSeeding bookings for ${customer.email ?? customer.id}…`);

    // ── Upcoming confirmed (3) ────────────────────────────────────────────
    const upcomingExps = [pick(experiences), pick(experiences), pick(experiences)];
    const upcomingOffsets = [randInt(7, 14), randInt(15, 28), randInt(29, 56)];

    for (let i = 0; i < 3; i++) {
      const exp = upcomingExps[i]!;
      const startTime = setMinutes(
        setHours(addDays(new Date(), upcomingOffsets[i]!), pick(START_HOURS)),
        0
      );
      const endTime = new Date(startTime.getTime() + exp.durationMinutes * 60_000);
      const participants = randInt(1, Math.min(3, exp.maxParticipants));
      const subtotal = exp.basePriceCents * participants;
      const fee = Math.round(subtotal * 0.15);
      const paymentId = fakePaymentId();

      const slot = await prisma.timeSlot.create({
        data: { experienceId: exp.id, startTime, endTime },
      });

      const booking = await prisma.booking.create({
        data: {
          userId: customer.id,
          timeSlotId: slot.id,
          status: "CONFIRMED",
          participantCount: participants,
          currency: "EUR",
          subtotalCents: subtotal,
          totalPriceCents: subtotal,
          platformFeeCents: fee,
          hostPayoutCents: subtotal - fee,
          molliePaymentId: paymentId,
          molliePaymentStatus: "paid",
        },
      });

      await prisma.bookingEvent.create({
        data: {
          bookingId: booking.id,
          previousStatus: "RESERVED_HOLD",
          newStatus: "CONFIRMED",
          reason: "Payment confirmed (demo seed)",
        },
      });

      console.log(`  ✓ CONFIRMED  ${exp.title.slice(0, 40)} — ${startTime.toDateString()}`);
      totalCreated++;
    }

    // ── Past completed (4) ────────────────────────────────────────────────
    const completedOffsets = [
      randInt(10, 30),
      randInt(31, 60),
      randInt(61, 100),
      randInt(100, 180),
    ];

    for (let i = 0; i < 4; i++) {
      const exp = pick(experiences);
      const startTime = setMinutes(
        setHours(subDays(new Date(), completedOffsets[i]!), pick(START_HOURS)),
        0
      );
      const endTime = new Date(startTime.getTime() + exp.durationMinutes * 60_000);
      const participants = randInt(1, Math.min(4, exp.maxParticipants));
      const subtotal = exp.basePriceCents * participants;
      const fee = Math.round(subtotal * 0.15);
      const paymentId = fakePaymentId();

      const slot = await prisma.timeSlot.create({
        data: { experienceId: exp.id, startTime, endTime },
      });

      const booking = await prisma.booking.create({
        data: {
          userId: customer.id,
          timeSlotId: slot.id,
          status: "COMPLETED",
          participantCount: participants,
          currency: "EUR",
          subtotalCents: subtotal,
          totalPriceCents: subtotal,
          platformFeeCents: fee,
          hostPayoutCents: subtotal - fee,
          molliePaymentId: paymentId,
          molliePaymentStatus: "paid",
          createdAt: subDays(startTime, randInt(3, 14)),
        },
      });

      await prisma.bookingEvent.createMany({
        data: [
          { bookingId: booking.id, previousStatus: "RESERVED_HOLD", newStatus: "CONFIRMED",  reason: "Payment confirmed (demo seed)" },
          { bookingId: booking.id, previousStatus: "CONFIRMED",       newStatus: "COMPLETED",  reason: "Experience completed (demo seed)" },
        ],
      });

      // ~60 % chance of a review
      if (Math.random() < 0.6) {
        await prisma.review.create({
          data: {
            bookingId: booking.id,
            userId: customer.id,
            experienceId: exp.id,
            rating: randInt(4, 5),
            comment: pick([
              "Absolutely loved it — would book again!",
              "Our host was fantastic and very knowledgeable.",
              "Great experience, exceeded my expectations.",
              "Really well organised. Highly recommend.",
              "Fun afternoon, perfect for a weekend trip.",
              "Wonderful atmosphere and great value for money.",
            ]),
          },
        });
      }

      console.log(`  ✓ COMPLETED  ${exp.title.slice(0, 40)} — ${startTime.toDateString()}`);
      totalCreated++;
    }

    // ── Past cancelled (1) ────────────────────────────────────────────────
    {
      const exp = pick(experiences);
      const startTime = setMinutes(
        setHours(subDays(new Date(), randInt(60, 120)), pick(START_HOURS)),
        0
      );
      const endTime = new Date(startTime.getTime() + exp.durationMinutes * 60_000);
      const participants = randInt(1, 2);
      const subtotal = exp.basePriceCents * participants;
      const fee = Math.round(subtotal * 0.15);
      const paymentId = fakePaymentId();

      const slot = await prisma.timeSlot.create({
        data: { experienceId: exp.id, startTime, endTime },
      });

      const booking = await prisma.booking.create({
        data: {
          userId: customer.id,
          timeSlotId: slot.id,
          status: "CANCELLED_BY_CUSTOMER",
          participantCount: participants,
          currency: "EUR",
          subtotalCents: subtotal,
          totalPriceCents: subtotal,
          platformFeeCents: fee,
          hostPayoutCents: subtotal - fee,
          molliePaymentId: paymentId,
          molliePaymentStatus: "paid",
          createdAt: subDays(startTime, randInt(5, 20)),
        },
      });

      await prisma.bookingEvent.createMany({
        data: [
          { bookingId: booking.id, previousStatus: "RESERVED_HOLD",      newStatus: "CONFIRMED",            reason: "Payment confirmed (demo seed)" },
          { bookingId: booking.id, previousStatus: "CONFIRMED",            newStatus: "CANCELLED_BY_CUSTOMER", reason: "Customer cancelled (demo seed)" },
        ],
      });

      console.log(`  ✓ CANCELLED  ${exp.title.slice(0, 40)} — ${startTime.toDateString()}`);
      totalCreated++;
    }

    // ── Past refunded (1) ─────────────────────────────────────────────────
    {
      const exp = pick(experiences);
      const startTime = setMinutes(
        setHours(subDays(new Date(), randInt(90, 160)), pick(START_HOURS)),
        0
      );
      const endTime = new Date(startTime.getTime() + exp.durationMinutes * 60_000);
      const participants = 1;
      const subtotal = exp.basePriceCents;
      const fee = Math.round(subtotal * 0.15);
      const paymentId = fakePaymentId();

      const slot = await prisma.timeSlot.create({
        data: { experienceId: exp.id, startTime, endTime },
      });

      const booking = await prisma.booking.create({
        data: {
          userId: customer.id,
          timeSlotId: slot.id,
          status: "REFUNDED",
          participantCount: participants,
          currency: "EUR",
          subtotalCents: subtotal,
          totalPriceCents: subtotal,
          platformFeeCents: fee,
          hostPayoutCents: subtotal - fee,
          amountRefundedCents: subtotal,
          molliePaymentId: paymentId,
          molliePaymentStatus: "paid",
          createdAt: subDays(startTime, randInt(5, 15)),
        },
      });

      await prisma.bookingEvent.createMany({
        data: [
          { bookingId: booking.id, previousStatus: "RESERVED_HOLD",   newStatus: "CONFIRMED",     reason: "Payment confirmed (demo seed)" },
          { bookingId: booking.id, previousStatus: "CONFIRMED",         newStatus: "REFUND_PENDING", reason: "Host cancelled (demo seed)" },
          { bookingId: booking.id, previousStatus: "REFUND_PENDING",    newStatus: "REFUNDED",       reason: "Full refund issued (demo seed)" },
        ],
      });

      console.log(`  ✓ REFUNDED   ${exp.title.slice(0, 40)} — ${startTime.toDateString()}`);
      totalCreated++;
    }
  }

  console.log(`\n✅ Created ${totalCreated} demo bookings across ${customers.length} customer(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
