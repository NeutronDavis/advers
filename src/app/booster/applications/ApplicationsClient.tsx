"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import { withdrawBoosterApplicationAction } from "@/server/actions/booster";
import type {
  BoosterApplicationView,
  BoosterJobCard,
} from "@/server/data/booster";

export default function ApplicationsClient({
  hasProfile,
  applications,
  assignedJobs,
}: {
  hasProfile: boolean;
  applications: BoosterApplicationView[];
  assignedJobs: BoosterJobCard[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"APPLICATIONS" | "ASSIGNED">("APPLICATIONS");

  const withdraw = (applicationId: string) => {
    if (!window.confirm("Withdraw this application?")) return;
    setError(null);
    startTransition(async () => {
      const result = await withdrawBoosterApplicationAction(applicationId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster work management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My applications &amp; assignments
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Track applications, accept assignments and submit proof of work.
          </p>
        </div>
        <Link
          href="/booster/jobs"
          className="btn btn-sm btn-primary rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          Browse jobs
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {!hasProfile && (
        <div className="alert alert-warning text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>Create your Booster profile to apply for jobs.</span>
          <Link
            href="/booster/profile"
            className="btn btn-xs btn-primary rounded-lg font-bold ml-auto"
          >
            Create profile
          </Link>
        </div>
      )}

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("APPLICATIONS")}
          className={`btn btn-sm rounded-xl text-xs font-bold ${
            tab === "APPLICATIONS" ? "btn-primary" : "btn-ghost border border-base-300"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Applications
          <span className="badge badge-xs">{applications.length}</span>
        </button>
        <button
          onClick={() => setTab("ASSIGNED")}
          className={`btn btn-sm rounded-xl text-xs font-bold ${
            tab === "ASSIGNED" ? "btn-primary" : "btn-ghost border border-base-300"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Assigned work
          <span className="badge badge-xs">{assignedJobs.length}</span>
        </button>
      </div>

      {tab === "APPLICATIONS" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold">Job applications</h2>
            <p className="text-[11px] text-base-content/60">
              Applications you have submitted to the marketplace.
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="p-10 rounded-2xl bg-base-200/40 text-center text-xs text-base-content/60">
              No applications yet. Browse the marketplace and apply to a job.
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/booster/jobs/${application.jobId}`}
                        className="text-sm font-bold hover:text-primary"
                      >
                        {application.jobTitle}
                      </Link>
                      <span className="badge badge-xs badge-primary badge-soft font-bold">
                        {application.statusLabel}
                      </span>
                      <span
                        className={`badge badge-xs font-bold ${application.jobStatusBadgeClass}`}
                      >
                        {application.jobStatusLabel}
                      </span>
                    </div>
                    <div className="text-[10px] text-base-content/60 mt-1 flex flex-wrap items-center gap-2">
                      <span>{application.categoryLabel}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {application.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Applied {formatDate(application.appliedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold">
                        {formatNaira(application.budget)}
                      </div>
                      <div className="text-[9px] text-base-content/50">
                        {application.paymentModelLabel}
                      </div>
                    </div>
                    {["APPLIED", "SHORTLISTED"].includes(application.status) && (
                      <button
                        type="button"
                        onClick={() => withdraw(application.id)}
                        disabled={isPending}
                        className="btn btn-xs btn-ghost text-base-content/50 hover:text-error rounded-lg font-bold gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Withdraw
                      </button>
                    )}
                    <Link
                      href={`/booster/jobs/${application.jobId}`}
                      className="btn btn-xs btn-ghost border border-base-300 rounded-lg font-bold"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "ASSIGNED" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold">Assigned work</h2>
            <p className="text-[11px] text-base-content/60">
              Jobs assigned to you. Open a job to accept, start work or submit
              proof.
            </p>
          </div>

          {assignedJobs.length === 0 ? (
            <div className="p-10 rounded-2xl bg-base-200/40 text-center text-xs text-base-content/60">
              No assigned work yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/booster/jobs/${job.id}`}
                  className="p-4 rounded-2xl border border-base-200 hover:border-primary/40 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge badge-xs badge-primary badge-soft font-bold">
                      {job.categoryLabel}
                    </span>
                    <span className={`badge badge-xs font-bold ${job.statusBadgeClass}`}>
                      {job.statusLabel}
                    </span>
                  </div>
                  <div className="text-sm font-bold">{job.title}</div>
                  <div className="text-[10px] text-base-content/60 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.isRemote ? "Remote" : job.location}
                    </span>
                    {job.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {formatDate(job.deadline)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-xs font-bold">
                      {formatNaira(job.budget)}
                    </span>
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                      Open work
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
