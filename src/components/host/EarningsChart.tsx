"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyEarning } from "@/lib/actions/host-stats";

const formatEur = (cents: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export function EarningsChart({ data }: { data: MonthlyEarning[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatEur(v)}
            width={70}
          />
          <Tooltip
            cursor={{ fill: "rgba(2, 132, 199, 0.08)" }}
            formatter={(v) => [formatEur(Number(v ?? 0)), "Einnahmen"]}
            contentStyle={{
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
          />
          <Bar dataKey="earningsCents" fill="#0284C7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
