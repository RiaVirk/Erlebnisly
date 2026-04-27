import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCentsEUR } from "@/lib/pricing/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toZonedTime, format as formatTz } from "date-fns-tz";

export default async function HostBookingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  // Get bookings for all experiences this host owns
  const bookings = await prisma.booking.findMany({
    where: {
      deletedAt: null,
      timeSlot: {
        experience: { hostId: user.id },
      },
    },
    include: {
      timeSlot: {
        include: {
          experience: { select: { title: true, timezone: true } },
        },
      },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bookings</h1>
      <p className="text-muted-foreground text-sm">{bookings.length} bookings total</p>

      <div className="space-y-3">
        {bookings.map((b) => {
          const tz = b.timeSlot.experience.timezone;
          const local = toZonedTime(b.timeSlot.startTime, tz);
          return (
            <Card key={b.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{b.timeSlot.experience.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTz(local, "d MMM yyyy, HH:mm", { timeZone: tz })}
                    {" · "}
                    {b.participantCount} participant{b.participantCount > 1 ? "s" : ""}
                    {" · "}
                    {b.user.name ?? b.user.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCentsEUR(b.hostPayoutCents)}</p>
                  <p className="text-xs text-muted-foreground">your payout</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {b.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}