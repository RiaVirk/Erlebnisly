import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function DemoCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentId?: string }>;
}) {
  if (!env.DEMO_MODE) notFound();

  const { id: bookingId } = await params;
  const { paymentId } = await searchParams;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { timeSlot: { include: { experience: true } } },
  });
  if (!booking) notFound();

  async function pay(formData: FormData) {
    "use server";
    const action = formData.get("action") as "paid" | "canceled";
    await fetch(`${env.APP_URL}/api/demo/simulate-webhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId, action, paymentId }),
    });
    redirect(`${env.APP_URL}/bookings/${bookingId}/thank-you`);
  }

  const eur = (booking.totalPriceCents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <span className="text-2xl font-bold text-blue-600">mollie</span>
          <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
            DEMO
          </span>
        </div>

        <p className="text-sm text-muted-foreground">Pay to Erlebnisly</p>
        <p className="mb-6 text-3xl font-bold">€{eur}</p>

        <div className="mb-6 rounded border p-3 text-sm">
          <p className="font-medium">{booking.timeSlot.experience.title}</p>
          <p className="text-muted-foreground">
            {booking.participantCount} participant
            {booking.participantCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-3">
          <input
            disabled
            placeholder="4111 1111 1111 1111"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <input
              disabled
              placeholder="MM/YY"
              className="w-1/2 rounded border px-3 py-2 text-sm"
            />
            <input
              disabled
              placeholder="CVC"
              className="w-1/2 rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <form action={pay} className="mt-6 space-y-2">
          <Button
            type="submit"
            name="action"
            value="paid"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Pay €{eur}
          </Button>
          <Button
            type="submit"
            name="action"
            value="canceled"
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo mode — no real payment is processed.
        </p>
      </div>
    </div>
  );
}
