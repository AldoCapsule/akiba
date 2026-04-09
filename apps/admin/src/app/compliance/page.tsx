"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { formatCFA, formatDateTime } from "@/lib/utils";

interface AmlAlert {
  id: string;
  userId: string;
  userName: string;
  type: "unusual_volume" | "rapid_transactions" | "suspicious_pattern" | "high_risk_country" | "structuring";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "escalated" | "resolved" | "false_positive";
  description: string;
  amount: number;
  detectedAt: string;
  assignedTo?: string;
}

const alertTypeLabels: Record<AmlAlert["type"], string> = {
  unusual_volume: "Unusual Volume",
  rapid_transactions: "Rapid Transactions",
  suspicious_pattern: "Suspicious Pattern",
  high_risk_country: "High-Risk Country",
  structuring: "Structuring",
};

const severityVariant = {
  low: "info",
  medium: "warning",
  high: "error",
  critical: "error",
} as const;

const statusVariant = {
  open: "warning",
  investigating: "info",
  escalated: "error",
  resolved: "success",
  false_positive: "neutral",
} as const;

const severityIcon = {
  low: AlertCircle,
  medium: AlertTriangle,
  high: ShieldAlert,
  critical: ShieldAlert,
};

const mockAlerts: AmlAlert[] = [
  {
    id: "AML-150",
    userId: "USR-042",
    userName: "Abdou Kane",
    type: "unusual_volume",
    severity: "critical",
    status: "open",
    description:
      "Transaction volume 15x above normal daily average. Multiple large deposits from different mobile money providers within 2 hours.",
    amount: 25_000_000,
    detectedAt: "2026-04-08T13:45:00",
  },
  {
    id: "AML-149",
    userId: "USR-078",
    userName: "Daouda Sy",
    type: "structuring",
    severity: "high",
    status: "investigating",
    description:
      "8 deposits of exactly 495,000 CFA within 24 hours, appearing to structure below the 500,000 CFA reporting threshold.",
    amount: 3_960_000,
    detectedAt: "2026-04-08T10:20:00",
    assignedTo: "Compliance Officer A",
  },
  {
    id: "AML-148",
    userId: "USR-103",
    userName: "Mame Diarra Bousso",
    type: "rapid_transactions",
    severity: "medium",
    status: "open",
    description:
      "12 rapid-fire transactions in under 5 minutes, alternating deposits and withdrawals.",
    amount: 2_400_000,
    detectedAt: "2026-04-07T22:15:00",
  },
  {
    id: "AML-147",
    userId: "USR-056",
    userName: "Pape Sagna",
    type: "high_risk_country",
    severity: "medium",
    status: "escalated",
    description:
      "Received transfer originating from a jurisdiction flagged by FATF as high-risk.",
    amount: 5_000_000,
    detectedAt: "2026-04-07T15:30:00",
    assignedTo: "Compliance Officer B",
  },
  {
    id: "AML-146",
    userId: "USR-089",
    userName: "Adama Faye",
    type: "suspicious_pattern",
    severity: "low",
    status: "resolved",
    description:
      "Unusual login patterns followed by immediate fund movement. User confirmed travel abroad.",
    amount: 800_000,
    detectedAt: "2026-04-06T09:00:00",
    assignedTo: "Compliance Officer A",
  },
  {
    id: "AML-145",
    userId: "USR-112",
    userName: "Coumba Diagne",
    type: "unusual_volume",
    severity: "low",
    status: "false_positive",
    description:
      "Large deposit flagged. Verified as salary deposit from employer.",
    amount: 1_500_000,
    detectedAt: "2026-04-05T14:00:00",
    assignedTo: "Compliance Officer C",
  },
];

