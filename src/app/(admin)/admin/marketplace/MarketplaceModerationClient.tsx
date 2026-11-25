"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Flag,
  Loader2,
  MessageSquare,
  Star,
  XCircle,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import type { AdminMarketplaceData } from "@/server/data/marketplace-admin";
import {
  bulkModerateBoosterCommentsAction,
  bulkModerateBoosterReviewsAction,
  moderateBoosterCommentAction,
  moderateBoosterReviewAction,
  resolveMarketplaceReportAction,
  updateBoosterRankingAction,
} from "@/server/actions/marketplace-admin";

type Tab = "COMMENTS" | "REVIEWS" | "REPORTS" | "RANKING";
type ActionResult = { success: true } | { success: false; error: string };

export default function MarketplaceModerationClient({
  data,
}: {
  data: AdminMarketplaceData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("COMMENTS");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [boosterRows, setBoosterRows] = useState(data.boosters);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);

  const toggleSelection = (
    current: string[],
    setter: (value: string[]) => void,
    id: string
  ) => {
    setter(
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

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

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: "COMMENTS", label: "Comments", count: data.pendingComments.length },
    { key: "REVIEWS", label: "Reviews", count: data.pendingReviews.length },
    { key: "REPORTS", label: "Reports", count: data.reports.length },
    { key: "RANKING", label: "Ranking", count: data.boosters.length },
  ];

  const updateBoosterRow = (
    id: string,
    patch: Partial<(typeof boosterRows)[number]>
  ) => {
    setBoosterRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-base-200 pb-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-primary">
          AdBooster marketplace
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Marketplace Moderation
        </h1>
        <p className="mt-0.5 text-xs text-base-content/70 sm:text-sm">
          Review comments and verified reviews, and resolve abuse reports.
        </p>
      </div>

      {error && (
        <div className="alert alert-error text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="alert alert-success text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Pending comments", value: data.totals.pendingComments, icon: <MessageSquare className="h-4 w-4" /> },
          { label: "Pending reviews", value: data.totals.pendingReviews, icon: <Star className="h-4 w-4" /> },
          { label: "Open reports", value: data.totals.openReports, icon: <Flag className="h-4 w-4" /> },
          { label: "Verified boosters", value: data.totals.verifiedBoosters, icon: <BadgeCheck className="h-4 w-4" /> },
          { label: "Sponsored", value: data.totals.sponsoredBoosters, icon: <Star className="h-4 w-4" /> },
        ].map((item) => (
          <div key={item.label} className="card border border-base-200 bg-base-100 p-4 shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-base-content/60">
              <span>{item.label}</span>
              <span className="text-primary">{item.icon}</span>
            </div>
            <div className="mt-2 text-2xl font-black">{item.value}</div>
          </div>
        ))}
      </div>

      <div role="tablist" className="tabs tabs-border">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            className={`tab gap-2 ${tab === item.key ? "tab-active" : ""}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            <span className="badge badge-ghost badge-xs">{item.count}</span>
          </button>
        ))}
      </div>

      {tab === "COMMENTS" && (
        <section className="card border border-base-200 bg-base-100 p-4 shadow-xs">
          {data.pendingComments.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-base-content/60">
                {selectedComments.length} selected
              </span>
              <button
                type="button"
                className="btn btn-success btn-xs"
                disabled={isPending || selectedComments.length === 0}
                onClick={() => {
                  const ids = selectedComments;
                  run(
                    () =>
                      bulkModerateBoosterCommentsAction({
                        commentIds: ids,
                        decision: "APPROVED",
                      }),
                    "Selected comments approved."
                  );
                  setSelectedComments([]);
                }}
              >
                Approve selected
              </button>
              <button
                type="button"
                className="btn btn-error btn-xs"
                disabled={isPending || selectedComments.length === 0}
                onClick={() => {
                  const ids = selectedComments;
                  run(
                    () =>
                      bulkModerateBoosterCommentsAction({
                        commentIds: ids,
                        decision: "REJECTED",
                      }),
                    "Selected comments rejected."
                  );
                  setSelectedComments([]);
                }}
              >
                Reject selected
              </button>
            </div>
          )}
          <div className="space-y-3">
            {data.pendingComments.length === 0 && (
              <p className="py-8 text-center text-xs text-base-content/60">
                No comments waiting for review.
              </p>
            )}
            {data.pendingComments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-base-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs mt-1"
                      checked={selectedComments.includes(comment.id)}
                      onChange={() =>
                        toggleSelection(
                          selectedComments,
                          setSelectedComments,
                          comment.id
                        )
                      }
                      aria-label={`Select comment by ${comment.userName}`}
                    />
                    <div>
                    <div className="text-xs font-bold">
                      {comment.userName}
                      <span className="ml-2 font-normal text-base-content/50">
                        on {comment.boosterName}
                      </span>
                    </div>
                    <div className="text-[10px] text-base-content/50">
                      {formatDate(comment.createdAt)} · {comment.userEmail}
                    </div>
                    <p className="mt-2 text-sm text-base-content/80">{comment.body}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="btn btn-success btn-xs"
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            moderateBoosterCommentAction({
                              commentId: comment.id,
                              decision: "APPROVED",
                            }),
                          "Comment approved."
                        )
                      }
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-error btn-xs"
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            moderateBoosterCommentAction({
                              commentId: comment.id,
                              decision: "REJECTED",
                            }),
                          "Comment rejected."
                        )
                      }
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "REVIEWS" && (
        <section className="card border border-base-200 bg-base-100 p-4 shadow-xs">
          {data.pendingReviews.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-base-content/60">
                {selectedReviews.length} selected
              </span>
              <button
                type="button"
                className="btn btn-success btn-xs"
                disabled={isPending || selectedReviews.length === 0}
                onClick={() => {
                  const ids = selectedReviews;
                  run(
                    () =>
                      bulkModerateBoosterReviewsAction({
                        reviewIds: ids,
                        decision: "APPROVED",
                      }),
                    "Selected reviews approved."
                  );
                  setSelectedReviews([]);
                }}
              >
                Approve selected
              </button>
              <button
                type="button"
                className="btn btn-error btn-xs"
                disabled={isPending || selectedReviews.length === 0}
                onClick={() => {
                  const ids = selectedReviews;
                  run(
                    () =>
                      bulkModerateBoosterReviewsAction({
                        reviewIds: ids,
                        decision: "REJECTED",
                      }),
                    "Selected reviews rejected."
                  );
                  setSelectedReviews([]);
                }}
              >
                Reject selected
              </button>
            </div>
          )}
          <div className="space-y-3">
            {data.pendingReviews.length === 0 && (
              <p className="py-8 text-center text-xs text-base-content/60">
                No reviews waiting for review.
              </p>
            )}
            {data.pendingReviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-base-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs mt-1"
                      checked={selectedReviews.includes(review.id)}
                      onChange={() =>
                        toggleSelection(
                          selectedReviews,
                          setSelectedReviews,
                          review.id
                        )
                      }
                      aria-label={`Select review by ${review.reviewerName}`}
                    />
                    <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      {review.reviewerName}
                      <span className="font-normal text-base-content/50">
                        on {review.boosterName}
                      </span>
                      <span className="flex items-center gap-1 text-warning">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {review.score}
                      </span>
                      {review.verified && (
                        <span className="badge badge-success badge-xs">Verified job</span>
                      )}
                    </div>
                    <div className="text-[10px] text-base-content/50">
                      {formatDate(review.createdAt)} · {review.reviewerEmail}
                      {review.jobTitle ? ` · ${review.jobTitle}` : ""}
                    </div>
                    {review.body && (
                      <p className="mt-2 text-sm text-base-content/80">{review.body}</p>
                    )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="btn btn-success btn-xs"
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            moderateBoosterReviewAction({
                              reviewId: review.id,
                              decision: "APPROVED",
                            }),
                          "Review approved."
                        )
                      }
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-error btn-xs"
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            moderateBoosterReviewAction({
                              reviewId: review.id,
                              decision: "REJECTED",
                            }),
                          "Review rejected."
                        )
                      }
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "REPORTS" && (
        <section className="card border border-base-200 bg-base-100 p-4 shadow-xs">
          <div className="space-y-3">
            {data.reports.length === 0 && (
              <p className="py-8 text-center text-xs text-base-content/60">
                No open marketplace reports.
              </p>
            )}
            {data.reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-base-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="badge badge-warning badge-xs">
                        {report.targetType}
                      </span>
                      {report.boosterName ? `on ${report.boosterName}` : ""}
                      <span className="font-normal text-base-content/50">
                        by {report.reporterName}
                      </span>
                    </div>
                    <div className="text-[10px] text-base-content/50">
                      {formatDate(report.createdAt)} · target {report.targetId}
                    </div>
                    <p className="mt-2 text-sm text-base-content/80">{report.reason}</p>
                    {report.details && (
                      <p className="mt-1 text-[11px] text-base-content/60">
                        {report.details}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    {report.targetType !== "PROFILE" && (
                      <button
                        type="button"
                        className="btn btn-error btn-xs"
                        disabled={isPending}
                        onClick={() =>
                          run(
                            () =>
                              resolveMarketplaceReportAction({
                                reportId: report.id,
                                decision: "RESOLVED",
                                removeContent: true,
                                notes: "Content removed by moderation.",
                              }),
                            "Report resolved and content removed."
                          )
                        }
                      >
                        Remove content
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-success btn-xs"
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            resolveMarketplaceReportAction({
                              reportId: report.id,
                              decision: "RESOLVED",
                              notes: "Reviewed; no content action required.",
                            }),
                          "Report resolved."
                        )
                      }
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            resolveMarketplaceReportAction({
                              reportId: report.id,
                              decision: "DISMISSED",
                              notes: "No policy violation found.",
                            }),
                          "Report dismissed."
                        )
                      }
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "RANKING" && (
        <section className="card border border-base-200 bg-base-100 p-4 shadow-xs">
          <p className="text-[11px] text-base-content/60">
            Manual boosts are clamped to ±20 points and applied after the
            quality score. Sponsored profiles stay visibly labelled as sponsored.
          </p>
          <div className="mt-3 space-y-2">
            {boosterRows.map((row) => (
              <div
                key={row.id}
                className="grid gap-2 rounded-2xl border border-base-200 p-3 lg:grid-cols-[1fr_120px_120px_1fr_auto] lg:items-end"
              >
                <div>
                  <div className="text-xs font-bold">{row.displayName}</div>
                  <div className="text-[10px] text-base-content/50">
                    @{row.handle ?? row.id} · {row.verificationStatus}
                  </div>
                </div>
                <label className="form-control">
                  <span className="label-text text-[10px]">Boost</span>
                  <input
                    type="number"
                    min="-20"
                    max="20"
                    className="input input-bordered input-xs"
                    value={row.rankingBoost}
                    onChange={(event) =>
                      updateBoosterRow(row.id, {
                        rankingBoost: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs"
                    checked={row.sponsored}
                    onChange={(event) =>
                      updateBoosterRow(row.id, { sponsored: event.target.checked })
                    }
                  />
                  Sponsored
                </label>
                <label className="form-control">
                  <span className="label-text text-[10px]">Internal note</span>
                  <input
                    className="input input-bordered input-xs"
                    value={row.rankingNote ?? ""}
                    onChange={(event) =>
                      updateBoosterRow(row.id, { rankingNote: event.target.value })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-primary btn-xs"
                  disabled={isPending}
                  onClick={() =>
                    run(
                      () =>
                        updateBoosterRankingAction({
                          boosterId: row.id,
                          rankingBoost: row.rankingBoost,
                          sponsored: row.sponsored,
                          rankingNote: row.rankingNote ?? undefined,
                        }),
                      "Ranking updated."
                    )
                  }
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Save
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
