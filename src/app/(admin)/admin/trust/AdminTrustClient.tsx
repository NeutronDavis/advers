"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ShieldAlert,
  Star,
  XCircle,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  moderateRatingAction,
  resolveDisputeAction,
  reviewBoosterVerificationAction,
} from "@/server/actions/finance";
import type { AdminTrustData } from "@/server/data/finance";

type ActionResult = { success: true } | { success: false; error: string };
type Tab = "VERIFICATIONS" | "RATINGS" | "DISPUTES";

export default function AdminTrustClient({ data }: { data: AdminTrustData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("VERIFICATIONS");

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

  const tabs: { key: Tab; label: string; count: number }[] = [
    {
      key: "VERIFICATIONS",
      label: "Verification queue",
      count: data.verifications.length,
    },
    { key: "RATINGS", label: "Rating moderation", count: data.ratings.length },
    { key: "DISPUTES", label: "Disputes", count: data.disputes.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Trust &amp; safety
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Verification, Ratings &amp; Disputes
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Review Booster documents, moderate ratings and resolve disputes with an
            audit trail.
          </p>
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

      <div className="flex items-center gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold ${
              tab === item.key ? "btn-primary" : "btn-ghost border border-base-300"
            }`}
          >
            {item.label}
            <span className="badge badge-xs">{item.count}</span>
          </button>
        ))}
      </div>

      {tab === "VERIFICATIONS" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold">Booster verification queue</h2>
            <p className="text-xs text-base-content/60">
              Approve or reject submitted identity, business and portfolio documents.
            </p>
          </div>

          {data.verifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-base-content/60">
              No Booster profiles are waiting for verification.
            </div>
          ) : (
            <div className="space-y-3">
              {data.verifications.map((profile) => (
                <div
                  key={profile.id}
                  className="p-4 rounded-2xl border border-base-200 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black">{profile.displayName}</h3>
                        <span className="badge badge-xs badge-warning badge-soft font-bold">
                          {profile.verificationStatus}
                        </span>
                        {profile.fraudRisk !== "LOW" && (
                          <span className="badge badge-xs badge-error badge-soft font-bold">
                            Fraud: {profile.fraudRisk}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-base-content/60">
                        {profile.businessName || "Individual Booster"} · requested{" "}
                        {profile.verificationLevel || "Standard"} · submitted{" "}
                        {formatDate(profile.submittedAt || profile.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const level = window.prompt(
                            "Verification level to grant (e.g. Standard, Verified, Business):",
                            profile.verificationLevel || "Verified"
                          );
                          if (!level) return;
                          run(
                            () =>
                              reviewBoosterVerificationAction({
                                boosterId: profile.id,
                                decision: "VERIFIED",
                                level,
                              }),
                            `${profile.displayName} verified.`
                          );
                        }}
                        disabled={isPending}
                        className="btn btn-xs btn-primary rounded-lg font-bold gap-1"
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const notes = window.prompt(
                            "Reason for rejecting this verification:"
                          );
                          if (!notes) return;
                          run(
                            () =>
                              reviewBoosterVerificationAction({
                                boosterId: profile.id,
                                decision: "REJECTED",
                                notes,
                              }),
                            `${profile.displayName} verification rejected.`
                          );
                        }}
                        disabled={isPending}
                        className="btn btn-xs btn-ghost text-error rounded-lg font-bold gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>

                  {profile.submittedNote && (
                    <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-[11px] text-base-content/70">
                      <span className="font-bold">Booster note: </span>
                      {profile.submittedNote}
                    </div>
                  )}

                  {profile.notes && (
                    <div className="p-2.5 rounded-xl bg-base-200/50 text-[11px] text-base-content/70">
                      {profile.notes}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {profile.documents.length === 0 ? (
                      <span className="text-[11px] text-base-content/50">
                        No documents supplied.
                      </span>
                    ) : (
                      profile.documents.map((document) => (
                        <a
                          key={document}
                          href={document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="badge badge-sm bg-base-200 border-none font-medium hover:bg-base-300"
                        >
                          Verification document
                        </a>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "RATINGS" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold">Rating moderation</h2>
            <p className="text-xs text-base-content/60">
              Only approved ratings affect a Booster&apos;s public rating.
            </p>
          </div>

          {data.ratings.length === 0 ? (
            <div className="py-12 text-center text-xs text-base-content/60">
              No ratings are waiting for moderation.
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {data.ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">{rating.boosterName}</span>
                      <span className="flex items-center gap-0.5 text-warning">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`w-3.5 h-3.5 ${
                              index < rating.score ? "fill-current" : "opacity-30"
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    <div className="text-[11px] text-base-content/60">
                      {rating.jobTitle} · by {rating.reviewerName} ·{" "}
                      {formatDate(rating.createdAt)}
                    </div>
                    {rating.comment && (
                      <p className="text-xs text-base-content/70 mt-1">
                        {rating.comment}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        run(
                          () =>
                            moderateRatingAction({
                              ratingId: rating.id,
                              decision: "APPROVED",
                            }),
                          "Rating approved."
                        )
                      }
                      disabled={isPending}
                      className="btn btn-xs btn-primary rounded-lg font-bold"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        run(
                          () =>
                            moderateRatingAction({
                              ratingId: rating.id,
                              decision: "REJECTED",
                            }),
                          "Rating rejected."
                        )
                      }
                      disabled={isPending}
                      className="btn btn-xs btn-ghost text-error rounded-lg font-bold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "DISPUTES" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold">Open disputes</h2>
            <p className="text-xs text-base-content/60">
              Review the reason and evidence, then record a resolution.
            </p>
          </div>

          {data.disputes.length === 0 ? (
            <div className="py-12 text-center text-xs text-base-content/60">
              No open disputes.
            </div>
          ) : (
            <div className="space-y-3">
              {data.disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="p-4 rounded-2xl border border-base-200 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-xs badge-error badge-soft font-bold">
                      {dispute.status}
                    </span>
                    <span className="text-sm font-black">
                      {dispute.jobTitle || dispute.campaignName || "Dispute"}
                    </span>
                    <span className="text-[10px] text-base-content/50">
                      Opened by {dispute.openedByName} ·{" "}
                      {formatDate(dispute.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-base-content/70">{dispute.reason}</p>
                  {dispute.againstBoosterName && (
                    <div className="text-[10px] text-base-content/50">
                      Against: {dispute.againstBoosterName}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        run(
                          () =>
                            resolveDisputeAction({
                              disputeId: dispute.id,
                              status: "UNDER_REVIEW",
                            }),
                          "Dispute moved under review."
                        )
                      }
                      disabled={isPending}
                      className="btn btn-xs btn-ghost border border-base-300 rounded-lg font-bold"
                    >
                      Under review
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const resolution = window.prompt("Describe the resolution:");
                        if (!resolution) return;
                        run(
                          () =>
                            resolveDisputeAction({
                              disputeId: dispute.id,
                              status: "RESOLVED",
                              resolution,
                            }),
                          "Dispute resolved."
                        );
                      }}
                      disabled={isPending}
                      className="btn btn-xs btn-primary rounded-lg font-bold"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        run(
                          () =>
                            resolveDisputeAction({
                              disputeId: dispute.id,
                              status: "CLOSED",
                            }),
                          "Dispute closed."
                        )
                      }
                      disabled={isPending}
                      className="btn btn-xs btn-ghost rounded-lg font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-3 rounded-2xl bg-base-200/50 text-[11px] text-base-content/60 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-warning shrink-0" />
        <span>
          Verification documents are private. Only authorised Advers trust and
          finance staff should access them. All decisions are written to the audit
          log.
        </span>
      </div>
    </div>
  );
}
