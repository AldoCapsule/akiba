"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const data = [
  { name: "Government Bonds", value: 35, color: "#00A86B" },
  { name: "Money Market", value: 25, color: "#3498DB" },
  { name: "Equities (BRVM)", value: 20, color: "#F5A623" },
  { name: "Real Estate Fund", value: 12, color: "#9B59B6" },
  { name: "Corporate Bonds", value: 8, color: "#E74C3C" },
];

export function AllocationPie() {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Platform Asset Allocation
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A2E",
                border: "1px solid #3A3A52",
                borderRadius: "8px",
                color: "#F0F0F5",
                fontSize: "13px",
              }}
              formatter={(value: number, name: string) => [`${value}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-text-muted truncate">{item.name}</span>
            <span className="ml-auto font-medium text-text-secondary">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
