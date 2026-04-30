export const metadata = { title: "Users | Admin" };

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="type-headline-md text-ds-on-surface">Users</h1>
      <div className="bg-white rounded-ds-lg border border-ds-outline-variant p-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <span className="material-symbols-outlined text-5xl text-ds-outline mb-4 block">group</span>
        <p className="type-title-sm text-ds-on-surface mb-2">User management</p>
        <p className="type-body-sm text-ds-on-surface-variant">Manage roles, access, and GDPR requests here.</p>
      </div>
    </div>
  );
}
