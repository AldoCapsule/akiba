"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Wallet,
  FileText,
  TrendingUp,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import { formatCFA, formatDate } from "@/lib/utils";

// Mock user data for demonstration
const mockUser = {
  id: "USR-001",
  firstName: "Mamadou",
  lastName: "Diallo",
  email: "mamadou@email.sn",
  phone: "+221 77 123 4567",
  address: "Dakar, Plateau, Rue Carnot 42",
  dateOfBirth: "1990-03-15",
  registeredAt: "2025-08-15",
  kycStatus: "verified" as const,
  kycSubmittedAt: "2025-08-16",
  kycVerifiedAt: "2025-08-17",
  nationalId: "SN-2901234567",
  wallets: [
    { id: "WAL-001", type: "CFA", balance: 2_450_000, currency: "XOF" },
  ],
  portfolios: [
    {
      id: "PTF-001",
      name: "Retirement Fund",
      value: 15_000_000,
      allocation: "Conservative",
      return: 8.2,
    },
    {
      id: "PTF-002",
      name: "Education Savings",
      value: 5_200_000,
      allocation: "Moderate",
      return: 12.4,
    },
  ],
  recentTransactions: [
    { id: "TXN-90281", type: "Deposit", amount: 250_000, status: "completed" as const, date: "2026-04-08" },
    { id: "TXN-90150", type: "Investment", amount: 1_000_000, status: "completed" as const, date: "2026-04-05" },
    { id: "TXN-89922", type: "Withdrawal", amount: 150_000, status: "completed" as const, date: "2026-04-01" },
    { id: "TXN-89800", type: "Deposit", amount: 500_000, status: "completed" as const, date: "2026-03-28" },
    { id: "TXN-89650", type: "Investment", amount: 2_000_000, status: "completed" as const, date: "2026-03-20" },
  ],
  kycDocuments: [
    { name: "National ID (Front)", uploadedAt: "2025-08-16", status: "approved" as const },
    { name: "National ID (Back)", uploadedAt: "2025-08-16", status: "approved" as const },
    { name: "Proof of Address", uploadedAt: "2025-08-16", status: "approved" as const },
    { name: "Selfie Verification", uploadedAt: "2025-08-16", status: "approved" as const },
  ],
};

const txStatusMap = {
  completed: "success",
  pending: "warning",
  failed: "error",
} as const;

const docStatusMap = {
  approved: "success",
  pending: "warning",
  rejected: "error",
} as const;

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      {/* Profile Header */}
      <div className="flex items-start justify-between rounded-xl border border-surface-border bg-surface-secondary p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-akiba-green/20 text-xl font-bold text-akiba-green">
            {mockUser.firstName[0]}
            {mockUser.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-text-primary">
                {mockUser.firstName} {mockUser.lastName}
              </h1>
              <StatusBadge variant="success" dot>
                {mockUser.kycStatus}
              </StatusBadge>
            </div>
            <p className="mt-0.5 font-mono text-sm text-text-muted">{id}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-text-muted" />
                {mockUser.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-text-muted" />
                {mockUser.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-text-muted" />
                {mockUser.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-text-muted" />
                Joined {formatDate(mockUser.registeredAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover">
            Suspend
          </button>
          <button className="rounded-lg bg-akiba-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-akiba-green-light">
            Send Message
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Wallet Balance"
          value={formatCFA(mockUser.wallets[0].balance)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Total Portfolio Value"
          value={formatCFA(
            mockUser.portfolios.reduce((sum, p) => sum + p.value, 0)
          )}
          change={9.8}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="KYC Status"
          value="Verified"
          icon={<Shield className="h-5 w-5" />}
        />
        <StatCard
          label="Transactions"
          value={mockUser.recentTransactions.length.toString()}
          changePeriod="this month"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* KYC Documents */}
        <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            KYC Documents
          </h3>
          <div className="space-y-3">
            {mockUser.kycDocuments.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-tertiary px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {doc.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    Uploaded {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <StatusBadge variant={docStatusMap[doc.status]}>
                  {doc.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolios */}
        <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Portfolios
          </h3>
          <div className="space-y-3">
            {mockUser.portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="rounded-lg border border-surface-border bg-surface-tertiary px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {portfolio.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {portfolio.allocation} strategy
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">
                      {formatCFA(portfolio.value)}
                    </p>
                    <p className="text-xs font-medium text-akiba-green">
                      +{portfolio.return}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-surface-border bg-surface-secondary p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  ID
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
              {mockUser.recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition-colors hover:bg-surface-hover"
                >
                  <td className="py-3 font-mono text-sm text-text-secondary">
                    {tx.id}
                  </td>
                  <td className="py-3 text-sm text-text-primary">{tx.type}</td>
                  <td className="py-3 text-right text-sm font-medium text-text-primary">
                    {formatCFA(tx.amount)}
                  </td>
                  <td className="py-3">
                    <StatusBadge variant={txStatusMap[tx.status]} dot>
                      {tx.status}
                    </StatusBadge>
                  </td>
                  <td className="py-3 text-right text-sm text-text-muted">
                    {formatDate(tx.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
