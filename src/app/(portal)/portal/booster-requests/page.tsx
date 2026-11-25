import React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatDate, formatNaira } from "@/lib/format";
import { getAdvertiserEngagementRequests } from "@/server/data/booster-engagement";

export const dynamic = "force-dynamic";

function statusBadge(status: string): string {
  if (status === "ACCEPTED") return "badge badge-success badge-sm";
  if (status === "DECLINED") return "badge badge-error badge-sm";
  if (status === "REQUESTED" || status === "VIEWED") return "badge badge-warning badge-sm";
  return "badge badge-ghost badge-sm";
}

export default async function AdvertiserBoosterRequestsPage() {
  const session = await requireUser();
  const requests = await getAdvertiserEngagementRequests(session.id);

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--portal-line)] pb-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
          Direct engagements
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--portal-ink)] sm:text-3xl">
          Booster requests
        </h1>
        <p className="mt-0.5 text-xs text-[var(--portal-muted)] sm:text-sm">
          Requests you sent directly to AdBoosters from their marketplace profiles.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="card border border-dashed border-[var(--portal-line)] bg-[var(--portal-surface)] p-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-[var(--portal-gold-ink)]" />
          <h2 className="mt-3 text-base font-bold text-[var(--portal-ink)]">
            No direct requests yet
          </h2>
          <p className="mt-1 text-xs text-[var(--portal-muted)]">
            Browse the marketplace and request a Booster from their profile.
          </p>
          <Link href="/portal/adboosters" className="btn btn-primary btn-sm mt-4 rounded-xl">
            Browse AdBoosters
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold text-[var(--portal-ink)]">
                      {request.title}
                    </h2>
                    <span className={statusBadge(request.status)}>{request.status}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--portal-muted)]">
                    To{" "}
                    <Link
                      href={`/portal/adboosters/${request.boosterHandle ?? ""}`}
                      className="font-bold text-[var(--portal-gold-ink)] hover:underline"
                    >
                      {request.boosterName}
                    </Link>{" "}
                    · {formatDate(request.createdAt)}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-[var(--portal-body)]">
                    {request.brief}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--portal-muted)]">
                    {request.serviceTitle && <span>Service: {request.serviceTitle}</span>}
                    {request.packageName && <span>Package: {request.packageName}</span>}
                    {request.budget && <span>Budget: {formatNaira(request.budget)}</span>}
                    {request.timeline && <span>Timeline: {request.timeline}</span>}
                  </div>
                  {request.responseNote && (
                    <div className="mt-2 rounded-xl bg-[var(--portal-soft)] p-3 text-[11px] text-[var(--portal-body)]">
                      <span className="font-bold">Booster response:</span>{" "}
                      {request.responseNote}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
