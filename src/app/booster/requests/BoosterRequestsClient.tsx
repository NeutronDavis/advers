"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, MessageSquare, XCircle } from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import type { EngagementRequestView } from "@/server/data/booster-engagement";
import {
  convertEngagementRequestToJobAction,
  markBoosterEngagementRequestsViewedAction,
  respondBoosterEngagementRequestAction,
} from "@/server/actions/booster-engagement";

export default function BoosterRequestsClient({
  requests,
}: {
  requests: EngagementRequestView[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noteById, setNoteById] = useState<Record<string, string>>({});

  useEffect(() => {
    startTransition(async () => {
      await markBoosterEngagementRequestsViewedAction();
    });
  }, []);

  const respond = (requestId: string, decision: "ACCEPTED" | "DECLINED") => {
    setError(null);
    startTransition(async () => {
      const result = await respondBoosterEngagementRequestAction({
        requestId,
        decision,
        note: noteById[requestId] || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const convert = (requestId: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await convertEngagementRequestToJobAction(requestId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice("Draft Booster job created.");
      router.push(`/booster/jobs/${result.jobId}`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-base-200 pb-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-primary">
          Direct engagements
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Request inbox
        </h1>
        <p className="mt-0.5 text-xs text-base-content/70 sm:text-sm">
          Advertisers who contacted you directly from your marketplace profile.
        </p>
      </div>

      {error && <div className="alert alert-error text-xs">{error}</div>}
      {notice && <div className="alert alert-success text-xs">{notice}</div>}

      {requests.length === 0 ? (
        <div className="card border border-dashed border-base-300 bg-base-100 p-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 text-base font-bold">No direct requests yet</h2>
          <p className="mt-1 text-xs text-base-content/60">
            Complete your marketplace profile to start receiving requests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const final = ["ACCEPTED", "DECLINED", "CONVERTED", "CANCELLED"].includes(
              request.status
            );
            return (
              <div key={request.id} className="card border border-base-200 bg-base-100 p-5 shadow-xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold">{request.title}</h2>
                      <span
                        className={
                          request.status === "ACCEPTED"
                            ? "badge badge-success badge-sm"
                            : request.status === "DECLINED"
                              ? "badge badge-error badge-sm"
                              : "badge badge-warning badge-sm"
                        }
                      >
                        {request.status}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-base-content/60">
                      {request.requesterName} · {request.requesterEmail} ·{" "}
                      {formatDate(request.createdAt)}
                    </div>
                    <p className="mt-2 whitespace-pre-line text-xs text-base-content/80">
                      {request.brief}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-base-content/60">
                      {request.serviceTitle && <span>Service: {request.serviceTitle}</span>}
                      {request.packageName && <span>Package: {request.packageName}</span>}
                      {request.budget && <span>Budget: {formatNaira(request.budget)}</span>}
                      {request.timeline && <span>Timeline: {request.timeline}</span>}
                    </div>
                  </div>
                  {!final && (
                    <div className="w-full shrink-0 space-y-2 sm:w-64">
                      <textarea
                        className="textarea textarea-bordered text-xs"
                        rows={2}
                        placeholder="Optional reply note"
                        value={noteById[request.id] ?? ""}
                        onChange={(event) =>
                          setNoteById((current) => ({
                            ...current,
                            [request.id]: event.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-success btn-xs flex-1"
                          onClick={() => respond(request.id, "ACCEPTED")}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Accept
                        </button>
                        <button
                          type="button"
                          className="btn btn-error btn-xs flex-1"
                          onClick={() => respond(request.id, "DECLINED")}
                          disabled={isPending}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {request.responseNote && (
                  <div className="mt-3 rounded-xl bg-base-200 p-3 text-[11px]">
                    <span className="font-bold">Your response:</span>{" "}
                    {request.responseNote}
                  </div>
                )}
                {request.status === "ACCEPTED" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={() => convert(request.id)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5" />
                      )}
                      Convert to Booster job
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
