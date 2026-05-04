import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { addDays, setHours, subDays } from "date-fns";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CATS = [
  { slug: "adventure",    name: "Adventure" },
  { slug: "food-drink",   name: "Food & Drink" },
  { slug: "arts-culture", name: "Arts & Culture" },
  { slug: "wellness",     name: "Wellness" },
  { slug: "professional", name: "Professional" },
];

const SAMPLE_EXPERIENCES = [
  // ── Adventure ────────────────────────────────────────────────────────
  {
    id: "exp-adventure-sunrise-hike",
    title: "Sunrise Hike in Saxon Switzerland",
    short: "Catch the sunrise from the Bastei Bridge with a local guide.",
    cat: "adventure", price: 6500, max: 8, duration: 240, difficulty: "MEDIUM" as const,
    location: "Sächsische Schweiz",
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-cycling-tour",
    title: "Tempelhofer Feld Cycling Tour",
    short: "Berlin's history through its abandoned airport-turned-park.",
    cat: "adventure", price: 3500, max: 15, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Tempelhof",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-bouldering",
    title: "Beginner Bouldering Session",
    short: "All gear included, friendly intro for first-timers.",
    cat: "adventure", price: 4000, max: 8, duration: 120, difficulty: "MEDIUM" as const,
    location: "Berlin Friedrichshain",
    images: [
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-adventure-kayaking",
    title: "Kayaking on the Müggelsee",
    short: "Paddle through Berlin's largest lake with a certified guide.",
    cat: "adventure", price: 5500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Köpenick",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },

  // ── Food & Drink ─────────────────────────────────────────────────────
  {
    id: "exp-food-street-food-tour",
    title: "Berlin Street-Food Walking Tour",
    short: "5 stops, 5 cuisines, plus the stories behind Kreuzberg's evolution.",
    cat: "food-drink", price: 5500, max: 12, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Kreuzberg",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-sourdough",
    title: "Sourdough Bread Workshop",
    short: "Take home your own starter and a fresh-baked loaf.",
    cat: "food-drink", price: 9500, max: 8, duration: 360, difficulty: "MEDIUM" as const,
    location: "Potsdam",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-wine-tasting",
    title: "Natural Wine Tasting Evening",
    short: "Discover six low-intervention wines with a certified sommelier.",
    cat: "food-drink", price: 7500, max: 10, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Prenzlauer Berg",
    images: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-food-sushi",
    title: "Sushi Rolling Masterclass",
    short: "Learn nigiri, maki, and hand rolls from a Japanese chef.",
    cat: "food-drink", price: 8500, max: 8, duration: 180, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },

  // ── Arts & Culture ───────────────────────────────────────────────────
  {
    id: "exp-arts-pottery",
    title: "Pottery Wheel Throwing for Beginners",
    short: "Make your own bowl in a converted Wedding studio.",
    cat: "arts-culture", price: 8500, max: 6, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Wedding",
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-photography",
    title: "Mindful Photography Walk",
    short: "Slow down and learn to see. Phone or camera both work.",
    cat: "arts-culture", price: 5000, max: 6, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764b8?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-street-art",
    title: "Berlin Street Art & Graffiti Tour",
    short: "Explore murals across Kreuzberg and Friedrichshain with a working artist.",
    cat: "arts-culture", price: 4500, max: 14, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Kreuzberg",
    images: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-arts-watercolour",
    title: "Watercolour Painting for Adults",
    short: "Two hours, paper, pigment, and a patient tutor. No experience needed.",
    cat: "arts-culture", price: 6000, max: 8, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Schöneberg",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },

  // ── Wellness ─────────────────────────────────────────────────────────
  {
    id: "exp-wellness-forest-bathing",
    title: "Forest Bathing in Grunewald",
    short: "Three hours of guided sensory immersion in Berlin's western forest.",
    cat: "wellness", price: 4500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Grunewald",
    images: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-sunset-yoga",
    title: "Sunset Yoga at Treptower Park",
    short: "Outdoor flow class by the Spree, cushion provided.",
    cat: "wellness", price: 2500, max: 20, duration: 75, difficulty: "EASY" as const,
    location: "Berlin Treptow",
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-sound-healing",
    title: "Sound Healing & Breathwork Session",
    short: "Tibetan bowls, breath techniques, and a deep nervous-system reset.",
    cat: "wellness", price: 5500, max: 12, duration: 90, difficulty: "EASY" as const,
    location: "Berlin Neukölln",
    images: [
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-wellness-cold-plunge",
    title: "Cold Plunge & Sauna Ritual",
    short: "Nordic contrast therapy guided by a certified wellness coach.",
    cat: "wellness", price: 6500, max: 8, duration: 120, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },

  // ── Professional ─────────────────────────────────────────────────────
  {
    id: "exp-pro-resume-workshop",
    title: "Resume Workshop with a Senior Recruiter",
    short: "Two hours, your CV, brutally honest feedback.",
    cat: "professional", price: 12000, max: 4, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Mitte (Online available)",
    images: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-public-speaking",
    title: "Public Speaking & Presentation Coaching",
    short: "Master storytelling, slide design, and stage presence in one afternoon.",
    cat: "professional", price: 15000, max: 6, duration: 180, difficulty: "MEDIUM" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-linkedin",
    title: "LinkedIn Profile & Personal Brand Masterclass",
    short: "Rewrite your profile live with a top-100 LinkedIn creator.",
    cat: "professional", price: 9500, max: 8, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Charlottenburg (Online available)",
    images: [
      "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
  {
    id: "exp-pro-negotiation",
    title: "Negotiation Skills Intensive",
    short: "Role-play real scenarios and learn frameworks used by top dealmakers.",
    cat: "professional", price: 18000, max: 6, duration: 240, difficulty: "HARD" as const,
    location: "Berlin Mitte",
    images: [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=800&h=600&fit=crop&auto=format&q=80",
    ],
  },
] as const;

async function main() {
  // ── Clean up old seed data (variable-length IDs from previous runs) ──
  // Delete in FK-safe order: reviews → bookings → timeslots → experiences
  const oldIds = await prisma.experience.findMany({
    where: { id: { startsWith: "seed_" } },
    select: { id: true },
  });
  if (oldIds.length > 0) {
    const ids = oldIds.map((e) => e.id);
    console.log(`🧹 Removing ${ids.length} old seed_ experiences…`);
    const slots = await prisma.timeSlot.findMany({
      where: { experienceId: { in: ids } },
      select: { id: true },
    });
    const slotIds = slots.map((s) => s.id);
    await prisma.review.deleteMany({ where: { experienceId: { in: ids } } });
    await prisma.bookingEvent.deleteMany({ where: { booking: { timeSlotId: { in: slotIds } } } });
    await prisma.booking.deleteMany({ where: { timeSlotId: { in: slotIds } } });
    await prisma.wishlistItem.deleteMany({ where: { experienceId: { in: ids } } });
    await prisma.timeSlot.deleteMany({ where: { experienceId: { in: ids } } });
    await prisma.experience.deleteMany({ where: { id: { in: ids } } });
  }

  // ── Categories ────────────────────────────────────────────────────────
  for (const c of CATS) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log(`✅ ${CATS.length} categories`);

  // ── Demo host ─────────────────────────────────────────────────────────
  const host = await prisma.user.upsert({
    where: { clerkId: "demo_host" },
    update: {},
    create: {
      clerkId: "demo_host",
      role: "HOST",
      email: "demo-host@erlebnisly.test",
      name: "Demo Host",
      hostProfile: {
        create: { bio: "Experienced city guide.", location: "Berlin", isVerified: true },
      },
      mollieConnect: {
        create: {
          accessTokenEnc: "test_enc",
          refreshTokenEnc: "test_enc",
          expiresAt: new Date(Date.now() + 86400_000 * 30),
          mollieProfileId: "pfl_demo",
          chargesEnabled: true,
          isOnboarded: true,
        },
      },
    },
  });

  // ── Experiences + time slots ──────────────────────────────────────────
  for (const x of SAMPLE_EXPERIENCES) {
    const cat = await prisma.category.findUnique({ where: { slug: x.cat } });
    if (!cat) continue;

    const exp = await prisma.experience.upsert({
      where: { id: x.id },
      update: { images: [...x.images], title: x.title, shortDescription: x.short },
      create: {
        id: x.id,
        hostId: host.id,
        categoryId: cat.id,
        title: x.title,
        shortDescription: x.short,
        description: `${x.short}\n\nFull description placeholder.`,
        location: x.location,
        durationMinutes: x.duration,
        maxParticipants: x.max,
        difficulty: x.difficulty,
        currency: "EUR",
        basePriceCents: x.price,
        minPriceCents: x.price,
        maxPriceCents: x.price,
        timezone: "Europe/Berlin",
        isPublished: true,
        images: [...x.images],
      },
    });

    for (const offsetDays of [3, 7, 14]) {
      const start = setHours(addDays(new Date(), offsetDays), 10);
      const end = new Date(start.getTime() + x.duration * 60_000);
      await prisma.timeSlot.upsert({
        where: { experienceId_startTime: { experienceId: exp.id, startTime: start } },
        update: {},
        create: { experienceId: exp.id, startTime: start, endTime: end },
      });
    }
  }

  console.log(`✅ ${SAMPLE_EXPERIENCES.length} experiences with slots and images`);

  // ── Demo customer + bookings + reviews ────────────────────────────────
  const demoCustomer = await prisma.user.upsert({
    where: { clerkId: "demo_customer" },
    update: {},
    create: {
      clerkId: "demo_customer",
      role: "CUSTOMER",
      email: "demo-customer@erlebnisly.test",
      name: "Anna Schmidt",
    },
  });

  const allExperiences = await prisma.experience.findMany({ include: { timeSlots: true } });

  const REVIEW_COMMENTS = [
    "Amazing experience, would do again!",
    "Our host was knowledgeable and friendly.",
    "Great way to spend an afternoon.",
    "Highly recommend — exceeded expectations.",
    "Perfectly organised, great value.",
    "Loved every moment — will bring friends next time!",
    "Exceeded all my expectations.",
    "Incredibly well run. Worth every cent.",
  ];

  for (let i = 0; i < 60; i++) {
    const exp = allExperiences[i % allExperiences.length];
    if (!exp || exp.timeSlots.length === 0) continue;

    const slotStart = subDays(new Date(), Math.floor(Math.random() * 180) + 2);
    const slotEnd = new Date(slotStart.getTime() + exp.durationMinutes * 60_000);

    const pastSlot = await prisma.timeSlot.create({
      data: { experienceId: exp.id, startTime: slotStart, endTime: slotEnd },
    });

    const participants = 1 + Math.floor(Math.random() * 3);
    const total = exp.basePriceCents * participants;
    const fee = Math.round(total * 0.15);
    const created = subDays(new Date(), Math.floor(Math.random() * 180));

    const booking = await prisma.booking.create({
      data: {
        userId: demoCustomer.id,
        timeSlotId: pastSlot.id,
        status: "COMPLETED",
        participantCount: participants,
        currency: "EUR",
        subtotalCents: total,
        totalPriceCents: total,
        platformFeeCents: fee,
        hostPayoutCents: total - fee,
        molliePaymentId: `tr_demo_seed_${i}`,
        molliePaymentStatus: "paid",
        createdAt: created,
      },
    });

    if (Math.random() < 0.7) {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          userId: demoCustomer.id,
          experienceId: exp.id,
          rating: 4 + Math.floor(Math.random() * 2),
          comment: REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)],
        },
      });
    }
  }

  console.log("✅ 60 demo bookings with reviews");
  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
