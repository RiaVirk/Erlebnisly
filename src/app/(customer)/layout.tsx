import CustomerSidebar from "./_components/CustomerSidebar";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <CustomerSidebar />
      <main className="ml-60 min-h-screen">{children}</main>
    </div>
  );
}