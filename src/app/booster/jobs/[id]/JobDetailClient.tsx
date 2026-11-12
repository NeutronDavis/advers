"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileCheck,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCircle,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import {
  acceptBoosterAssignmentAction,
  applyToBoosterJobAction,
  startBoosterJobAction,
  submitBoosterDeliverableAction,
} from "@/server/actions/booster";
import type { BoosterJobDetailData } from "@/server/data/booster";

type ActionResult = { success: true } | { success: false; error: string };

export default function JobDetailClient({
  job,
  hasProfile,
}: {
  job: BoosterJobDetailData;
  hasProfile: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [proposedFee, setProposedFee] = useState("");
  const [files, setFiles] = useState("");
  const [notes, setNotes] = useState("");
  const [locationEvidence, setLocationEvidence] = useState("");

  const run = (action: () => Promise<ActionResult>, message: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(message);
      router.refresh();
    });
  };

  const canApply =
    !job.application && ["PUBLISHED", "APPLICATIONS_OPEN"].includes(job.status);
  const canAccept =
    job.status === "ASSIGNED" && job.application?.status === "ASSIGNED";
  const canStart =
    job.status === "ACCEPTED" && job.application?.status === "ASSIGNED";
  const canSubmitProof = ["IN_PROGRESS", "REWORK_REQUESTED"].includes(job.status);

  const submitApplication = (event: React.FormEvent) => {
    event.preventDefault();
    run(
      () =>
        applyToBoosterJobAction({
          jobId: job.id,
          coverNote,
          proposedFee: proposedFee ? Number(proposedFee) : undefined,
        }),
      "Application submitted."
    );
  };

  const submitProof = (event: React.FormEvent) => {
    event.preventDefault();
    run(
      () =>
        submitBoosterDeliverableAction({
          jobId: job.id,
          files: files.split("\n").map((line) => line.trim()).filter(Boolean),
          notes,
          locationEvidence,
        }),
      "Proof submitted for review."
    );
  };

  return (
    <div className="space-y-6">
      <Link
        href="/booster/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/60 hover:text-base-content"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to marketplace
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-base-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-sm badge-primary badge-soft font-bold">
              {job.categoryLabel}
            </span>
            <span className={`badge badge-sm font-bold ${job.statusBadgeClass}`}>
              {job.statusLabel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {job.title}
          </h1>
          <div className="text-[11px] text-base-content/50 font-mono">
            {job.jobNumber}
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">
            Budget
          </div>
          <div className="text-2xl font-black font-mono">{formatNaira(job.budget)}</div>
          <div className="text-[10px] text-base-content/50">{job.paymentModelLabel}</div>
        </div>
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

      {!hasProfile && (
        <div className="alert alert-warning text-xs rounded-2xl">
          <ShieldCheck className="w-4 h-4" />
          <span>Create your Booster profile before applying for this job.</span>
          <Link
            href="/booster/profile"
            className="btn btn-xs btn-primary rounded-lg font-bold ml-auto"
          >
            Create profile
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Job brief
            </h2>
            <p className="text-sm text-base-content/80 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
            {job.scope && (
              <div className="p-3 rounded-2xl bg-base-200/50 text-xs text-base-content/70 whitespace-pre-line">
                {job.scope}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-base-200/40">
                <div className="text-[10px] font-bold uppercase text-base-content/50">
                  Location
                </div>
                <div className="font-bold mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {job.isRemote ? "Remote" : job.location}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-base-200/40">
                <div className="text-[10px] font-bold uppercase text-base-content/50">
                  Deadline
                </div>
                <div className="font-bold mt-0.5 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-primary" />
                  {job.deadline ? formatDate(job.deadline) : "Flexible"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-base-200/40">
                <div className="text-[10px] font-bold uppercase text-base-content/50">
                  Verification
                </div>
                <div className="font-bold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  {job.verificationLevel || "Standard"}
                </div>
              </div>
            </div>

            {job.requiredSkills.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase text-base-content/50 mb-1">
                  Required skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="badge badge-sm bg-base-200 border-none font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.proofRequirements.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase text-base-content/50 mb-1">
                  Required proof
                </div>
                <div className="space-y-1">
                  {job.proofRequirements.map((requirement) => (
                    <div
                      key={requirement}
                      className="flex items-start gap-2 text-xs text-base-content/70"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                      {requirement}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Application / execution */}
          {canApply && (
            <form
              onSubmit={submitApplication}
              className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  Apply for this job
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Tell the campaign manager why you are a good fit.
                </p>
              </div>
              <div className="space-y-1">
                <label htmlFor="cover-note" className="text-xs font-bold">
                  Cover note
                </label>
                <textarea
                  id="cover-note"
                  rows={4}
                  value={coverNote}
                  onChange={(event) => setCoverNote(event.target.value)}
                  placeholder="Relevant experience, availability and approach..."
                  className="textarea textarea-bordered w-full text-sm rounded-xl bg-base-200/50"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proposed-fee" className="text-xs font-bold">
                  Proposed fee (optional)
                </label>
                <input
                  id="proposed-fee"
                  type="number"
                  min="0"
                  value={proposedFee}
                  onChange={(event) => setProposedFee(event.target.value)}
                  placeholder="Leave blank to accept the posted budget"
                  className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !hasProfile}
                className="btn btn-primary rounded-xl font-bold gap-2"
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit application
              </button>
            </form>
          )}

          {job.application && !canApply && (
            <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">Your application</h2>
                <span className="badge badge-sm badge-primary badge-soft font-bold">
                  {job.application.statusLabel}
                </span>
              </div>
              <div className="text-[11px] text-base-content/60">
                Applied {formatDate(job.application.appliedAt)}
                {job.application.proposedFee
                  ? ` · Proposed ${formatNaira(job.application.proposedFee)}`
                  : ""}
              </div>
              {job.application.coverNote && (
                <div className="p-3 rounded-2xl bg-base-200/40 text-xs text-base-content/70">
                  {job.application.coverNote}
                </div>
              )}

              {canAccept && (
                <button
                  type="button"
                  onClick={() =>
                    run(
                      () => acceptBoosterAssignmentAction(job.id),
                      "Assignment accepted."
                    )
                  }
                  disabled={isPending}
                  className="btn btn-primary rounded-xl font-bold gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept assignment
                </button>
              )}

              {canStart && (
                <button
                  type="button"
                  onClick={() =>
                    run(
                      () => startBoosterJobAction(job.id),
                      "Job started. Submit proof when complete."
                    )
                  }
                  disabled={isPending}
                  className="btn btn-primary rounded-xl font-bold gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Start work
                </button>
              )}
            </div>
          )}

          {canSubmitProof && (
            <form
              onSubmit={submitProof}
              className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  Submit deliverable / proof
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Add evidence links (photos, videos, reports, delivery notes).
                </p>
              </div>
              <div className="space-y-1">
                <label htmlFor="proof-files" className="text-xs font-bold">
                  Evidence links (one per line) *
                </label>
                <textarea
                  id="proof-files"
                  rows={3}
                  required
                  value={files}
                  onChange={(event) => setFiles(event.target.value)}
                  placeholder={"https://drive.google.com/...\nhttps://photos.app/..."}
                  className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proof-notes" className="text-xs font-bold">
                  Notes
                </label>
                <textarea
                  id="proof-notes"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="What was delivered and where?"
                  className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="proof-location" className="text-xs font-bold">
                  Location evidence (optional)
                </label>
                <input
                  id="proof-location"
                  type="text"
                  value={locationEvidence}
                  onChange={(event) => setLocationEvidence(event.target.value)}
                  placeholder="e.g. GPS coordinates or address confirmation"
                  className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary rounded-xl font-bold gap-2"
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Submit for review
              </button>
            </form>
          )}

          {job.deliverables.length > 0 && (
            <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-success" />
                Deliverable history
              </h2>
              <div className="divide-y divide-base-200">
                {job.deliverables.map((deliverable) => (
                  <div key={deliverable.id} className="py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-base-content/50">
                        {formatDate(deliverable.submittedAt)}
                      </span>
                      <span
                        className={`badge badge-xs font-bold ${
                          deliverable.decision === "APPROVED"
                            ? "badge-success badge-soft"
                            : deliverable.decision === "REJECTED"
                              ? "badge-error badge-soft"
                              : "badge-warning badge-soft"
                        }`}
                      >
                        {deliverable.decisionLabel}
                      </span>
                    </div>
                    {deliverable.notes && (
                      <div className="text-xs text-base-content/70">
                        {deliverable.notes}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {deliverable.files.map((file) => (
                        <a
                          key={file}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="badge badge-sm bg-base-200 border-none font-medium hover:bg-base-300"
                        >
                          Evidence link
                        </a>
                      ))}
                    </div>
                    {deliverable.decisionReason && (
                      <div className="text-[11px] text-base-content/60">
                        Reviewer: {deliverable.decisionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold">Posted by</h2>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between gap-2">
                <span className="text-base-content/60">Client</span>
                <span className="font-bold text-right">{job.clientName || "Advers"}</span>
              </div>
              {job.campaignName && (
                <div className="flex justify-between gap-2">
                  <span className="text-base-content/60">Campaign</span>
                  <span className="font-bold text-right">{job.campaignName}</span>
                </div>
              )}
              {job.businessProfileName && (
                <div className="flex justify-between gap-2">
                  <span className="text-base-content/60">Business</span>
                  <span className="font-bold text-right">{job.businessProfileName}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-base-content/60">Posted</span>
                <span className="font-bold text-right">{formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="card bg-primary/5 border border-primary/20 rounded-3xl p-5 shadow-xs space-y-2">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <UserCircle className="w-4 h-4 text-primary" />
              Booster reminder
            </h2>
            <p className="text-[11px] text-base-content/70">
              Keep your profile, coverage and portfolio current. Advertisers use
              them to assess fit before assignment.
            </p>
            <Link
              href="/booster/profile"
              className="btn btn-sm btn-primary rounded-xl font-bold w-full gap-1.5"
            >
              Update profile
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
