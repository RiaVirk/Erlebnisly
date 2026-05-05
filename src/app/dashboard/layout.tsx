import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerSidebar from "@/app/(customer)/_components/CustomerSidebar";
import { ProvidersTanstack } from "@/components/shared/ProvidersTanstack";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || !user.role) redirect("/onboarding");
  if (user.role === "HOST") redirect("/host/dashboard");

  return (
    <ClerkProvider afterSignOutUrl="/">
      <ProvidersTanstack>
        <div className="min-h-screen bg-ds-background flex">
          <CustomerSidebar />
          <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">
            {children}
          </div>
        </div>
      </ProvidersTanstack>
    </ClerkProvider>
  );
}
