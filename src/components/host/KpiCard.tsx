import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}

export function KpiCard({ label, value, icon: Icon, hint }: Props) {
  return (
    <div className="bg-white rounded-ds-lg border border-ds-outline-variant p-6 shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between mb-3">
        <p className="type-label-caps text-ds-on-surface-variant">{label}</p>
        <Icon className="h-4 w-4 text-ds-secondary" />
      </div>
      <p className="type-display-lg text-ds-on-surface">{value}</p>
      {hint && <p className="type-body-sm text-ds-on-surface-variant mt-1">{hint}</p>}
    </div>
  );
}
