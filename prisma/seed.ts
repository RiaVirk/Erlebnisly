import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
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
  {
    title: "Sunrise Hike in Saxon Switzerland",
    short: "Catch the sunrise from the Bastei Bridge with a local guide.",
    cat: "adventure",
    price: 6500, max: 8, duration: 240, difficulty: "MEDIUM" as const,
    location: "Sächsische Schweiz",
  },
  {
    title: "Berlin Street-Food Walking Tour",
    short: "5 stops, 5 cuisines, plus the stories behind Kreuzberg's evolution.",
    cat: "food-drink",
    price: 5500, max: 12, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Kreuzberg",
  },
  {
    title: "Pottery Wheel Throwing for Beginners",
    short: "Make your own bowl in a converted Wedding studio.",
    cat: "arts-culture",
    price: 8500, max: 6, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Wedding",
  },
  {
    title: "Forest Bathing in Grunewald",
    short: "Three hours of guided sensory immersion in Berlin's western forest.",
    cat: "wellness",
    price: 4500, max: 10, duration: 180, difficulty: "EASY" as const,
    location: "Berlin Grunewald",
  },
  {
    title: "Sourdough Bread Workshop",
    short: "Take home your own starter and a fresh-baked loaf.",
    cat: "food-drink",
    price: 9500, max: 8, duration: 360, difficulty: "MEDIUM" as const,
    location: "Potsdam",
  },
  {
    title: "Tempelhofer Feld Cycling Tour",
    short: "Berlin's history through its abandoned airport-turned-park.",
    cat: "adventure",
    price: 3500, max: 15, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Tempelhof",
  },
  {
    title: "Mindful Photography Walk",
    short: "Slow down and learn to see. Phone or camera both work.",
    cat: "arts-culture",
    price: 5000, max: 6, duration: 150, difficulty: "EASY" as const,
    location: "Berlin Mitte",
  },
  {
    title: "Beginner Bouldering Session",
    short: "All gear included, friendly intro for first-timers.",
    cat: "adventure",
    price: 4000, max: 8, duration: 120, difficulty: "MEDIUM" as const,
    location: "Berlin Friedrichshain",
  },
  {
    title: "Resume Workshop with a Senior Recruiter",
    short: "Two hours, your CV, brutally honest feedback.",
    cat: "professional",
    price: 12000, max: 4, duration: 120, difficulty: "EASY" as const,
    location: "Berlin Mitte (Online available)",
  },
  {
    title: "Sunset Yoga at Treptower Park",
    short: "Outdoor flow class by the Spree, cushion provided.",
    cat: "wellness",
    price: 2500, max: 20, duration: 75, difficulty: "EASY" as const,
    location: "Berlin Treptow",
  },
] as const;

async function main() {
  for (const c of CATS) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log(`✅ ${CATS.length} categories`);

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

  for (const x of SAMPLE_EXPERIENCES) {
    const cat = await prisma.category.findUnique({ where: { slug: x.cat } });
    if (!cat) continue;

    const expId = `seed_${x.title.replace(/\W/g, "_").slice(0, 20)}`;

    const exp = await prisma.experience.upsert({
      where: { id: expId },
      update: {},
      create: {
        id: expId,
        hostId: host.id,
        categoryId: cat.id,
        title: x.title,
        shortDescription: x.short,
        description: `${x.short}\n\nFull description placeholder. Replace with real copy before launch.`,
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

  console.log(`✅ ${SAMPLE_EXPERIENCES.length} experiences with slots`);

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
  ];

  for (let i = 0; i < 30; i++) {
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

    if (Math.random() < 0.6) {
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

  console.log("✅ 30 demo completed bookings with reviews");
  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
