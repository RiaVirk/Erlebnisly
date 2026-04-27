import CustomerSidebar from "@/app/(customer)/_components/CustomerSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ds-background flex">
      <CustomerSidebar />
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
