"use client";

import { Bell, Search } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-border bg-surface-primary/80 px-6 backdrop-blur-md">
      {/* Search */}
      <div className="w-full max-w-md">
        <SearchInput
          placeholder="Search users, transactions..."
          onSearch={() => {}}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-akiba-red" />
        </button>

        {/* Admin profile */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-akiba-green/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-akiba-green">AD</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary">Admin User</p>
            <p className="text-xs text-text-muted">admin@akiba.sn</p>
          </div>
        </div>
      </div>
    </header>
  );
}
