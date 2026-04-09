"use client";

import { Users, Landmark, ArrowLeftRight, Target } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { AumChart } from "@/components/charts/AumChart";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { AllocationPie } from "@/components/charts/AllocationPie";
import { StatusBadge } from "@/components/ui/StatusBadge";

const recentTransactions = [
  {
    id: "TXN-90281",
    user: "Mamadou Diallo",
    type: "Deposit",
    amount: 250_000,
    status: "completed" as const,
    date: "2026-04-08 14:32",
  },
  {
    id: "TXN-90280",
    user: "Fatou Sow",
    type: "Investment",
    amount: 1_500_000,
    status: "completed" as const,
    date: "2026-04-08 13:18",
  },
  {
    id: "TXN-90279",
    user: "Ousmane Ndiaye",
    type: "Withdrawal",
    amount: 75_000,
    status: "pending" as const,
    date: "2026-04-08 12:45",
  },
  {
    id: "TXN-90278",
    user: "Aissatou Ba",
    type: "Deposit",
    amount: 500_000,
    status: "completed" as const,
    date: "2026-04-08 11:20",
  },
  {
    id: "TXN-90277",
    user: "Ibrahima Fall",
    type: "Withdrawal",
    amount: 120_000,
    status: "failed" as const,
    date: "2026-04-08 10:05",
  },
];

const statusVariantMap = {
  completed: "success",
  pending: "warning",
  failed: "error",
} as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted">
          Overview of the Akiba platform performance
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value="12,847"
          change={8.3}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Assets Under Management"
          value="3.68B CFA"
          change={12.5}
          icon={<Landmark className="h-5 w-5" />}
        />
        <StatCard
          label="Daily Volume"
          value="338M CFA"
          change={-2.1}
          icon={<ArrowLeftRight className="h-5 w-5" />}
        />
        <StatCard
          label="Active Goals"
          value="8,234"
          change={5.7}
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AumChart />
        <VolumeChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Allocation */}
        <AllocationPie />

        {/* Recent Transactions */}
        <div className="col-span-1 rounded-xl border border-surface-border bg-surface-secondary p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">
              Recent Transactions
            </h3>
            <a
              href="/transactions"
              className="text-xs font-medium text-akiba-green hover:text-akiba-green-light"
            >
              View all
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    ID
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    User
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Type
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Amount
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Status
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="transition-colors hover:bg-surface-hover"
                  >
                    <td className="py-3 text-sm font-mono text-text-secondary">
                      {tx.id}
                    </td>
                    <td className="py-3 text-sm text-text-primary">
                      {tx.user}
                    </td>
                    <td className="py-3 text-sm text-text-secondary">
                      {tx.type}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-text-primary">
                      {tx.amount.toLocaleString("fr-SN")} CFA
                    </td>
                    <td className="py-3">
                      <StatusBadge variant={statusVariantMap[tx.status]} dot>
                        {tx.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3 text-right text-sm text-text-muted">
                      {tx.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
