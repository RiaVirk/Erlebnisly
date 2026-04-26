export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <a href="/experiences" className="font-bold text-lg">Bookly</a>
        <div className="flex gap-4 text-sm">
          <a href="/experiences">Browse</a>
          <a href="/bookings">My Bookings</a>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}