"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Download } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { formatCFA, formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: "verified" | "pending" | "rejected" | "not_started";
  balance: number;
  registeredAt: string;
}

const kycVariantMap = {
  verified: "success",
  pending: "warning",
  rejected: "error",
  not_started: "neutral",
} as const;

const mockUsers: User[] = [
  { id: "USR-001", name: "Mamadou Diallo", email: "mamadou@email.sn", phone: "+221 77 123 4567", kycStatus: "verified", balance: 2_450_000, registeredAt: "2025-08-15" },
  { id: "USR-002", name: "Fatou Sow", email: "fatou.sow@email.sn", phone: "+221 78 234 5678", kycStatus: "verified", balance: 8_120_000, registeredAt: "2025-09-02" },
  { id: "USR-003", name: "Ousmane Ndiaye", email: "ousmane.n@email.sn", phone: "+221 76 345 6789", kycStatus: "pending", balance: 350_000, registeredAt: "2026-01-10" },
  { id: "USR-004", name: "Aissatou Ba", email: "aissatou.ba@email.sn", phone: "+221 77 456 7890", kycStatus: "verified", balance: 5_600_000, registeredAt: "2025-10-22" },
  { id: "USR-005", name: "Ibrahima Fall", email: "ibrahima.f@email.sn", phone: "+221 78 567 8901", kycStatus: "rejected", balance: 0, registeredAt: "2026-02-28" },
  { id: "USR-006", name: "Aminata Diop", email: "aminata.d@email.sn", phone: "+221 76 678 9012", kycStatus: "verified", balance: 12_350_000, registeredAt: "2025-07-05" },
  { id: "USR-007", name: "Cheikh Mbaye", email: "cheikh.m@email.sn", phone: "+221 77 789 0123", kycStatus: "pending", balance: 150_000, registeredAt: "2026-03-15" },
  { id: "USR-008", name: "Mariama Camara", email: "mariama.c@email.sn", phone: "+221 78 890 1234", kycStatus: "verified", balance: 3_780_000, registeredAt: "2025-11-18" },
  { id: "USR-009", name: "Modou Gueye", email: "modou.g@email.sn", phone: "+221 76 901 2345", kycStatus: "not_started", balance: 0, registeredAt: "2026-04-01" },
  { id: "USR-010", name: "Khady Niang", email: "khady.n@email.sn", phone: "+221 77 012 3456", kycStatus: "verified", balance: 6_900_000, registeredAt: "2025-12-08" },
  { id: "USR-011", name: "Abdoulaye Sarr", email: "abdoulaye.s@email.sn", phone: "+221 78 123 4567", kycStatus: "pending", balance: 500_000, registeredAt: "2026-03-22" },
  { id: "USR-012", name: "Ndèye Seck", email: "ndeye.s@email.sn", phone: "+221 76 234 5678", kycStatus: "verified", balance: 1_200_000, registeredAt: "2026-01-30" },
];

const kycFilterOptions = [
  { label: "All", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
  { label: "Not Started", value: "not_started" },
];

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());

    const matchesKyc = kycFilter === "all" || u.kycStatus === kycFilter;
    return matchesSearch && matchesKyc;
  });

  const columns: Column<User>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => (
        <span className="font-mono text-text-secondary">{row.id}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => <span className="text-text-secondary">{row.phone}</span>,
    },
    {
      key: "kycStatus",
      header: "KYC Status",
      sortable: true,
      render: (row) => (
        <StatusBadge variant={kycVariantMap[row.kycStatus]} dot>
          {row.kycStatus.replace("_", " ")}
        </StatusBadge>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      sortable: true,
      className: "text-right",
      render: (row) => (
        <span className="font-medium">{formatCFA(row.balance)}</span>
      ),
    },
    {
      key: "registeredAt",
      header: "Registered",
      sortable: true,
      render: (row) => (
        <span className="text-text-muted">{formatDate(row.registeredAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-sm text-text-muted">
            {mockUsers.length.toLocaleString()} registered users
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-secondary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search users..."
          onSearch={handleSearch}
          icon={<Search className="h-4 w-4" />}
          className="w-72"
        />
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted" />
          {kycFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setKycFilter(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                kycFilter === opt.value
                  ? "bg-akiba-green/10 text-akiba-green"
                  : "text-text-muted hover:bg-surface-hover hover:text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        onRowClick={(user) => router.push(`/users/${user.id}`)}
        pageSize={10}
      />
    </div>
  );
}
