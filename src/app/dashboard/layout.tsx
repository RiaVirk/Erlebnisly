import { ClerkProvider } from "@clerk/nextjs";
import CustomerSidebar from "@/app/(customer)/_components/CustomerSidebar";
import { ProvidersTanstack } from "@/components/shared/ProvidersTanstack";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
