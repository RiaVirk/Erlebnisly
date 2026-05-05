import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HostSidebar from "./_components/HostSidebar";
import { ProvidersTanstack } from "@/components/shared/ProvidersTanstack";

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Check DB directly — never rely on a potentially stale JWT for role gating
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || !user.role) redirect("/onboarding");
  if (user.role !== "HOST" && user.role !== "ADMIN") redirect("/dashboard");

  return (
    <ClerkProvider afterSignOutUrl="/">
      <ProvidersTanstack>
        <div className="min-h-screen bg-ds-background">
          <HostSidebar />
          <main className="lg:ml-60 min-h-screen">{children}</main>
        </div>
      </ProvidersTanstack>
    </ClerkProvider>
  );
}
