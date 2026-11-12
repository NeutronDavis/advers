"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { submitBoosterVerificationAction } from "@/server/actions/booster";
import type { BoosterProfileData } from "@/server/data/booster";

function statusBadgeClass(status: string): string {
  switch (status) {
    case "VERIFIED":
      return "badge-success badge-soft";
    case "PENDING":
      return "badge-warning badge-soft";
    case "REJECTED":
      return "badge-error badge-soft";
    default:
      return "badge-ghost border border-base-300";
  }
}

const VERIFICATION_LEVELS = ["Standard", "Verified", "Business"];

export default function VerificationClient({
  profile,
}: {
  profile: BoosterProfileData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [documents, setDocuments] = useState(
    profile.verificationDocuments.join("\n")
  );
  const [level, setLevel] = useState(profile.verificationLevel || "Standard");
  const [note, setNote] = useState("");

  const canSubmit =
    profile.verificationStatus !== "VERIFIED" &&
    profile.verificationStatus !== "PENDING";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    startTransition(async () => {
      const result = await submitBoosterVerificationAction({
        documents,
        level,
        note,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setNotice("Verification submitted. Our team will review your documents.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <Link
            href="/booster/profile"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-base-content/60 hover:text-base-content mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to profile
          </Link>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Trust &amp; safety
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Verification
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Verify your identity, business and portfolio to unlock higher-value
            work and build advertiser trust.
          </p>
        </div>
        <span
          className={`badge badge-lg font-bold gap-1.5 self-start sm:self-auto ${statusBadgeClass(
            profile.verificationStatus
          )}`}
        >
          <BadgeCheck className="w-4 h-4" />
          {profile.verificationLabel}
        </span>
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="alert alert-success text-xs rounded-2xl">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">Current status</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`badge badge-sm font-bold ${statusBadgeClass(
                  profile.verificationStatus
                )}`}
              >
                {profile.verificationLabel}
              </span>
              <span className="badge badge-sm badge-ghost border border-base-300 font-medium">
                Requested level: {profile.verificationLevel || "Standard"}
              </span>
              {profile.fraudRisk !== "LOW" && (
                <span className="badge badge-sm badge-error badge-soft font-bold gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Extra review
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs text-base-content/70">
              {profile.verificationSubmittedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-base-content/40" />
                  Submitted {formatDate(profile.verificationSubmittedAt)}
                </div>
              )}
              {profile.verificationReviewedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-base-content/40" />
                  Reviewed {formatDate(profile.verificationReviewedAt)}
                </div>
              )}
              {profile.verificationStatus === "VERIFIED" && profile.verifiedAt && (
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-3.5 h-3.5 text-success" />
                  Verified {formatDate(profile.verifiedAt)}
                </div>
              )}
            </div>

            {profile.verificationSubmittedNote && (
              <div className="p-3 rounded-xl bg-base-200/50 text-xs text-base-content/70">
                <div className="text-[10px] font-bold uppercase tracking-wider text-base-content/45 mb-1">
                  Your submission note
                </div>
                {profile.verificationSubmittedNote}
              </div>
            )}

            {profile.verificationNotes && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  profile.verificationStatus === "REJECTED"
                    ? "bg-error/5 border border-error/20 text-error"
                    : "bg-base-200/50 text-base-content/70"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">
                  Reviewer note
                </div>
                {profile.verificationNotes}
              </div>
            )}

            <div className="pt-3 border-t border-base-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Documents on file
              </div>
              {profile.verificationDocuments.length === 0 ? (
                <p className="text-[11px] text-base-content/50">
                  No documents submitted yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.verificationDocuments.map((document, index) => (
                    <a
                      key={`${document}-${index}`}
                      href={document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="badge badge-sm bg-base-200 border-none font-medium gap-1 hover:bg-base-300"
                    >
                      Document {index + 1}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>

          {canSubmit ? (
            <form
              onSubmit={submit}
              className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5"
            >
              <div>
                <h2 className="text-sm font-bold">Submit verification documents</h2>
                <p className="text-[11px] text-base-content/60 mt-0.5">
                  Add secure links to your documents. Only authorised Advers
                  reviewers can see them.
                </p>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="verification-documents"
                  className="text-xs font-bold"
                >
                  Document links (one URL per line) *
                </label>
                <textarea
                  id="verification-documents"
                  rows={4}
                  required
                  value={documents}
                  onChange={(event) => setDocuments(event.target.value)}
                  placeholder={
                    "https://.../government-id.pdf\nhttps://.../business-registration.pdf\nhttps://.../portfolio.pdf"
                  }
                  className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
                />
                <p className="text-[10px] text-base-content/50">
                  Upload files to your secure storage first, then paste the links
                  here. Links must start with https://.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="verification-level"
                    className="text-xs font-bold"
                  >
                    Requested level
                  </label>
                  <select
                    id="verification-level"
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    className="select select-bordered w-full text-sm rounded-xl bg-base-200/50"
                  >
                    {VERIFICATION_LEVELS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="verification-note"
                    className="text-xs font-bold"
                  >
                    Note to reviewer (optional)
                  </label>
                  <input
                    id="verification-note"
                    type="text"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="e.g. Business registration is in my trading name"
                    className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-base-200">
                <p className="text-[10px] text-base-content/50 max-w-lg">
                  Submitting moves your profile into the verification queue. You
                  will be notified when a decision is made.
                </p>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary rounded-xl font-bold gap-2 shrink-0"
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isPending ? "Submitting..." : "Submit for verification"}
                </button>
              </div>
            </form>
          ) : (
            <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                {profile.verificationStatus === "VERIFIED" ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Clock className="w-4 h-4 text-warning" />
                )}
                <h2 className="text-sm font-bold">
                  {profile.verificationStatus === "VERIFIED"
                    ? "Your profile is verified"
                    : "Verification under review"}
                </h2>
              </div>
              <p className="text-xs text-base-content/65">
                {profile.verificationStatus === "VERIFIED"
                  ? "Your documents have been approved. Contact Advers support if your business details change and need re-verification."
                  : "Our trust and safety team is reviewing your submission. You will receive a notification when a decision is made."}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold">What you may need</h2>
            <ul className="space-y-2 text-xs text-base-content/70">
              {[
                "Government-issued photo ID or passport",
                "Business registration or CAC certificate",
                "Proof of address or utility bill",
                "Portfolio links or references",
                "Professional certifications (optional)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold">How review works</h2>
            <ol className="space-y-3 text-xs text-base-content/70">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>Submit your documents and requested verification level.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Trust &amp; safety checks your identity, business details and
                  portfolio.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  You are approved, or you receive a reason and can resubmit.
                </span>
              </li>
            </ol>
          </section>

          {profile.verificationStatus === "REJECTED" && (
            <section className="card bg-error/5 border border-error/20 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-error">
                <XCircle className="w-4 h-4" />
                Not approved
              </div>
              <p className="text-xs text-error/80">
                Review the note above, replace any unclear documents and submit
                again.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
