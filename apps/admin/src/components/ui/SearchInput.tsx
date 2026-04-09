"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  icon?: ReactNode;
  className?: string;
  defaultValue?: string;
}

export function SearchInput({
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
  icon,
  className,
  defaultValue = "",
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, debounceMs, onSearch]);

  return (
    <div className={cn("relative", className)}>
      {icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-surface-border bg-surface-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-akiba-green focus:outline-none focus:ring-1 focus:ring-akiba-green/30",
          icon && "pl-10"
        )}
      />
    </div>
  );
}
