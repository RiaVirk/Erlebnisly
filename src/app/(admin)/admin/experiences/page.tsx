export const metadata = { title: "Experiences | Admin" };

export default function AdminExperiencesPage() {
  return (
    <div className="space-y-4">
      <h1 className="type-headline-md text-ds-on-surface">Experiences</h1>
      <div className="bg-white rounded-ds-lg border border-ds-outline-variant p-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <span className="material-symbols-outlined text-5xl text-ds-outline mb-4 block">travel_explore</span>
        <p className="type-title-sm text-ds-on-surface mb-2">Experience moderation</p>
        <p className="type-body-sm text-ds-on-surface-variant">Review, approve, and moderate host experiences here.</p>
      </div>
    </div>
  );
}
