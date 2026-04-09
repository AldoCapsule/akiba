"use client";

import { PieChart, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AllocationPie } from "@/components/charts/AllocationPie";
import { formatCFA } from "@/lib/utils";

interface PortfolioModel {
  id: string;
  name: string;
  strategy: "Conservative" | "Moderate" | "Aggressive";
  aum: number;
  investors: number;
  ytdReturn: number;
  monthReturn: number;
  allocation: { asset: string; weight: number }[];
}

const mockPortfolios: PortfolioModel[] = [
  {
    id: "MDL-001",
    name: "Akiba Prudent",
    strategy: "Conservative",
    aum: 1_450_000_000,
    investors: 4_821,
    ytdReturn: 5.2,
    monthReturn: 0.4,
    allocation: [
      { asset: "Government Bonds", weight: 55 },
      { asset: "Money Market", weight: 30 },
      { asset: "Corporate Bonds", weight: 15 },
    ],
  },
  {
    id: "MDL-002",
    name: "Akiba Growth",
    strategy: "Moderate",
    aum: 1_320_000_000,
    investors: 5_102,
    ytdReturn: 9.8,
    monthReturn: 1.2,
    allocation: [
      { asset: "Government Bonds", weight: 30 },
      { asset: "Equities (BRVM)", weight: 35 },
      { asset: "Money Market", weight: 20 },
      { asset: "Real Estate Fund", weight: 15 },
    ],
  },
  {
    id: "MDL-003",
    name: "Akiba Dynamic",
    strategy: "Aggressive",
    aum: 910_000_000,
    investors: 2_924,
    ytdReturn: 14.6,
    monthReturn: -0.8,
    allocation: [
      { asset: "Equities (BRVM)", weight: 50 },
      { asset: "Real Estate Fund", weight: 20 },
      { asset: "Government Bonds", weight: 15 },
      { asset: "Corporate Bonds", weight: 15 },
    ],
  },
];

const strategyVariant = {
  Conservative: "info",
  Moderate: "warning",
  Aggressive: "error",
} as const;

const totalAum = mockPortfolios.reduce((sum, p) => sum + p.aum, 0);
const totalInvestors = mockPortfolios.reduce((sum, p) => sum + p.investors, 0);
const avgReturn =
  mockPortfolios.reduce((sum, p) => sum + p.ytdReturn, 0) /
  mockPortfolios.length;

export default function PortfoliosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Portfolios</h1>
        <p className="text-sm text-text-muted">
          Platform portfolio models and AUM overview
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total AUM"
          value={formatCFA(totalAum)}
          change={12.5}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Total Investors"
          value={totalInvestors.toLocaleString()}
          change={8.3}
          icon={<PieChart className="h-5 w-5" />}
        />
        <StatCard
          label="Avg YTD Return"
          value={`${avgReturn.toFixed(1)}%`}
          change={2.1}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Allocation overview */}
        <AllocationPie />

        {/* Portfolio Models */}
        <div className="lg:col-span-2 space-y-4">
          {mockPortfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="rounded-xl border border-surface-border bg-surface-secondary p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {portfolio.name}
                    </h3>
                    <StatusBadge variant={strategyVariant[portfolio.strategy]}>
                      {portfolio.strategy}
                    </StatusBadge>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-text-muted">
                    {portfolio.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-text-primary">
                    {formatCFA(portfolio.aum)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {portfolio.investors.toLocaleString()} investors
                  </p>
                </div>
              </div>

              {/* Returns */}
              <div className="mt-4 flex gap-6">
                <div>
                  <p className="text-xs text-text-muted">YTD Return</p>
                  <p
                    className={`text-sm font-semibold ${
                      portfolio.ytdReturn >= 0
                        ? "text-akiba-green"
                        : "text-akiba-red"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {portfolio.ytdReturn >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {portfolio.ytdReturn >= 0 ? "+" : ""}
                      {portfolio.ytdReturn}%
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Monthly Return</p>
                  <p
                    className={`text-sm font-semibold ${
                      portfolio.monthReturn >= 0
                        ? "text-akiba-green"
                        : "text-akiba-red"
                    }`}
                  >
                    {portfolio.monthReturn >= 0 ? "+" : ""}
                    {portfolio.monthReturn}%
                  </p>
                </div>
              </div>

              {/* Allocation bar */}
              <div className="mt-4">
                <p className="mb-2 text-xs text-text-muted">Allocation</p>
                <div className="flex h-2 overflow-hidden rounded-full bg-surface-tertiary">
                  {portfolio.allocation.map((a, i) => {
                    const colors = [
                      "#00A86B",
                      "#3498DB",
                      "#F5A623",
                      "#9B59B6",
                      "#E74C3C",
                    ];
                    return (
                      <div
                        key={a.asset}
                        style={{
                          width: `${a.weight}%`,
                          backgroundColor: colors[i % colors.length],
                        }}
                        title={`${a.asset}: ${a.weight}%`}
                      />
                    );
                  })}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  {portfolio.allocation.map((a, i) => {
                    const colors = [
                      "#00A86B",
                      "#3498DB",
                      "#F5A623",
                      "#9B59B6",
                      "#E74C3C",
                    ];
                    return (
                      <span key={a.asset} className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-sm"
                          style={{ backgroundColor: colors[i % colors.length] }}
                        />
                        <span className="text-text-muted">{a.asset}</span>
                        <span className="font-medium text-text-secondary">
                          {a.weight}%
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