export default function CompliancePage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [selectedAlert, setSelectedAlert] = useState<AmlAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const openCount = alerts.filter(
    (a) => a.status === "open" || a.status === "investigating"
  ).length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  const filtered = alerts.filter((a) => {
    const matchesSeverity = filterSeverity === "all" || a.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    return matchesSeverity && matchesStatus;
  });

  const updateStatus = (id: string, status: AmlAlert["status"]) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setSelectedAlert(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Compliance</h1>
        <p className="text-sm text-text-muted">
          AML alerts and investigation workflow
        </p>
      </div>

      {/* Alert counters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-akiba-red/20 bg-akiba-red/10 px-4 py-2.5">
          <ShieldAlert className="h-4 w-4 text-akiba-red" />
          <span className="text-sm font-semibold text-akiba-red">
            {criticalCount} critical
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-akiba-gold/20 bg-akiba-gold/10 px-4 py-2.5">
          <Clock className="h-4 w-4 text-akiba-gold" />
          <span className="text-sm font-semibold text-akiba-gold">
            {openCount} open
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-secondary px-4 py-2.5">
          <CheckCircle className="h-4 w-4 text-text-muted" />
          <span className="text-sm font-medium text-text-muted">
            {alerts.filter((a) => a.status === "resolved").length} resolved
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Severity:</span>
          {["all", "critical", "high", "medium", "low"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filterSeverity === s
                  ? "bg-akiba-green/10 text-akiba-green"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Status:</span>
          {["all", "open", "investigating", "escalated", "resolved", "false_positive"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? "bg-akiba-green/10 text-akiba-green"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {s === "all"
                  ? "All"
                  : s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
              </button>
            )
          )}
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const SeverityIcon = severityIcon[alert.severity];
          return (
            <div
              key={alert.id}
              className={`rounded-xl border bg-surface-secondary p-5 transition-colors hover:border-surface-hover ${
                alert.severity === "critical"
                  ? "border-akiba-red/30"
                  : alert.severity === "high"
                  ? "border-akiba-gold/20"
                  : "border-surface-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 rounded-lg p-2 ${
                      alert.severity === "critical"
                        ? "bg-akiba-red/10 text-akiba-red"
                        : alert.severity === "high"
                        ? "bg-akiba-gold/10 text-akiba-gold"
                        : "bg-surface-tertiary text-text-muted"
                    }`}
                  >
                    <SeverityIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-text-muted">
                        {alert.id}
                      </span>
                      <StatusBadge variant={severityVariant[alert.severity]}>
                        {alert.severity}
                      </StatusBadge>
                      <StatusBadge variant={statusVariant[alert.status]} dot>
                        {alert.status.replace("_", " ")}
                      </StatusBadge>
                    </div>
                    <h3 className="mt-1 font-medium text-text-primary">
                      {alertTypeLabels[alert.type]} &mdash; {alert.userName}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {alert.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                      <span>Amount: {formatCFA(alert.amount)}</span>
                      <span>Detected: {formatDateTime(alert.detectedAt)}</span>
                      {alert.assignedTo && (
                        <span>Assigned: {alert.assignedTo}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover"
                  >
                    <Eye className="inline h-3.5 w-3.5 mr-1" />
                    Details
                  </button>
                  {alert.status === "open" && (
                    <button
                      onClick={() => updateStatus(alert.id, "investigating")}
                      className="rounded-lg bg-akiba-blue/10 px-3 py-1.5 text-xs font-medium text-akiba-blue transition-colors hover:bg-akiba-blue/20"
                    >
                      Investigate
                    </button>
                  )}
                  {alert.status === "investigating" && (
                    <>
                      <button
                        onClick={() => updateStatus(alert.id, "resolved")}
                        className="rounded-lg bg-akiba-green/10 px-3 py-1.5 text-xs font-medium text-akiba-green transition-colors hover:bg-akiba-green/20"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => updateStatus(alert.id, "escalated")}
                        className="rounded-lg bg-akiba-red/10 px-3 py-1.5 text-xs font-medium text-akiba-red transition-colors hover:bg-akiba-red/20"
                      >
                        Escalate
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-secondary py-16">
            <CheckCircle className="h-10 w-10 text-akiba-green" />
            <p className="mt-3 text-sm text-text-muted">
              No alerts match the current filters
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAlert && (
        <Modal
          open={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={`Alert ${selectedAlert.id}`}
          footer={
            <>
              {selectedAlert.status === "open" && (
                <button
                  onClick={() => updateStatus(selectedAlert.id, "investigating")}
                  className="rounded-lg bg-akiba-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-akiba-blue/90"
                >
                  Start Investigation
                </button>
              )}
              {selectedAlert.status === "investigating" && (
                <>
                  <button
                    onClick={() =>
                      updateStatus(selectedAlert.id, "false_positive")
                    }
                    className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover"
                  >
                    Mark False Positive
                  </button>
                  <button
                    onClick={() => updateStatus(selectedAlert.id, "resolved")}
                    className="rounded-lg bg-akiba-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-akiba-green-light"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => updateStatus(selectedAlert.id, "escalated")}
                    className="rounded-lg bg-akiba-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-akiba-red-light"
                  >
                    Escalate
                  </button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-text-muted">User</p>
                <p className="font-medium text-text-primary">
                  {selectedAlert.userName}
                </p>
                <p className="font-mono text-xs text-text-muted">
                  {selectedAlert.userId}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Alert Type</p>
                <p className="text-text-primary">
                  {alertTypeLabels[selectedAlert.type]}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Amount Flagged</p>
                <p className="font-medium text-text-primary">
                  {formatCFA(selectedAlert.amount)}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Detected</p>
                <p className="text-text-primary">
                  {formatDateTime(selectedAlert.detectedAt)}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-text-muted">Description</p>
              <p className="rounded-lg bg-surface-tertiary px-3 py-2 text-text-primary">
                {selectedAlert.description}
              </p>
            </div>

            <div>
              <p className="mb-2 text-text-muted">Investigation Notes</p>
              <textarea
                className="w-full rounded-lg border border-surface-border bg-surface-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-akiba-green focus:outline-none focus:ring-1 focus:ring-akiba-green/30"
                rows={3}
                placeholder="Add investigation notes..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
