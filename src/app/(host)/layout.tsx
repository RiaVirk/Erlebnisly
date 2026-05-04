import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HostSidebar from "./_components/HostSidebar";
import { ProvidersTanstack } from "@/components/shared/ProvidersTanstack";

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "HOST" && role !== "ADMIN") redirect("/dashboard");

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