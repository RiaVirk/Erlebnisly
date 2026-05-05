import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerSidebar from "./_components/CustomerSidebar";
import { ProvidersTanstack } from "@/components/shared/ProvidersTanstack";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Always check DB (not JWT) so we never hit a stale-token redirect loop
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || !user.role) redirect("/onboarding");
  if (user.role === "HOST") redirect("/host/dashboard");

  return (
    <ClerkProvider afterSignOutUrl="/">
      <ProvidersTanstack>
        <div className="min-h-screen bg-[#f7f9fb]">
          <CustomerSidebar />
          <main className="lg:ml-60 min-h-screen">{children}</main>
        </div>
      </ProvidersTanstack>
    </ClerkProvider>
  );
}
