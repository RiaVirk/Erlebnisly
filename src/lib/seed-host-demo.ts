"server-only";

import { prisma } from "@/lib/prisma";
import { addDays, setHours, subMonths } from "date-fns";

const DEMO_EXP_DATA = [
  {
    slug: "adventure",
    title: "Sunrise Hike in Saxon Switzerland",
    short: "Catch the first light from the Bastei Bridge with a local mountain guide.",
    desc: "There is no better alarm clock than the Bastei Bridge at dawn. This guided hike begins before first light at the trailhead in the Sächsische Schweiz, following centuries-old sandstone paths through fog-filled valleys until you emerge on the famous bridge just as the sun breaks the horizon. The golden light on the rock formations is one of Germany's most spectacular natural sights.\n\nYour guide knows every footpath, hidden viewpoint, and local legend in this UNESCO-protected landscape. The route is moderate — a mix of woodland trails and stone staircases — and suitable for anyone in reasonable fitness. Along the way you'll learn about the geology of the Elbe Sandstone Mountains and the region's history.\n\nThe experience includes warm drinks and breakfast pastries at the summit. Small group of maximum 8 ensures a personal experience. Sturdy walking shoes and weather-appropriate layers are essential.",
    price: 6500, max: 8, duration: 240, difficulty: "MEDIUM" as const,
    location: "Sächsische Schweiz", lat: 50.9152, lon: 14.0739,
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    slug: "food-drink",
    title: "Berlin Street-Food Walking Tour",
    short: "Five stops, five cuisines — discover the stories behind Kreuzberg's food scene.",
    desc: "Kreuzberg's food scene is one of the most diverse in Europe — and most of it is invisible unless you know where to look. This walking tour visits five carefully selected vendors across SO36 and the Turkish Market area, covering Lebanese shawarma, Vietnamese bánh mì, Georgian khachapuri, a legendary Turkish gözleme stall, and a cult-status Berlin-style currywurst stand. Each stop includes a full portion and a conversation with the person who makes it.\n\nThe tour curates based on quality and story rather than fame. Some of the best food on the route is served from carts with no Instagram presence and no English menu. You leave not just full, but with a real sense of how this neighbourhood works.\n\nThe tour covers approximately 2.5 kilometres on foot over 3 hours. Wear comfortable walking shoes. Dietary requirements including vegetarian, vegan, and halal can be accommodated with advance notice.",
    price: 5500, max: 12, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Kreuzberg", lat: 52.4978, lon: 13.4071,
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    slug: "arts-culture",
    title: "Pottery Wheel Throwing for Beginners",
    short: "Shape your own bowl on the wheel in a light-filled Wedding studio.",
    desc: "There is something disarmingly honest about pottery — the clay responds to exactly the pressure and attention you give it, no more and no less. This introductory session begins with wedging and centering, the two most fundamental and most challenging skills, then moves through opening, raising, and shaping a simple bowl form. By the end of the 2.5-hour session, most participants have a piece they are genuinely proud of.\n\nThe studio is light-filled and unhurried. There are no expectations about what your piece should look like; the goal is to understand how clay responds and to experience the particular focus that hand-work demands. First-time participants regularly describe it as the most meditative two hours they have had in years.\n\nAll materials and tools are provided. Your piece will be bisque-fired and available for collection 2 weeks after the session. Maximum 6 participants per session.",
    price: 8500, max: 6, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Wedding", lat: 52.5512, lon: 13.3553,
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    slug: "wellness",
    title: "Forest Bathing in Grunewald",
    short: "Three hours of guided sensory immersion in Berlin's ancient western forest.",
    desc: "Shinrin-yoku — forest bathing — emerged from Japanese preventive medicine research as a response to the chronic stress diseases of urban life. The practice involves slow, sensory immersion in forest environments, and the research behind it is substantial: measurable reductions in cortisol, blood pressure, and inflammatory markers. This 3-hour guided session in the Grunewald teaches you the practice properly.\n\nThe session involves very slow walking, guided sensory invitations, periods of sitting silence, and a tea ceremony in the forest. There is no exercise component; the point is deceleration. Most participants find the experience more challenging than expected at first, and more restorative than anything else they have tried.\n\nDuration 3 hours. Maximum 10 participants. Wear comfortable, weather-appropriate clothing. The forest is always cooler than the city — bring a layer. The session runs in all weather except thunder or heavy snow.",
    price: 4500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Grunewald", lat: 52.4880, lon: 13.2364,
    images: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    slug: "professional",
    title: "Public Speaking & Presentation Masterclass",
    short: "Evidence-based coaching to build real speaking confidence in 3 hours.",
    desc: "Fear of public speaking is a rational response to social threat that can be systematically dismantled. This intensive workshop uses cognitive-behavioural techniques, deliberate practice protocols, and real-time performance coaching to produce measurable improvements in speaking confidence. Every participant speaks at least 4 times during the session.\n\nThe session covers the three most common performance errors (speed, eye contact, and filler words), how to structure a talk for maximum retention, and the specific physical and breathing techniques that reduce the cortisol response causing voice shaking and mental blanking. Video feedback is used in the final segment.\n\nMaximum 8 participants. The small group is essential — this is not a seminar, it is a practice environment. Bring a 2-minute story or talk you can deliver.",
    price: 9500, max: 8, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Mitte", lat: 52.5200, lon: 13.4050,
    images: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
] as const;

// 6 distinct reviewer personas — same set as the main seed
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
  "One of the best things I've done in Berlin. Genuinely exceeded my expectations.",
  "Perfectly organised, great value for money. Loved every moment.",
  "Will bring friends next time — one of the best things I've done in the city.",
  "Incredibly well run. The attention to detail made all the difference.",
  "Came back feeling completely refreshed. The perfect way to spend a morning.",
  "Professional, fun, and actually useful. Already booked the next session.",
  "I was nervous before arriving but felt completely at ease within minutes.",
  "Outstanding. One of those experiences that genuinely changes your perspective.",
];

