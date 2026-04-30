import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ error: "No user" }, { status: 404 });

  const anonymizedAt = new Date();
  const anonHandle = `Deleted user ${dbUser.id.slice(-6)}`;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: dbUser.id },
      data: {
        email: null,
        name: anonHandle,
        imageUrl: null,
        anonymizedAt,
        deletedAt: anonymizedAt,
      },
    }),
    prisma.participant.updateMany({
      where: { booking: { userId: dbUser.id } },
      data: { name: "—", notes: null, anonymizedAt },
    }),
    prisma.review.updateMany({
      where: { userId: dbUser.id },
      data: { comment: null },
    }),
    prisma.notification.deleteMany({
      where: { userId: dbUser.id },
    }),
    prisma.wishlistItem.deleteMany({
      where: { userId: dbUser.id },
    }),
  ]);

  // Disconnect Clerk so the user cannot sign back in
  try {
    const cc = await clerkClient();
    await cc.users.deleteUser(clerkId);
  } catch (err) {
    // Data is already scrubbed — log for manual Clerk cleanup
    console.error("[anonymize] Clerk delete failed", err);
  }

  return NextResponse.json({ ok: true });
}
