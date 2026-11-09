"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  X,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import {
  BOOSTER_JOB_CATEGORY_LABELS,
  BOOSTER_PAYMENT_MODEL_LABELS,
} from "@/lib/booster-status";
import {
  cancelAdvertiserBoosterJobAction,
  requestBoosterJobAction,
} from "@/server/actions/advertiser-booster-jobs";
import {
  openBoosterDisputeAction,
  rateBoosterAction,
} from "@/server/actions/finance";
import type { BoosterJobCard } from "@/server/data/booster";

type ActionResult = { success: true } | { success: false; error: string };

const EMPTY_FORM = {
  category: "CREATIVE",
  title: "",
  description: "",
  scope: "",
  location: "",
  isRemote: false,
  deadline: "",
  budget: "",
  paymentModel: "FIXED",
  proofRequirements: "",
  requiredSkills: "",
  verificationLevel: "",
  campaignId: "",
  businessProfileId: "",
};

export default function AdvertiserBoosterJobsClient({
  jobs,
  campaigns,
  businessProfiles,
}: {
  jobs: BoosterJobCard[];
  campaigns: { id: string; name: string; campaignNumber: string }[];
  businessProfiles: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [ratingFor, setRatingFor] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState("5");
  const [ratingComment, setRatingComment] = useState("");
  const [disputeFor, setDisputeFor] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");

  const run = (
    action: () => Promise<ActionResult>,
    message: string,
    onSuccess?: () => void
  ) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      setNotice(message);
      router.refresh();
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    run(
      () =>
        requestBoosterJobAction({
          category: form.category as never,
          title: form.title,
          description: form.description,
          scope: form.scope,
          location: form.location,
          isRemote: form.isRemote,
          deadline: form.deadline || undefined,
          budget: Number(form.budget || 0),
          paymentModel: form.paymentModel as never,
          proofRequirements: form.proofRequirements,
          requiredSkills: form.requiredSkills,
          verificationLevel: form.verificationLevel,
          campaignId: form.campaignId || undefined,
          businessProfileId: form.businessProfileId || undefined,
        }),
      "Booster job request submitted to Advers for review."
    );
    setShowForm(false);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Booster marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Booster jobs
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Request creative, production, delivery, field, intelligence, sales or
            technical support for your campaigns.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="btn btn-sm bg-[var(--portal-obsidian)] hover:bg-black text-white border-none rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Close form" : "Request Booster job"}
        </button>
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="alert bg-[var(--portal-success-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-2xl text-xs">
          <CheckCircle2 className="w-4 h-4 text-[var(--portal-success)]" />
          <span>{notice}</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="card bg-[var(--portal-surface)] border border-[var(--portal-gold-border)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--portal-gold-ink)]" />
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              Request a Booster job
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Job title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="e.g. Print and deliver 500 flyers"
                className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              >
                {Object.entries(BOOSTER_JOB_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--portal-ink)]">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Describe the work, quantity, quality and location."
              className="textarea textarea-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Scope / work package
              </label>
              <textarea
                rows={2}
                value={form.scope}
                onChange={(event) =>
                  setForm((current) => ({ ...current, scope: event.target.value }))
                }
                className="textarea textarea-bordered w-full text-xs rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Required proof
              </label>
              <textarea
                rows={2}
                value={form.proofRequirements}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    proofRequirements: event.target.value,
                  }))
                }
                placeholder="Photos, delivery note, GPS evidence"
                className="textarea textarea-bordered w-full text-xs rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Location *
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="Lagos / Remote"
                className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Budget (₦) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.budget}
                onChange={(event) =>
                  setForm((current) => ({ ...current, budget: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Payment model
              </label>
              <select
                value={form.paymentModel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paymentModel: event.target.value,
                  }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              >
                {Object.entries(BOOSTER_PAYMENT_MODEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(event) =>
                  setForm((current) => ({ ...current, deadline: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Required skills
              </label>
              <input
                type="text"
                value={form.requiredSkills}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    requiredSkills: event.target.value,
                  }))
                }
                placeholder="Printing, delivery, reporting"
                className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Verification level
              </label>
              <input
                type="text"
                value={form.verificationLevel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    verificationLevel: event.target.value,
                  }))
                }
                placeholder="Standard / Verified"
                className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Link to campaign
              </label>
              <select
                value={form.campaignId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, campaignId: event.target.value }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              >
                <option value="">No campaign link</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.campaignNumber} · {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--portal-ink)]">
                Business profile
              </label>
              <select
                value={form.businessProfileId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    businessProfileId: event.target.value,
                  }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              >
                <option value="">Account default</option>
                {businessProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--portal-line-soft)]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--portal-ink)]">
              <input
                type="checkbox"
                checked={form.isRemote}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isRemote: event.target.checked }))
                }
                className="checkbox checkbox-primary checkbox-sm"
              />
              Remote
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-sm bg-[var(--portal-obsidian)] hover:bg-black text-white border-none rounded-xl text-xs font-bold gap-1.5"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Submit request
            </button>
          </div>
        </form>
      )}

      {jobs.length === 0 ? (
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-12 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-[var(--portal-muted)] mx-auto" />
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            No Booster jobs yet
          </h2>
          <p className="text-xs text-[var(--portal-muted)] max-w-sm mx-auto">
            Request creative, production, delivery or field support for a campaign.
            Advers reviews and publishes the job to the Booster marketplace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-xs bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                      {job.categoryLabel}
                    </span>
                    <span className={`badge badge-xs font-bold ${job.statusBadgeClass}`}>
                      {job.statusLabel}
                    </span>
                  </div>
                  <h2 className="text-sm font-black text-[var(--portal-ink)] mt-1.5">
                    {job.title}
                  </h2>
                  <div className="text-[10px] text-[var(--portal-muted)] font-mono">
                    {job.jobNumber}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-[var(--portal-ink)] font-mono">
                    {formatNaira(job.budget)}
                  </div>
                  <div className="text-[9px] text-[var(--portal-muted)]">
                    {job.paymentModelLabel}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[var(--portal-body)] line-clamp-2">
                {job.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--portal-muted)]">
                <span>{job.isRemote ? "Remote" : job.location}</span>
                <span className="text-right">
                  {job.deadline ? `Due ${formatDate(job.deadline)}` : "Flexible deadline"}
                </span>
                <span>{job.campaignName || "No campaign link"}</span>
                <span className="text-right">
                  {job.applicationsCount} application
                  {job.applicationsCount === 1 ? "" : "s"}
                </span>
              </div>

              {job.assignedBoosterName && (
                <div className="p-2.5 rounded-xl bg-[var(--portal-success-soft)] text-[11px] text-[var(--portal-body)]">
                  Assigned Booster:{" "}
                  <span className="font-bold text-[var(--portal-ink)]">
                    {job.assignedBoosterName}
                  </span>
                </div>
              )}

              {job.assignedBoosterName &&
                ["APPROVED", "PAID", "CLOSED"].includes(job.status) && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRatingFor(ratingFor === job.id ? null : job.id);
                          setDisputeFor(null);
                        }}
                        className="btn btn-xs btn-ghost border border-[var(--portal-line)] rounded-lg font-bold gap-1"
                      >
                        <Star className="w-3.5 h-3.5 text-[var(--portal-gold-ink)]" />
                        Rate Booster
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDisputeFor(disputeFor === job.id ? null : job.id);
                          setRatingFor(null);
                        }}
                        className="btn btn-xs btn-ghost text-[var(--portal-muted)] hover:text-error rounded-lg font-bold gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Raise dispute
                      </button>
                    </div>

                    {ratingFor === job.id && (
                      <div className="p-3 rounded-2xl bg-[var(--portal-soft)] space-y-2">
                        <div className="text-[11px] font-bold text-[var(--portal-ink)]">
                          Rate {job.assignedBoosterName}
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={ratingScore}
                            onChange={(event) => setRatingScore(event.target.value)}
                            className="select select-bordered select-sm w-24 text-xs rounded-lg"
                          >
                            {[5, 4, 3, 2, 1].map((score) => (
                              <option key={score} value={score}>
                                {score} star{score === 1 ? "" : "s"}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={ratingComment}
                            onChange={(event) => setRatingComment(event.target.value)}
                            placeholder="Optional comment"
                            className="input input-bordered input-sm flex-1 text-xs rounded-lg"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              run(
                                () =>
                                  rateBoosterAction({
                                    jobId: job.id,
                                    score: Number(ratingScore),
                                    comment: ratingComment,
                                  }),
                                "Rating submitted for moderation.",
                                () => {
                                  setRatingFor(null);
                                  setRatingComment("");
                                }
                              )
                            }
                            disabled={isPending}
                            className="btn btn-xs bg-[var(--portal-obsidian)] text-white border-none rounded-lg font-bold"
                          >
                            Submit rating
                          </button>
                        </div>
                      </div>
                    )}

                    {disputeFor === job.id && (
                      <div className="p-3 rounded-2xl bg-[var(--portal-soft)] space-y-2">
                        <div className="text-[11px] font-bold text-[var(--portal-ink)]">
                          Raise a dispute
                        </div>
                        <textarea
                          rows={2}
                          value={disputeReason}
                          onChange={(event) => setDisputeReason(event.target.value)}
                          placeholder="Describe the issue with the work or delivery."
                          className="textarea textarea-bordered w-full text-xs rounded-xl"
                        />
                        <textarea
                          rows={2}
                          value={disputeEvidence}
                          onChange={(event) => setDisputeEvidence(event.target.value)}
                          placeholder="Evidence links (one per line)"
                          className="textarea textarea-bordered w-full text-xs rounded-xl"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              run(
                                () =>
                                  openBoosterDisputeAction({
                                    jobId: job.id,
                                    reason: disputeReason,
                                    evidence: disputeEvidence,
                                  }),
                                "Dispute submitted for Advers review.",
                                () => {
                                  setDisputeFor(null);
                                  setDisputeReason("");
                                  setDisputeEvidence("");
                                }
                              )
                            }
                            disabled={isPending || !disputeReason.trim()}
                            className="btn btn-xs btn-error rounded-lg font-bold text-white"
                          >
                            Submit dispute
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              <div className="flex items-center justify-between pt-2 border-t border-[var(--portal-line-soft)]">
                <span className="text-[10px] text-[var(--portal-muted)]">
                  Requested {formatDate(job.createdAt)}
                </span>
                {["DRAFT", "PUBLISHED", "APPLICATIONS_OPEN"].includes(job.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Cancel this Booster job request?")) return;
                      run(
                        () => cancelAdvertiserBoosterJobAction(job.id),
                        "Booster job request cancelled."
                      );
                    }}
                    disabled={isPending}
                    className="btn btn-xs btn-ghost text-[var(--portal-muted)] hover:text-error rounded-lg font-bold gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
