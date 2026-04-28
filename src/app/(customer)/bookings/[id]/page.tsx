import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  const booking = await prisma.booking.findFirst({
    where: { id, user: { clerkId } },
    include: { timeSlot: { include: { experience: true } } },
  });
  if (!booking) notFound();

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold mb-4">{booking.timeSlot.experience.title}</h1>
      <p className="text-muted-foreground">Status: {booking.status}</p>
      {/* Review form shown when status === COMPLETED — implemented in review step */}
    </main>
  );
}
