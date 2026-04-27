import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
    // sessionClaims.publicMetadata.role is only set after setUserRole() runs in onboarding
    if (role === "HOST") redirect("/host/dashboard");
    if (role === "CUSTOMER") redirect("/dashboard");
    // No role in session token = new user who hasn't completed onboarding yet
    redirect("/onboarding");
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