export const metadata = { title: "Bookings | Admin" };

export default function AdminBookingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="type-headline-md text-ds-on-surface">Bookings</h1>
      <div className="bg-white rounded-ds-lg border border-ds-outline-variant p-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <span className="material-symbols-outlined text-5xl text-ds-outline mb-4 block">confirmation_number</span>
        <p className="type-title-sm text-ds-on-surface mb-2">Booking moderation</p>
        <p className="type-body-sm text-ds-on-surface-variant">Full booking management coming soon.</p>
      </div>
    </div>
  );
}