const DEMO_CLERKIDS = REVIEWER_PERSONAS.map((p) => p.clerkId);

export async function seedHostDemoData(hostUserId: string): Promise<void> {
  const existing = await prisma.experience.count({
    where: { hostId: hostUserId, deletedAt: null },
  });
  if (existing > 0) {
    // Experiences exist — but bookings may have been seeded with the old
    // single-persona approach. Clean demo bookings and re-seed them.
    await _cleanAndReseedBookings(hostUserId);
    return;
  }

  await _seedMollieConnect(hostUserId);
  const reviewers = await _upsertReviewers();
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));
  const now = new Date();

  for (let ei = 0; ei < DEMO_EXP_DATA.length; ei++) {
    const data = DEMO_EXP_DATA[ei];
    const categoryId = catMap.get(data.slug);
    if (!categoryId) continue;

    const exp = await prisma.experience.create({
      data: {
        hostId: hostUserId, categoryId,
        title: data.title, shortDescription: data.short, description: data.desc,
        images: [...data.images], location: data.location,
        latitude: data.lat, longitude: data.lon,
        durationMinutes: data.duration, minParticipants: 1, maxParticipants: data.max,
        difficulty: data.difficulty, currency: "EUR",
        basePriceCents: data.price, minPriceCents: data.price, maxPriceCents: data.price,
        timezone: "Europe/Berlin", isPublished: true,
      },
    });

    // 3 upcoming time slots
    for (const days of [3, 7, 14]) {
      const start = setHours(addDays(now, days), 10);
      await prisma.timeSlot.create({
        data: { experienceId: exp.id, startTime: start, endTime: new Date(start.getTime() + data.duration * 60_000) },
      });
    }

    await _createDemoBookings(exp.id, data.price, data.duration, hostUserId, ei, reviewers, now);
  }

  console.log(`[seedHostDemoData] Seeded demo data for host ${hostUserId}`);
}

// ─── helpers ────────────────────────────────────────────────────────────────

async function _seedMollieConnect(hostUserId: string) {
  await prisma.mollieConnect.upsert({
    where: { userId: hostUserId },
    update: {},
    create: {
      userId: hostUserId,
      accessTokenEnc: "demo_enc", refreshTokenEnc: "demo_enc",
      expiresAt: new Date(Date.now() + 86_400_000 * 365),
      mollieProfileId: `pfl_demo_${hostUserId.slice(-8)}`,
      chargesEnabled: true, isOnboarded: true,
    },
  });
}

async function _upsertReviewers() {
  return Promise.all(
    REVIEWER_PERSONAS.map((p) =>
      prisma.user.upsert({
        where: { clerkId: p.clerkId },
        update: { name: p.name, imageUrl: p.imageUrl },
        create: { clerkId: p.clerkId, role: "CUSTOMER", email: p.email, name: p.name, imageUrl: p.imageUrl },
      })
    )
  );
}

