import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { toZonedTime, format as formatTz } from "date-fns-tz";

export default async function CustomerBookingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id, deletedAt: null },
    include: {
      timeSlot: { include: { experience: { select: { title: true, timezone: true, category: { select: { icon: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>

      {bookings.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          No bookings yet.{" "}
          <Link href="/experiences" className="text-primary underline">Browse experiences</Link>
        </Card>
      )}

      <div className="space-y-4">
        {bookings.map((b) => {
          const tz = b.timeSlot.experience.timezone;
          const local = toZonedTime(b.timeSlot.startTime, tz);
          return (
            <Link key={b.id} href={`/bookings/${b.id}/thank-you`}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {b.timeSlot.experience.category.icon}{" "}
                      {b.timeSlot.experience.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTz(local, "EEE, d MMM yyyy 'at' HH:mm", { timeZone: tz })}
                      {" · "}
                      {b.participantCount} person{b.participantCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCentsEUR(b.totalPriceCents)}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {b.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}