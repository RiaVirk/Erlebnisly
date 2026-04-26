import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user) {
      // Redirect already-onboarded users to their dashboard
      if (user.role === "HOST") redirect("/host/dashboard");
      if (user.role === "CUSTOMER") redirect("/dashboard");
      // New user with default role — send to onboarding
      redirect("/onboarding");
    }
  }

  // Public landing page for unauthenticated visitors
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">Bookly</h1>
      <p className="text-xl text-muted-foreground">Discover unique experiences near you</p>
      <div className="flex gap-4">
        <Button asChild><Link href="/sign-up">Get started</Link></Button>
        <Button variant="outline" asChild><Link href="/experiences">Browse</Link></Button>
      </div>
    </main>
  );
}