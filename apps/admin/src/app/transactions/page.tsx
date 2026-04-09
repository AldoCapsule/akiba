"use client";

import { useState, useCallback } from "react";
import { Search, Filter, Download, ArrowLeftRight } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { formatCFA, formatDateTime } from "@/lib/utils";

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: "deposit" | "withdrawal" | "investment" | "redemption" | "fee" | "transfer";
  amount: number;
  status: "completed" | "pending" | "failed" | "processing";
  method: string;
  reference: string;
  createdAt: string;
}

const typeLabels: Record<Transaction["type"], string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  investment: "Investment",
  redemption: "Redemption",
  fee: "Fee",
  transfer: "Transfer",
};

const statusVariantMap = {
  completed: "success",
  pending: "warning",
  failed: "error",
  processing: "info",
} as const;

const mockTransactions: Transaction[] = [
  { id: "TXN-90281", userId: "USR-001", userName: "Mamadou Diallo", type: "deposit", amount: 250_000, status: "completed", method: "Orange Money", reference: "OM-20260408-001", createdAt: "2026-04-08T14:32:00" },
  { id: "TXN-90280", userId: "USR-002", userName: "Fatou Sow", type: "investment", amount: 1_500_000, status: "completed", method: "Wallet", reference: "INV-20260408-001", createdAt: "2026-04-08T13:18:00" },
  { id: "TXN-90279", userId: "USR-003", userName: "Ousmane Ndiaye", type: "withdrawal", amount: 75_000, status: "pending", method: "Wave", reference: "WV-20260408-001", createdAt: "2026-04-08T12:45:00" },
  { id: "TXN-90278", userId: "USR-004", userName: "Aissatou Ba", type: "deposit", amount: 500_000, status: "completed", method: "Free Money", reference: "FM-20260408-001", createdAt: "2026-04-08T11:20:00" },
  { id: "TXN-90277", userId: "USR-005", userName: "Ibrahima Fall", type: "withdrawal", amount: 120_000, status: "failed", method: "Bank Transfer", reference: "BT-20260408-001", createdAt: "2026-04-08T10:05:00" },
  { id: "TXN-90276", userId: "USR-006", userName: "Aminata Diop", type: "investment", amount: 3_000_000, status: "completed", method: "Wallet", reference: "INV-20260408-002", createdAt: "2026-04-08T09:30:00" },
  { id: "TXN-90275", userId: "USR-008", userName: "Mariama Camara", type: "redemption", amount: 800_000, status: "processing", method: "Wallet", reference: "RED-20260407-001", createdAt: "2026-04-07T17:45:00" },
  { id: "TXN-90274", userId: "USR-010", userName: "Khady Niang", type: "deposit", amount: 1_000_000, status: "completed", method: "Orange Money", reference: "OM-20260407-005", createdAt: "2026-04-07T16:20:00" },
  { id: "TXN-90273", userId: "USR-012", userName: "Ndèye Seck", type: "fee", amount: 5_000, status: "completed", method: "System", reference: "FEE-20260407-001", createdAt: "2026-04-07T15:00:00" },
  { id: "TXN-90272", userId: "USR-001", userName: "Mamadou Diallo", type: "transfer", amount: 200_000, status: "completed", method: "Internal", reference: "TRF-20260407-001", createdAt: "2026-04-07T14:10:00" },
  { id: "TXN-90271", userId: "USR-002", userName: "Fatou Sow", type: "deposit", amount: 750_000, status: "completed", method: "Wave", reference: "WV-20260407-003", createdAt: "2026-04-07T12:30:00" },
  { id: "TXN-90270", userId: "USR-004", userName: "Aissatou Ba", type: "withdrawal", amount: 300_000, status: "completed", method: "Bank Transfer", reference: "BT-20260407-002", createdAt: "2026-04-07T11:15:00" },
];

const typeFilters = ["all", "deposit", "withdrawal", "investment", "redemption", "fee", "transfer"] as const;
const statusFilters = ["all", "completed", "pending", "processing", "failed"] as const;

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  const filtered = mockTransactions.filter((tx) => {
    const matchesSearch =
      !search ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.userName.toLowerCase().includes(search.toLowerCase()) ||
      tx.reference.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalVolume = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  const columns: Column<Transaction>[] = [
    {
      key: "id",
      header: "Transaction ID",
      render: (row) => (
        <span className="font-mono text-text-secondary">{row.id}</span>
      ),
    },
    {
      key: "user",
      header: "User",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.userName}</p>
          <p className="text-xs text-text-muted">{row.userId}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (row) => (
        <span className="text-text-secondary">{typeLabels[row.type]}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      className: "text-right",
      render: (row) => (
        <span
          className={`font-medium ${
            row.type === "withdrawal" || row.type === "fee"
              ? "text-akiba-red"
              : "text-text-primary"
          }`}
        >
          {row.type === "withdrawal" || row.type === "fee" ? "-" : "+"}
          {formatCFA(row.amount)}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      render: (row) => (
        <span className="text-text-secondary">{row.method}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <StatusBadge variant={statusVariantMap[row.status]} dot>
          {row.status}
        </StatusBadge>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-text-muted">{formatDateTime(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
          <p className="text-sm text-text-muted">
            Total volume (filtered): {formatCFA(totalVolume)}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-secondary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          placeholder="Search ID, user, reference..."
          onSearch={handleSearch}
          icon={<Search className="h-4 w-4" />}
          className="w-72"
        />

        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-text-muted" />
          <div className="flex gap-1">
            {typeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-akiba-green/10 text-akiba-green"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t === "all" ? "All Types" : typeLabels[t as Transaction["type"]]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <div className="flex gap-1">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-akiba-green/10 text-akiba-green"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={10} />
    </div>
  );
}
