"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", deposits: 45_000_000, withdrawals: 12_000_000 },
  { day: "Tue", deposits: 52_000_000, withdrawals: 18_000_000 },
  { day: "Wed", deposits: 38_000_000, withdrawals: 22_000_000 },
  { day: "Thu", deposits: 65_000_000, withdrawals: 15_000_000 },
  { day: "Fri", deposits: 78_000_000, withdrawals: 25_000_000 },
  { day: "Sat", deposits: 32_000_000, withdrawals: 8_000_000 },
  { day: "Sun", deposits: 28_000_000, withdrawals: 5_000_000 },
];

function formatMillions(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

export function VolumeChart() {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Daily Transaction Volume (CFA)
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3A3A52" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#A0A0B8", fontSize: 12 }}
              axisLine={{ stroke: "#3A3A52" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatMillions}
              tick={{ fill: "#A0A0B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A2E",
                border: "1px solid #3A3A52",
                borderRadius: "8px",
                color: "#F0F0F5",
                fontSize: "13px",
              }}
              formatter={(value: number, name: string) => [
                `${formatMillions(value)} CFA`,
                name === "deposits" ? "Deposits" : "Withdrawals",
              ]}
            />
            <Bar dataKey="deposits" fill="#00A86B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="withdrawals" fill="#E74C3C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-5 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-akiba-green" />
          Deposits
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-akiba-red" />
          Withdrawals
        </div>
      </div>
    </div>
  );
}
