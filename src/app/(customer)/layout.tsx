import CustomerSidebar from "./_components/CustomerSidebar";
import { ProvidersTanstack } from "@/components/shared/ProvidersTanstack";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProvidersTanstack>
      <div className="min-h-screen bg-[#f7f9fb]">
        <CustomerSidebar />
        <main className="ml-60 min-h-screen">{children}</main>
      </div>
    </ProvidersTanstack>
  );
}