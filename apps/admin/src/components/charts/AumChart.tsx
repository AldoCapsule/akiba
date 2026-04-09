"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { month: "Sep", aum: 1_850_000_000 },
  { month: "Oct", aum: 2_120_000_000 },
  { month: "Nov", aum: 2_340_000_000 },
  { month: "Dec", aum: 2_510_000_000 },
  { month: "Jan", aum: 2_780_000_000 },
  { month: "Feb", aum: 3_050_000_000 },
  { month: "Mar", aum: 3_420_000_000 },
  { month: "Apr", aum: 3_680_000_000 },
];

function formatBillions(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  return value.toLocaleString();
}

export function AumChart() {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Assets Under Management (CFA)
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3A3A52" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#A0A0B8", fontSize: 12 }}
              axisLine={{ stroke: "#3A3A52" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatBillions}
              tick={{ fill: "#A0A0B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A2E",
                border: "1px solid #3A3A52",
                borderRadius: "8px",
                color: "#F0F0F5",
                fontSize: "13px",
              }}
              formatter={(value: number) => [
                `${formatBillions(value)} CFA`,
                "AUM",
              ]}
            />
            <Line
              type="monotone"
              dataKey="aum"
              stroke="#00A86B"
              strokeWidth={2.5}
              dot={{ fill: "#00A86B", strokeWidth: 0, r: 4 }}
              activeDot={{ fill: "#00C97B", strokeWidth: 0, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