async function _createDemoBookings(
  experienceId: string,
  priceCents: number,
  durationMinutes: number,
  hostUserId: string,
  expIndex: number,
  reviewers: { id: string }[],
  now: Date,
) {
  const N = reviewers.length; // 6
  const reviewedByIndex = new Set<number>();

  // 12 past months — reviewer cycles [0,1,2,3,4,5,0,1,2,3,4,5]
  // Consecutive months always get a different person ✓
  // Each person appears exactly twice → max 2 per person ✓
  for (let m = 0; m < 12; m++) {
    const reviewerIdx = m % N;
    const reviewer = reviewers[reviewerIdx];
    const pastStart = setHours(subMonths(now, m + 1), 10);
    const pastEnd = new Date(pastStart.getTime() + durationMinutes * 60_000);

    const pastSlot = await prisma.timeSlot.create({
      data: { experienceId, startTime: pastStart, endTime: pastEnd },
    });

    const participants = 1 + (m % 3);
    const total = priceCents * participants;
    const fee = Math.round(total * 0.15);

    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: reviewer.id, timeSlotId: pastSlot.id, status: "COMPLETED",
          participantCount: participants, currency: "EUR",
          subtotalCents: total, totalPriceCents: total,
          platformFeeCents: fee, hostPayoutCents: total - fee,
          molliePaymentId: `tr_hdemo_${hostUserId.slice(-6)}_${expIndex}_${m}`,
          molliePaymentStatus: "paid",
          createdAt: pastStart,
        },
      });

      await tx.bookingEvent.create({
        data: { bookingId: booking.id, newStatus: "COMPLETED", reason: "Demo booking" },
      });

      // First booking for this reviewer on this experience → leave a review
      if (!reviewedByIndex.has(reviewerIdx)) {
        reviewedByIndex.add(reviewerIdx);
        await tx.review.create({
          data: {
            bookingId: booking.id, userId: reviewer.id, experienceId,
            rating: reviewerIdx % 3 === 0 ? 4 : 5,
            comment: REVIEW_COMMENTS[(expIndex + reviewerIdx) % REVIEW_COMMENTS.length],
          },
        });
      }
    }, { timeout: 15_000 });
  }

  // 1 upcoming CONFIRMED booking — use a reviewer different from the last past one
  const upcomingSlot = await prisma.timeSlot.findFirst({
    where: { experienceId, startTime: { gte: now } },
    orderBy: { startTime: "asc" },
  });
  if (upcomingSlot) {
    const upcomingReviewer = reviewers[(expIndex + 1) % N];
    const participants = 2;
    const total = priceCents * participants;
    const fee = Math.round(total * 0.15);

    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: upcomingReviewer.id, timeSlotId: upcomingSlot.id, status: "CONFIRMED",
          participantCount: participants, currency: "EUR",
          subtotalCents: total, totalPriceCents: total,
          platformFeeCents: fee, hostPayoutCents: total - fee,
          molliePaymentId: `tr_hdemo_up_${hostUserId.slice(-6)}_${expIndex}`,
          molliePaymentStatus: "paid",
        },
      });
      await tx.bookingEvent.create({
        data: { bookingId: booking.id, newStatus: "CONFIRMED", reason: "Demo upcoming booking" },
      });
    }, { timeout: 15_000 });
  }
}

async function _cleanAndReseedBookings(hostUserId: string): Promise<void> {
  // Find demo reviewer DB ids
  const demoUsers = await prisma.user.findMany({
    where: { clerkId: { in: DEMO_CLERKIDS } },
    select: { id: true },
  });
  if (demoUsers.length === 0) return;

  const demoUserIds = demoUsers.map((u) => u.id);

  // Already correctly seeded with multiple personas?
  const uniqueReviewers = await prisma.booking.groupBy({
    by: ["userId"],
    where: {
      userId: { in: demoUserIds },
      timeSlot: { experience: { hostId: hostUserId } },
    },
  });
  if (uniqueReviewers.length >= 4) return; // already multi-persona

  // Delete demo reviews, events, bookings for this host's experiences
  const expIds = await prisma.experience.findMany({
    where: { hostId: hostUserId, deletedAt: null },
    select: { id: true },
  });
  const experienceIds = expIds.map((e) => e.id);

  const demoBookings = await prisma.booking.findMany({
    where: { userId: { in: demoUserIds }, timeSlot: { experienceId: { in: experienceIds } } },
    select: { id: true },
  });
  const demoBookingIds = demoBookings.map((b) => b.id);

  await prisma.review.deleteMany({ where: { bookingId: { in: demoBookingIds } } });
  await prisma.bookingEvent.deleteMany({ where: { bookingId: { in: demoBookingIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: demoBookingIds } } });

  // Delete the old single-reviewer past time slots (no upcoming ones)
  const now = new Date();
  await prisma.timeSlot.deleteMany({
    where: { experienceId: { in: experienceIds }, startTime: { lt: now } },
  });

  // Re-seed bookings with all 6 personas
  const reviewers = await _upsertReviewers();
  for (let ei = 0; ei < expIds.length; ei++) {
    const exp = await prisma.experience.findUnique({
      where: { id: expIds[ei].id },
      select: { id: true, basePriceCents: true, durationMinutes: true },
    });
    if (!exp) continue;
    await _createDemoBookings(exp.id, exp.basePriceCents, exp.durationMinutes, hostUserId, ei, reviewers, now);
  }

  console.log(`[seedHostDemoData] Re-seeded bookings with 6 personas for host ${hostUserId}`);
}
