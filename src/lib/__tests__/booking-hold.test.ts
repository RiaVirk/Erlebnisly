/**
 * @vitest-environment node
 *
 * Integration test — requires a real PostgreSQL database.
 * Run as: dotenv -e .env.test -- vitest run src/lib/__tests__/booking-hold.test.ts
 * AND set fileParallelism: false (or run this file alone) — tests share the same DB.
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";

// Requires a real PostgreSQL database. Set TEST_DATABASE_URL in .env.test and run:
//   dotenv -e .env.test -- vitest run src/lib/__tests__/booking-hold.test.ts
const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);
import { prisma } from "@/lib/prisma";

describe.skipIf(!hasTestDb)("booking hold races", () => {
  let hostId: string;
  let customerAId: string;
  let customerBId: string;
  let slotId: string;

  beforeEach(async () => {
    // Tear down all fixtures in FK-safe order
    await prisma.bookingEvent.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.mollieConnect.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();

    const cat = await prisma.category.create({
      data: { name: "Test", slug: "test" },
    });

    const host = await prisma.user.create({
      data: { clerkId: "host_clerk", role: "HOST", email: "h@test.io" },
    });
    hostId = host.id;

    await prisma.mollieConnect.create({
      data: {
        userId: hostId,
        accessTokenEnc: "fake_enc",
        refreshTokenEnc: "fake_enc",
        expiresAt: new Date(Date.now() + 3_600_000),
        mollieProfileId: "pfl_fake",
        chargesEnabled: true,
        isOnboarded: true,
      },
    });

    const [a, b] = await Promise.all([
      prisma.user.create({ data: { clerkId: "cust_a_clerk", role: "CUSTOMER", email: "a@test.io" } }),
      prisma.user.create({ data: { clerkId: "cust_b_clerk", role: "CUSTOMER", email: "b@test.io" } }),
    ]);
    customerAId = a.id;
    customerBId = b.id;

    const exp = await prisma.experience.create({
      data: {
        hostId,
        categoryId: cat.id,
        title: "T",
        shortDescription: "T",
        description: "T",
        location: "Berlin",
        durationMinutes: 60,
        maxParticipants: 1, // ONE seat
        currency: "EUR",
        basePriceCents: 5000,
        isPublished: true,
      },
    });

    const slot = await prisma.timeSlot.create({
      data: {
        experienceId: exp.id,
        startTime: new Date(Date.now() + 86400_000 * 7),
        endTime: new Date(Date.now() + 86400_000 * 7 + 3_600_000),
      },
    });
    slotId = slot.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("two concurrent holds on the last spot: exactly one wins", async () => {
    async function attemptHold(userId: string): Promise<"won" | "lost"> {
      try {
        await prisma.$transaction(
          async (tx) => {
            // Row lock prevents concurrent over-booking
            await tx.$queryRaw`SELECT id FROM "TimeSlot" WHERE id = ${slotId} FOR UPDATE`;

            const taken = await tx.booking.aggregate({
              where: {
                timeSlotId: slotId,
                status: { in: ["RESERVED_HOLD", "CONFIRMED"] },
                OR: [
                  { holdExpiresAt: null },
                  { holdExpiresAt: { gt: new Date() } },
                ],
              },
              _sum: { participantCount: true },
            });

            if ((taken._sum.participantCount ?? 0) + 1 > 1) {
              throw new Error("Not enough spots");
            }

            await tx.booking.create({
              data: {
                userId,
                timeSlotId: slotId,
                status: "RESERVED_HOLD",
                holdExpiresAt: new Date(Date.now() + 15 * 60_000),
                participantCount: 1,
                currency: "EUR",
                subtotalCents: 5000,
                totalPriceCents: 5000,
                platformFeeCents: 750,
                hostPayoutCents: 4250,
              },
            });
          },
          { isolationLevel: "Serializable", timeout: 10000 },
        );
        return "won";
      } catch {
        return "lost";
      }
    }

    const [a, b] = await Promise.all([
      attemptHold(customerAId),
      attemptHold(customerBId),
    ]);

    expect([a, b].sort()).toEqual(["lost", "won"]);

    const bookings = await prisma.booking.findMany({ where: { timeSlotId: slotId } });
    expect(bookings).toHaveLength(1);
  });
});
