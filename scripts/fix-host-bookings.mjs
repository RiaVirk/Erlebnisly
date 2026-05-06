import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { addDays, setHours, subMonths } from "date-fns";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DEMO_CLERKIDS = ["demo_customer","demo_reviewer_2","demo_reviewer_3","demo_reviewer_4","demo_reviewer_5","demo_reviewer_6"];
const DEMO_HOST_CLERKIDS = ["demo_host","demo_host_adventure","demo_host_food","demo_host_arts","demo_host_wellness","demo_host_pro"];

const REVIEWER_PERSONAS = [
  { clerkId: "demo_customer",   name: "Anna Schmidt",    email: "anna.schmidt@erlebnisly.test",    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
  { clerkId: "demo_reviewer_2", name: "Lukas Müller",    email: "lukas.mueller@erlebnisly.test",   imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { clerkId: "demo_reviewer_3", name: "Sophie Wagner",   email: "sophie.wagner@erlebnisly.test",   imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
  { clerkId: "demo_reviewer_4", name: "Jonas Fischer",   email: "jonas.fischer@erlebnisly.test",   imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" },
  { clerkId: "demo_reviewer_5", name: "Elena Bauer",     email: "elena.bauer@erlebnisly.test",     imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" },
  { clerkId: "demo_reviewer_6", name: "Marcus Hoffmann", email: "marcus.hoffmann@erlebnisly.test", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face" },
];

const REVIEW_COMMENTS = [
  "Amazing experience — exactly what I needed. Would do again without hesitation.",
  "The host was incredibly knowledgeable and made everyone feel welcome from the start.",
  "One of the best things I have done in Berlin. Genuinely exceeded my expectations.",
  "Perfectly organised, great value for money. Loved every moment.",
  "Will bring friends next time — one of the best things I have done in the city.",
  "Incredibly well run. The attention to detail made all the difference.",
  "Came back feeling completely refreshed. The perfect way to spend a morning.",
  "Professional, fun, and actually useful. Already booked the next session.",
  "I was nervous before arriving but felt completely at ease within minutes.",
  "Outstanding. One of those experiences that genuinely changes your perspective.",
];

async function main() {
  const realHosts = await prisma.user.findMany({
    where: { role: "HOST", clerkId: { notIn: DEMO_HOST_CLERKIDS } },
    select: { id: true, clerkId: true, name: true },
  });
  console.log("Real hosts:", realHosts.map(h => h.name ?? h.clerkId));
  if (realHosts.length === 0) { console.log("No real hosts found."); return; }

  const reviewers = await Promise.all(REVIEWER_PERSONAS.map(p =>
    prisma.user.upsert({
      where: { clerkId: p.clerkId },
      update: { name: p.name, imageUrl: p.imageUrl },
      create: { clerkId: p.clerkId, role: "CUSTOMER", email: p.email, name: p.name, imageUrl: p.imageUrl },
    })
  ));
  console.log("Reviewers ready:", reviewers.map(r => r.name).join(", "));

  for (const host of realHosts) {
    const demoUsers = await prisma.user.findMany({
      where: { clerkId: { in: DEMO_CLERKIDS } }, select: { id: true },
    });
    const demoUserIds = demoUsers.map(u => u.id);

    const exps = await prisma.experience.findMany({
      where: { hostId: host.id, deletedAt: null },
      select: { id: true, basePriceCents: true, durationMinutes: true },
    });
    const expIds = exps.map(e => e.id);
    console.log(`\nHost ${host.name}: ${expIds.length} experiences`);

    // Delete demo bookings/reviews/events
    const demoBookings = await prisma.booking.findMany({
      where: { userId: { in: demoUserIds }, timeSlot: { experienceId: { in: expIds } } },
      select: { id: true },
    });
    const demoBookingIds = demoBookings.map(b => b.id);
    console.log(`  Deleting ${demoBookingIds.length} old bookings...`);
    await prisma.review.deleteMany({ where: { bookingId: { in: demoBookingIds } } });
    await prisma.bookingEvent.deleteMany({ where: { bookingId: { in: demoBookingIds } } });
    await prisma.booking.deleteMany({ where: { id: { in: demoBookingIds } } });

    // Delete old past time slots
    const now = new Date();
    const deleted = await prisma.timeSlot.deleteMany({
      where: { experienceId: { in: expIds }, startTime: { lt: now } },
    });
    console.log(`  Deleted ${deleted.count} old past slots`);

    // Re-create with all 6 personas
    const N = reviewers.length;
    for (let ei = 0; ei < exps.length; ei++) {
      const exp = exps[ei];
      const reviewedIdxs = new Set();

      for (let m = 0; m < 12; m++) {
        const rIdx = (m + ei) % N;
        const reviewer = reviewers[rIdx];
        const pastStart = setHours(subMonths(now, m + 1), 10);
        const pastEnd = new Date(pastStart.getTime() + exp.durationMinutes * 60000);

        const slot = await prisma.timeSlot.create({
          data: { experienceId: exp.id, startTime: pastStart, endTime: pastEnd },
        });

        const participants = 1 + (m % 3);
        const total = exp.basePriceCents * participants;
        const fee = Math.round(total * 0.15);

        await prisma.$transaction(async (tx) => {
          const booking = await tx.booking.create({
            data: {
              userId: reviewer.id, timeSlotId: slot.id, status: "COMPLETED",
              participantCount: participants, currency: "EUR",
              subtotalCents: total, totalPriceCents: total,
              platformFeeCents: fee, hostPayoutCents: total - fee,
              molliePaymentId: `tr_fix_${host.id.slice(-6)}_${ei}_${m}`,
              molliePaymentStatus: "paid", createdAt: pastStart,
            },
          });
          await tx.bookingEvent.create({
            data: { bookingId: booking.id, newStatus: "COMPLETED", reason: "Demo reseed" },
          });
          if (!reviewedIdxs.has(rIdx)) {
            reviewedIdxs.add(rIdx);
            await tx.review.create({
              data: {
                bookingId: booking.id, userId: reviewer.id, experienceId: exp.id,
                rating: rIdx % 3 === 0 ? 4 : 5,
                comment: REVIEW_COMMENTS[(ei + rIdx) % REVIEW_COMMENTS.length],
              },
            });
          }
        }, { timeout: 15000 });
      }

      // Upcoming CONFIRMED booking with a different person
      const upSlot = await prisma.timeSlot.findFirst({
        where: { experienceId: exp.id, startTime: { gte: now } },
        orderBy: { startTime: "asc" },
      });
      if (upSlot) {
        const upReviewer = reviewers[(ei + 1) % N];
        const total = exp.basePriceCents * 2;
        const fee = Math.round(total * 0.15);
        await prisma.$transaction(async (tx) => {
          const booking = await tx.booking.create({
            data: {
              userId: upReviewer.id, timeSlotId: upSlot.id, status: "CONFIRMED",
              participantCount: 2, currency: "EUR",
              subtotalCents: total, totalPriceCents: total,
              platformFeeCents: fee, hostPayoutCents: total - fee,
              molliePaymentId: `tr_fix_up_${host.id.slice(-6)}_${ei}`,
              molliePaymentStatus: "paid",
            },
          });
          await tx.bookingEvent.create({
            data: { bookingId: booking.id, newStatus: "CONFIRMED", reason: "Demo upcoming" },
          });
        }, { timeout: 15000 });
      }
      process.stdout.write(`  exp ${ei + 1}/${exps.length} done\n`);
    }
    console.log(`Done for ${host.name}`);
  }
  console.log("\nAll hosts reseeded!");
}

main().then(() => pool.end()).catch(e => { console.error(e); pool.end(); process.exit(1); });
