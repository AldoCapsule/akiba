"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Download, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { formatCFA } from "@/lib/utils";

// --- Mock data ---

const revenueData = [
  { month: "Sep", revenue: 12_500_000, fees: 8_200_000, subscriptions: 4_300_000 },
  { month: "Oct", revenue: 14_800_000, fees: 9_600_000, subscriptions: 5_200_000 },
  { month: "Nov", revenue: 13_200_000, fees: 8_800_000, subscriptions: 4_400_000 },
  { month: "Dec", revenue: 16_500_000, fees: 10_500_000, subscriptions: 6_000_000 },
  { month: "Jan", revenue: 18_200_000, fees: 11_800_000, subscriptions: 6_400_000 },
  { month: "Feb", revenue: 19_800_000, fees: 12_400_000, subscriptions: 7_400_000 },
  { month: "Mar", revenue: 22_400_000, fees: 14_200_000, subscriptions: 8_200_000 },
  { month: "Apr", revenue: 24_100_000, fees: 15_000_000, subscriptions: 9_100_000 },
];

const volumeData = [
  { month: "Sep", deposits: 680_000_000, withdrawals: 320_000_000, investments: 450_000_000 },
  { month: "Oct", deposits: 750_000_000, withdrawals: 380_000_000, investments: 520_000_000 },
  { month: "Nov", deposits: 720_000_000, withdrawals: 350_000_000, investments: 480_000_000 },
  { month: "Dec", deposits: 890_000_000, withdrawals: 420_000_000, investments: 610_000_000 },
  { month: "Jan", deposits: 950_000_000, withdrawals: 460_000_000, investments: 680_000_000 },
  { month: "Feb", deposits: 1_020_000_000, withdrawals: 490_000_000, investments: 720_000_000 },
  { month: "Mar", deposits: 1_150_000_000, withdrawals: 530_000_000, investments: 850_000_000 },
  { month: "Apr", deposits: 1_240_000_000, withdrawals: 560_000_000, investments: 920_000_000 },
];

const userGrowthData = [
  { month: "Sep", total: 6_200, new: 820, active: 4_100 },
  { month: "Oct", total: 7_050, new: 850, active: 4_800 },
  { month: "Nov", total: 7_900, new: 850, active: 5_200 },
  { month: "Dec", total: 8_800, new: 900, active: 5_800 },
  { month: "Jan", total: 9_900, new: 1_100, active: 6_500 },
  { month: "Feb", total: 10_850, new: 950, active: 7_200 },
  { month: "Mar", total: 11_920, new: 1_070, active: 8_000 },
  { month: "Apr", total: 12_847, new: 927, active: 8_600 },
];

function formatMillions(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

function formatK(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

const tooltipStyle = {
  backgroundColor: "#1A1A2E",
  border: "1px solid #3A3A52",
  borderRadius: "8px",
  color: "#F0F0F5",
  fontSize: "13px",
};

export default function ReportsPage() {
  const latestRevenue = revenueData[revenueData.length - 1];
  const prevRevenue = revenueData[revenueData.length - 2];
  const revenueChange =
    ((latestRevenue.revenue - prevRevenue.revenue) / prevRevenue.revenue) * 100;

  const latestVolume = volumeData[volumeData.length - 1];
  const totalMonthlyVolume =
    latestVolume.deposits + latestVolume.withdrawals + latestVolume.investments;

  const latestUsers = userGrowthData[userGrowthData.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-sm text-text-muted">
            Financial reports, volumes, and user growth analytics
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-secondary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover">
            <Calendar className="h-4 w-4" />
            Sep 2025 - Apr 2026
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-akiba-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-akiba-green-light">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly Revenue"
          value={formatCFA(latestRevenue.revenue)}
          change={revenueChange}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Monthly Volume"
          value={`${formatMillions(totalMonthlyVolume)} CFA`}
          change={9.4}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="New Users (Apr)"
          value={latestUsers.new.toLocaleString()}
          change={-13.4}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Active Users"
          value={latestUsers.active.toLocaleString()}
          change={7.5}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Revenue Breakdown (CFA)
        </h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A52" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#A0A0B8", fontSize: 12 }}
                axisLine={{ stroke: "#3A3A52" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatMillions}
                tick={{ fill: "#A0A0B8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  `${formatMillions(value)} CFA`,
                  name === "fees"
                    ? "Transaction Fees"
                    : name === "subscriptions"
                    ? "Subscriptions"
                    : "Total Revenue",
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#A0A0B8" }}
                formatter={(value) =>
                  value === "fees"
                    ? "Transaction Fees"
                    : value === "subscriptions"
                    ? "Subscriptions"
                    : "Total Revenue"
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00A86B"
                fill="#00A86B"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="fees"
                stroke="#3498DB"
                fill="#3498DB"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="subscriptions"
                stroke="#F5A623"
                fill="#F5A623"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Transaction Volume */}
        <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Transaction Volumes (CFA)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A52" />
                <XAxis
                  dataKey="month"
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
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    `${formatMillions(value)} CFA`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "#A0A0B8" }}
                  formatter={(value) =>
                    value.charAt(0).toUpperCase() + value.slice(1)
                  }
                />
                <Bar dataKey="deposits" fill="#00A86B" radius={[3, 3, 0, 0]} />
                <Bar dataKey="investments" fill="#3498DB" radius={[3, 3, 0, 0]} />
                <Bar dataKey="withdrawals" fill="#E74C3C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth */}
        <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            User Growth
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A52" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#A0A0B8", fontSize: 12 }}
                  axisLine={{ stroke: "#3A3A52" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatK}
                  tick={{ fill: "#A0A0B8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === "total"
                      ? "Total Users"
                      : name === "active"
                      ? "Active Users"
                      : "New Users",
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "#A0A0B8" }}
                  formatter={(value) =>
                    value === "total"
                      ? "Total Users"
                      : value === "active"
                      ? "Active Users"
                      : "New Users"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#00A86B"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#00A86B" }}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#3498DB"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3498DB" }}
                />
                <Line
                  type="monotone"
                  dataKey="new"
                  stroke="#F5A623"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#F5A623" }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Monthly Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Month
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Revenue
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Deposits
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Investments
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Withdrawals
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                  New Users
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Total Users
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {revenueData.map((rev, idx) => {
                const vol = volumeData[idx];
                const users = userGrowthData[idx];
                return (
                  <tr
                    key={rev.month}
                    className="transition-colors hover:bg-surface-hover"
                  >
                    <td className="py-3 text-sm font-medium text-text-primary">
                      {rev.month} {idx < 4 ? "2025" : "2026"}
                    </td>
                    <td className="py-3 text-right text-sm text-akiba-green">
                      {formatCFA(rev.revenue)}
                    </td>
                    <td className="py-3 text-right text-sm text-text-primary">
                      {formatCFA(vol.deposits)}
                    </td>
                    <td className="py-3 text-right text-sm text-text-secondary">
                      {formatCFA(vol.investments)}
                    </td>
                    <td className="py-3 text-right text-sm text-akiba-red">
                      {formatCFA(vol.withdrawals)}
                    </td>
                    <td className="py-3 text-right text-sm text-akiba-gold">
                      +{users.new.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-text-primary">
                      {users.total.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
