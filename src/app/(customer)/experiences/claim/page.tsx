import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; slotId?: string }>;
}) {
  const { token, slotId } = await searchParams;

  if (!token || !slotId) {
    return <ClaimError message="Invalid claim link." />;
  }

  let entryId: string;
  try {
    const secret = new TextEncoder().encode(env.ENCRYPTION_KEY);
    const { payload } = await jwtVerify(token, secret);
    entryId = payload.entryId as string;
  } catch {
    return <ClaimError message="This link has expired or is invalid." />;
  }

  const entry = await prisma.waitlistEntry.findUnique({
    where: { id: entryId },
    include: {
      timeSlot: {
        include: {
          experience: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!entry) {
    return <ClaimError message="Waitlist entry not found." />;
  }
  if (entry.claimedAt) {
    return <ClaimError message="You have already used this claim link." />;
  }
  if (entry.promotionExpiresAt && entry.promotionExpiresAt < new Date()) {
    return (
      <ClaimError message="This offer expired. Check your email — we may have sent a new one." />
    );
  }

  await prisma.waitlistEntry.update({
    where: { id: entryId },
    data: { claimedAt: new Date() },
  });

  redirect(
    `/experiences/${entry.timeSlot.experience.id}?slotId=${slotId}&fromWaitlist=1`
  );
}

function ClaimError({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Unable to claim spot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <Button asChild variant="outline">
            <Link href="/experiences">Browse other experiences</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
