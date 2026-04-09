"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldX,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

interface KycSubmission {
  id: string;
  userId: string;
  userName: string;
  email: string;
  submittedAt: string;
  documents: string[];
  status: "pending" | "in_review" | "approved" | "rejected";
  riskScore: "low" | "medium" | "high";
  notes?: string;
}

const statusVariantMap = {
  pending: "warning",
  in_review: "info",
  approved: "success",
  rejected: "error",
} as const;

const riskVariantMap = {
  low: "success",
  medium: "warning",
  high: "error",
} as const;

const mockSubmissions: KycSubmission[] = [
  {
    id: "KYC-401",
    userId: "USR-003",
    userName: "Ousmane Ndiaye",
    email: "ousmane.n@email.sn",
    submittedAt: "2026-04-08T09:15:00",
    documents: ["National ID (Front)", "National ID (Back)", "Proof of Address"],
    status: "pending",
    riskScore: "low",
  },
  {
    id: "KYC-400",
    userId: "USR-007",
    userName: "Cheikh Mbaye",
    email: "cheikh.m@email.sn",
    submittedAt: "2026-04-07T16:42:00",
    documents: ["Passport", "Utility Bill"],
    status: "pending",
    riskScore: "medium",
  },
  {
    id: "KYC-399",
    userId: "USR-011",
    userName: "Abdoulaye Sarr",
    email: "abdoulaye.s@email.sn",
    submittedAt: "2026-04-07T11:30:00",
    documents: ["National ID (Front)", "National ID (Back)", "Selfie"],
    status: "in_review",
    riskScore: "low",
  },
  {
    id: "KYC-398",
    userId: "USR-015",
    userName: "Sokhna Mbengue",
    email: "sokhna.m@email.sn",
    submittedAt: "2026-04-06T14:20:00",
    documents: ["Passport", "Bank Statement"],
    status: "pending",
    riskScore: "high",
    notes: "Address mismatch detected between documents",
  },
  {
    id: "KYC-397",
    userId: "USR-018",
    userName: "Moussa Dieng",
    email: "moussa.d@email.sn",
    submittedAt: "2026-04-06T10:05:00",
    documents: ["National ID (Front)", "National ID (Back)", "Utility Bill", "Selfie"],
    status: "in_review",
    riskScore: "low",
  },
  {
    id: "KYC-396",
    userId: "USR-020",
    userName: "Rama Thiam",
    email: "rama.t@email.sn",
    submittedAt: "2026-04-05T17:50:00",
    documents: ["Passport", "Proof of Address"],
    status: "pending",
    riskScore: "medium",
    notes: "Low resolution selfie submitted",
  },
];

export default function KycPage() {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const inReviewCount = submissions.filter((s) => s.status === "in_review").length;

  const filtered = submissions.filter(
    (s) => filterStatus === "all" || s.status === filterStatus
  );

  const handleApprove = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s))
    );
    setSelectedSubmission(null);
  };

  const handleReject = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" as const } : s))
    );
    setSelectedSubmission(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">KYC Review</h1>
        <p className="text-sm text-text-muted">
          Review and process KYC submissions
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-akiba-gold/20 bg-akiba-gold/10 px-4 py-2">
          <Clock className="h-4 w-4 text-akiba-gold" />
          <span className="text-sm font-medium text-akiba-gold">
            {pendingCount} pending
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-akiba-blue/20 bg-akiba-blue/10 px-4 py-2">
          <Eye className="h-4 w-4 text-akiba-blue" />
          <span className="text-sm font-medium text-akiba-blue">
            {inReviewCount} in review
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-surface-border bg-surface-tertiary p-1">
        {["all", "pending", "in_review", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              filterStatus === status
                ? "bg-surface-secondary text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {status === "all"
              ? "All"
              : status.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      <div className="space-y-3">
        {filtered.map((submission) => (
          <div
            key={submission.id}
            className="rounded-xl border border-surface-border bg-surface-secondary p-5 transition-colors hover:border-surface-hover"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-tertiary text-sm font-bold text-text-secondary">
                  {submission.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-text-primary">
                      {submission.userName}
                    </h3>
                    <StatusBadge variant={statusVariantMap[submission.status]} dot>
                      {submission.status.replace("_", " ")}
                    </StatusBadge>
                    <StatusBadge variant={riskVariantMap[submission.riskScore]}>
                      Risk: {submission.riskScore}
                    </StatusBadge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                    <span>{submission.email}</span>
                    <span>Submitted {formatDate(submission.submittedAt)}</span>
                    <span>{submission.documents.length} documents</span>
                  </div>
                  {submission.notes && (
                    <p className="mt-2 rounded-md border border-akiba-gold/20 bg-akiba-gold/5 px-3 py-1.5 text-xs text-akiba-gold">
                      {submission.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSubmission(submission)}
                  className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover"
                >
                  <Eye className="inline h-3.5 w-3.5 mr-1" />
                  Review
                </button>
                {(submission.status === "pending" ||
                  submission.status === "in_review") && (
                  <>
                    <button
                      onClick={() => handleApprove(submission.id)}
                      className="rounded-lg bg-akiba-green/10 px-3 py-1.5 text-xs font-medium text-akiba-green transition-colors hover:bg-akiba-green/20"
                    >
                      <CheckCircle className="inline h-3.5 w-3.5 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(submission.id)}
                      className="rounded-lg bg-akiba-red/10 px-3 py-1.5 text-xs font-medium text-akiba-red transition-colors hover:bg-akiba-red/20"
                    >
                      <XCircle className="inline h-3.5 w-3.5 mr-1" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-secondary py-16">
            <ShieldCheck className="h-10 w-10 text-text-muted" />
            <p className="mt-3 text-sm text-text-muted">
              No submissions in this category
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <Modal
          open={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          title={`KYC Review: ${selectedSubmission.userName}`}
          footer={
            selectedSubmission.status === "pending" ||
            selectedSubmission.status === "in_review" ? (
              <>
                <button
                  onClick={() => handleReject(selectedSubmission.id)}
                  className="rounded-lg border border-akiba-red/30 px-4 py-2 text-sm font-medium text-akiba-red transition-colors hover:bg-akiba-red/10"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedSubmission.id)}
                  className="rounded-lg bg-akiba-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-akiba-green-light"
                >
                  Approve
                </button>
              </>
            ) : undefined
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">User ID</p>
                <p className="font-mono text-text-primary">
                  {selectedSubmission.userId}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Email</p>
                <p className="text-text-primary">{selectedSubmission.email}</p>
              </div>
              <div>
                <p className="text-text-muted">Submitted</p>
                <p className="text-text-primary">
                  {formatDate(selectedSubmission.submittedAt)}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Risk Score</p>
                <StatusBadge
                  variant={riskVariantMap[selectedSubmission.riskScore]}
                >
                  {selectedSubmission.riskScore}
                </StatusBadge>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-text-muted">Documents</p>
              <div className="space-y-2">
                {selectedSubmission.documents.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-tertiary px-3 py-2"
                  >
                    <span className="text-sm text-text-primary">{doc}</span>
                    <button className="text-xs text-akiba-green hover:text-akiba-green-light">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedSubmission.notes && (
              <div>
                <p className="mb-1 text-sm text-text-muted">Notes</p>
                <p className="rounded-lg border border-akiba-gold/20 bg-akiba-gold/5 px-3 py-2 text-sm text-akiba-gold">
                  {selectedSubmission.notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
