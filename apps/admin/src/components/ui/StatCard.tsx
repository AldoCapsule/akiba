import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  changePeriod?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changePeriod = "vs last month",
  icon,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-surface-border bg-surface-secondary p-5 transition-colors hover:border-surface-hover",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-muted">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            {value}
          </p>
        </div>
        {icon && (
          <div className="rounded-lg bg-surface-tertiary p-2.5 text-text-secondary">
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          {isPositive && (
            <TrendingUp className="h-4 w-4 text-akiba-green" />
          )}
          {isNegative && (
            <TrendingDown className="h-4 w-4 text-akiba-red" />
          )}
          {isNeutral && <Minus className="h-4 w-4 text-text-muted" />}

          <span
            className={cn(
              "font-medium",
              isPositive && "text-akiba-green",
              isNegative && "text-akiba-red",
              isNeutral && "text-text-muted"
            )}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          <span className="text-text-muted">{changePeriod}</span>
        </div>
      )}
    </div>
  );
}
