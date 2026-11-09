"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Plus,
  Send,
  Sparkles,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import {
  BOOSTER_JOB_CATEGORY_LABELS,
  BOOSTER_PAYMENT_MODEL_LABELS,
} from "@/lib/booster-status";
import {
  assignBoosterToJobAction,
  closeBoosterJobAction,
  createBoosterJobAction,
  publishBoosterJobAction,
  reviewBoosterDeliverableAction,
} from "@/server/actions/admin-booster-jobs";
import type { AdminBoosterJobView } from "@/server/data/booster";

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
  clientId: "",
  campaignId: "",
  businessProfileId: "",
  teamId: "",
  publish: true,
};

export default function AdminBoosterJobsClient({
  jobs,
  clients,
  campaigns,
  businessProfiles,
  teams,
}: {
  jobs: AdminBoosterJobView[];
  clients: { id: string; name: string }[];
  campaigns: { id: string; name: string; campaignNumber: string; clientId: string | null }[];
  businessProfiles: { id: string; name: string; clientId: string }[];
  teams: { id: string; name: string; manager: { displayName: string } }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [form, setForm] = useState(EMPTY_FORM);

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

  const createJob = (event: React.FormEvent) => {
    event.preventDefault();
    run(
      () =>
        createBoosterJobAction({
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
          clientId: form.clientId || undefined,
          campaignId: form.campaignId || undefined,
          businessProfileId: form.businessProfileId || undefined,
          teamId: form.teamId || undefined,
          publish: form.publish,
        }),
      "Booster job created."
    );
    setShowCreate(false);
    setForm(EMPTY_FORM);
  };

  const tabs = [
    { key: "ALL", label: "All jobs" },
    { key: "DRAFT", label: "Drafts" },
    { key: "OPEN", label: "Open" },
    { key: "IN_PROGRESS", label: "In progress" },
    { key: "REVIEW", label: "Proof review" },
    { key: "CLOSED", label: "Closed" },
  ];

  const matchesTab = (job: AdminBoosterJobView, tab: string) => {
    if (tab === "ALL") return true;
    if (tab === "DRAFT") return job.status === "DRAFT";
    if (tab === "OPEN")
      return ["PUBLISHED", "APPLICATIONS_OPEN"].includes(job.status);
    if (tab === "IN_PROGRESS")
      return [
        "ASSIGNED",
        "ACCEPTED",
        "IN_PROGRESS",
        "REWORK_REQUESTED",
      ].includes(job.status);
    if (tab === "REVIEW") return job.status === "SUBMITTED_FOR_REVIEW";
    if (tab === "CLOSED")
      return [
        "APPROVED",
        "PAYMENT_PENDING",
        "PAID",
        "CLOSED",
        "REJECTED",
        "CANCELLED",
        "WITHDRAWN",
        "DISPUTED",
      ].includes(job.status);
    return true;
  };

  const filtered = jobs.filter((job) => matchesTab(job, activeTab));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster marketplace administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Booster Jobs
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Publish opportunities, review applications, assign Boosters and
            approve proof of work.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((current) => !current)}
          className="btn btn-sm btn-primary rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? "Close form" : "Create Booster job"}
        </button>
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

      {showCreate && (
        <form
          onSubmit={createJob}
          className="card bg-base-100 border border-primary/30 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold">Create a Booster job</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold">Job title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="e.g. Design 3 campaign flyers"
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Category *</label>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-base-200/50"
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
            <label className="text-xs font-bold">Description *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="What needs to be done, expected quality and context."
              className="textarea textarea-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold">Scope / work package</label>
              <textarea
                rows={2}
                value={form.scope}
                onChange={(event) =>
                  setForm((current) => ({ ...current, scope: event.target.value }))
                }
                className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Proof requirements (comma or newline)</label>
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
                className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold">Location *</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="Lagos / Remote"
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Budget (₦) *</label>
              <input
                type="number"
                min="1"
                required
                value={form.budget}
                onChange={(event) =>
                  setForm((current) => ({ ...current, budget: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Payment model</label>
              <select
                value={form.paymentModel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paymentModel: event.target.value,
                  }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-base-200/50"
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
              <label className="text-xs font-bold">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(event) =>
                  setForm((current) => ({ ...current, deadline: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Required skills</label>
              <input
                type="text"
                value={form.requiredSkills}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    requiredSkills: event.target.value,
                  }))
                }
                placeholder="Photoshop, delivery, reporting"
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Verification level</label>
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
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold">Client</label>
              <select
                value={form.clientId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, clientId: event.target.value }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-base-200/50"
              >
                <option value="">No client link</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Campaign</label>
              <select
                value={form.campaignId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, campaignId: event.target.value }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-base-200/50"
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
              <label className="text-xs font-bold">Business profile</label>
              <select
                value={form.businessProfileId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    businessProfileId: event.target.value,
                  }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-base-200/50"
              >
                <option value="">No profile link</option>
                {businessProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Booster team</label>
              <select
                value={form.teamId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, teamId: event.target.value }))
                }
                className="select select-bordered w-full text-sm rounded-xl bg-base-200/50"
              >
                <option value="">No team (individual assignment)</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} · {team.manager.displayName}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-base-content/50">
                Selecting a team assigns the team manager and notifies the team.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-base-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
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
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={form.publish}
                onChange={(event) =>
                  setForm((current) => ({ ...current, publish: event.target.checked }))
                }
                className="checkbox checkbox-primary checkbox-sm"
              />
              Publish immediately
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary rounded-xl font-bold gap-2"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Create job
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold ${
              activeTab === tab.key ? "btn-primary" : "btn-ghost border border-base-300"
            }`}
          >
            {tab.label}
            <span className="badge badge-xs">
              {jobs.filter((job) => matchesTab(job, tab.key)).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-12 text-center text-xs text-base-content/60">
            No Booster jobs in this stage.
          </div>
        ) : (
          filtered.map((job) => (
            <div
              key={job.id}
              className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 pb-3 border-b border-base-200">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary">
                      {job.jobNumber}
                    </span>
                    <span className={`badge badge-sm font-bold ${job.statusBadgeClass}`}>
                      {job.statusLabel}
                    </span>
                    <span className="badge badge-sm badge-ghost font-bold">
                      {job.categoryLabel}
                    </span>
                  </div>
                  <h2 className="text-base font-black mt-1">{job.title}</h2>
                  <div className="text-xs text-base-content/60">
                    {job.clientName || "No client"} ·{" "}
                    {job.isRemote ? "Remote" : job.location}
                    {job.deadline ? ` · due ${formatDate(job.deadline)}` : ""}
                    {job.teamName ? ` · Team: ${job.teamName}` : ""}
                  </div>
                </div>
                <div className="text-left lg:text-right">
                  <div className="text-sm font-black font-mono">
                    {formatNaira(job.budget)}
                  </div>
                  <div className="text-[10px] text-base-content/60">
                    {job.paymentModelLabel}
                  </div>
                </div>
              </div>

              <p className="text-xs text-base-content/70 line-clamp-3">
                {job.description}
              </p>

              {job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="badge badge-xs bg-base-200 border-none font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {job.applications.length > 0 && (
                <div className="p-3 rounded-2xl bg-base-200/40 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-base-content/50">
                    Applications ({job.applications.length})
                  </div>
                  {job.applications.map((application) => (
                    <div
                      key={application.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold">{application.boosterName}</span>
                        <span className="text-base-content/50 ml-2">
                          {application.statusLabel} · applied{" "}
                          {formatDate(application.appliedAt)}
                          {application.proposedFee
                            ? ` · proposed ${formatNaira(application.proposedFee)}`
                            : ""}
                        </span>
                      </div>
                      {["PUBLISHED", "APPLICATIONS_OPEN", "ASSIGNED"].includes(
                        job.status
                      ) && (
                        <button
                          type="button"
                          onClick={() =>
                            run(
                              () =>
                                assignBoosterToJobAction(job.id, application.id),
                              `${application.boosterName} assigned to ${job.title}.`
                            )
                          }
                          disabled={isPending}
                          className="btn btn-xs btn-primary rounded-lg font-bold gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Assign
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {job.deliverables.length > 0 && (
                <div className="p-3 rounded-2xl bg-base-200/40 space-y-3">
                  <div className="text-[10px] font-bold uppercase text-base-content/50">
                    Deliverables / proof
                  </div>
                  {job.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="space-y-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">{deliverable.boosterName}</span>
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
                        <span className="text-[10px] text-base-content/50">
                          {formatDate(deliverable.submittedAt)}
                        </span>
                      </div>
                      {deliverable.notes && (
                        <div className="text-base-content/70">{deliverable.notes}</div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {deliverable.files.map((file) => (
                          <a
                            key={file}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="badge badge-sm bg-base-100 border border-base-300 font-medium"
                          >
                            Evidence link
                          </a>
                        ))}
                      </div>
                      {deliverable.decision === "PENDING" && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              run(
                                () =>
                                  reviewBoosterDeliverableAction({
                                    deliverableId: deliverable.id,
                                    decision: "APPROVED",
                                  }),
                                "Deliverable approved."
                              )
                            }
                            disabled={isPending}
                            className="btn btn-xs btn-primary rounded-lg font-bold gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const reason = window.prompt("Describe the rework required:");
                              if (!reason) return;
                              run(
                                () =>
                                  reviewBoosterDeliverableAction({
                                    deliverableId: deliverable.id,
                                    decision: "REWORK_REQUESTED",
                                    reason,
                                  }),
                                "Rework requested."
                              );
                            }}
                            disabled={isPending}
                            className="btn btn-xs btn-ghost text-warning rounded-lg font-bold gap-1"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                            Rework
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const reason = window.prompt("Reason for rejecting this proof:");
                              if (!reason) return;
                              run(
                                () =>
                                  reviewBoosterDeliverableAction({
                                    deliverableId: deliverable.id,
                                    decision: "REJECTED",
                                    reason,
                                  }),
                                "Deliverable rejected."
                              );
                            }}
                            disabled={isPending}
                            className="btn btn-xs btn-ghost text-error rounded-lg font-bold gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-base-200">
                {["DRAFT", "PUBLISHED"].includes(job.status) && (
                  <button
                    type="button"
                    onClick={() =>
                      run(
                        () => publishBoosterJobAction(job.id),
                        `${job.title} published.`
                      )
                    }
                    disabled={isPending}
                    className="btn btn-sm btn-primary rounded-xl text-xs font-bold gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    Publish
                  </button>
                )}
                {job.status !== "CLOSED" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Close this Booster job?")) return;
                      run(
                        () => closeBoosterJobAction(job.id),
                        `${job.title} closed.`
                      );
                    }}
                    disabled={isPending}
                    className="btn btn-sm btn-ghost text-base-content/60 rounded-xl text-xs font-bold gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Close job
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
