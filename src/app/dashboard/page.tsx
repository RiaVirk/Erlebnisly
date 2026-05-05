import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";
import { env } from "@/lib/env";
import DashboardClient from "./_components/DashboardClient";

export default async function DashboardPage() {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  if (role === "HOST") redirect("/host/dashboard");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/onboarding");

  const now = new Date();

  const [upcomingBookings, recentBookings, completedCount, totalSpentResult, wishlistItems, recommendations] =
    await Promise.all([
      prisma.booking.findMany({
        where: { userId: user.id, status: "CONFIRMED", deletedAt: null, timeSlot: { startTime: { gte: now } } },
        include: {
          timeSlot: {
            include: {
              experience: {
                select: { title: true, timezone: true, location: true, latitude: true, longitude: true, images: true, category: { select: { name: true } } },
              },
            },
          },
        },
        orderBy: { timeSlot: { startTime: "asc" } },
        take: 5,
      }),
      prisma.booking.findMany({
        where: { userId: user.id, deletedAt: null },
        include: {
          timeSlot: {
            include: {
              experience: { select: { title: true, timezone: true, category: { select: { name: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.booking.count({ where: { userId: user.id, status: "COMPLETED", deletedAt: null } }),
      prisma.booking.aggregate({
        where: { userId: user.id, status: { in: ["CONFIRMED", "COMPLETED"] }, deletedAt: null },
        _sum: { totalPriceCents: true },
      }),
      prisma.wishlistItem.findMany({
        where: { userId: user.id },
        include: {
          experience: {
            select: { id: true, title: true, basePriceCents: true, images: true, category: { select: { name: true } } },
          },
        },
        take: 3,
      }),
      prisma.experience.findMany({
        where: { isPublished: true, isActive: true, deletedAt: null },
        include: {
          category: true,
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

  // Favourite category from all bookings
  const catCounts = recentBookings.reduce<Record<string, number>>((acc, b) => {
    const cat = b.timeSlot.experience.category.name;
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  const favouriteCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Adventure";

  const totalSpent = totalSpentResult._sum.totalPriceCents ?? 0;
  const nextBooking = upcomingBookings[0] ?? null;

  // Loyalty points: simple formula based on completed trips + spend
  const loyaltyPoints = completedCount * 75 + Math.round(totalSpent / 200);

  // Serialize next booking for client
  let serializedNext = null;
  if (nextBooking) {
    const tz = nextBooking.timeSlot.experience.timezone;
    const msLeft = nextBooking.timeSlot.startTime.getTime() - now.getTime();
    serializedNext = {
      id: nextBooking.id,
      title: nextBooking.timeSlot.experience.title,
      location: nextBooking.timeSlot.experience.location,
      category: nextBooking.timeSlot.experience.category.name,
      image: nextBooking.timeSlot.experience.images[0] ?? null,
      lat: nextBooking.timeSlot.experience.latitude,
      lon: nextBooking.timeSlot.experience.longitude,
      participants: nextBooking.participantCount,
      totalPriceCents: nextBooking.totalPriceCents,
      daysLeft: Math.max(1, Math.ceil(msLeft / 86_400_000)),
      dateLabel: formatInTimeZone(nextBooking.timeSlot.startTime, tz, "EEE, d MMM yyyy"),
      timeLabel: formatInTimeZone(nextBooking.timeSlot.startTime, tz, "HH:mm"),
    };
  }

  const serializedRecent = recentBookings.map((b) => ({
    id: b.id,
    title: b.timeSlot.experience.title,
    category: b.timeSlot.experience.category.name,
    dateLabel: formatInTimeZone(
      b.timeSlot.startTime,
      b.timeSlot.experience.timezone,
      "d MMM yyyy"
    ),
    status: b.status,
    participants: b.participantCount,
    totalPriceCents: b.totalPriceCents,
    // Points only for completed bookings: ~0.75 pts per euro
    points: b.status === "COMPLETED" ? Math.round(b.totalPriceCents / 133) : null,
  }));

  const serializedWishlist = wishlistItems.map((w) => ({
    id: w.experienceId,
    title: w.experience.title,
    category: w.experience.category.name,
    image: w.experience.images[0] ?? null,
    priceCents: w.experience.basePriceCents,
  }));

  const serializedRecs = recommendations.map((r) => {
    const avgRating =
      r._count.reviews > 0
        ? (r.reviews.reduce((s, v) => s + v.rating, 0) / r._count.reviews).toFixed(1)
        : null;
    return {
      id: r.id,
      title: r.title,
      category: r.category.name,
      priceCents: r.basePriceCents,
      durationMinutes: r.durationMinutes,
      image: r.images[0] ?? null,
      difficulty: r.difficulty as string,
      rating: avgRating,
    };
  });

  return (
    <DashboardClient
      userName={user.name ?? "Explorer"}
      completedCount={completedCount}
      upcomingCount={upcomingBookings.length}
      totalSpentCents={totalSpent}
      favouriteCategory={favouriteCategory}
      favouriteCategoryCount={catCounts[favouriteCategory] ?? 0}
      loyaltyPoints={loyaltyPoints}
      nextBooking={serializedNext}
      recentBookings={serializedRecent}
      wishlist={serializedWishlist}
      recommendations={serializedRecs}
      mapsApiKey={env.GOOGLE_MAPS_API_KEY}
    />
  );
}
