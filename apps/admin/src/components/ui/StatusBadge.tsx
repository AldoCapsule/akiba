import { cn } from "@/lib/utils";

type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "pending";

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-akiba-green/10 text-akiba-green border-akiba-green/20",
  warning: "bg-akiba-gold/10 text-akiba-gold border-akiba-gold/20",
  error: "bg-akiba-red/10 text-akiba-red border-akiba-red/20",
  info: "bg-akiba-blue/10 text-akiba-blue border-akiba-blue/20",
  neutral: "bg-surface-tertiary text-text-secondary border-surface-border",
  pending: "bg-akiba-gold/10 text-akiba-gold border-akiba-gold/20",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-akiba-green",
  warning: "bg-akiba-gold",
  error: "bg-akiba-red",
  info: "bg-akiba-blue",
  neutral: "bg-text-muted",
  pending: "bg-akiba-gold",
};

export function StatusBadge({
  variant,
  children,
  className,
  dot = false,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
