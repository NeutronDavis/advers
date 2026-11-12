"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import { verifyInfluencerProfileAction } from "@/server/actions/influencers";

interface AdminInfluencerProfile {
  id: string;
  displayName: string;
  handle: string;
  niche: string;
  platform: string;
  followers: number;
  rateCard: number | null;
  verified: boolean;
  status: string;
}

interface AdminInfluencerRequest {
  id: string;
  influencerName: string;
  influencerHandle: string;
  clientName: string;
  campaignName: string | null;
  campaignNumber: string | null;
  brief: string;
  budget: number;
  status: string;
  createdAt: string;
}

export default function AdminInfluencersClient({
  profiles,
  requests,
}: {
  profiles: AdminInfluencerProfile[];
  requests: AdminInfluencerRequest[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"PROFILES" | "REQUESTS">("PROFILES");
  const [search, setSearch] = useState("");

  const filteredProfiles = profiles.filter((profile) => {
    const query = search.toLowerCase().trim();
    return (
      !query ||
      profile.displayName.toLowerCase().includes(query) ||
      profile.handle.toLowerCase().includes(query) ||
      profile.niche.toLowerCase().includes(query)
    );
  });

  const verify = (id: string, verified: boolean) => {
    startTransition(async () => {
      await verifyInfluencerProfileAction(id, verified);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Creator marketplace administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Influencer Hub
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Review creator profiles and collaboration requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("PROFILES")}
            className={`btn btn-sm rounded-xl text-xs font-bold ${
              tab === "PROFILES" ? "btn-primary" : "btn-ghost border border-base-300"
            }`}
          >
            Profiles
            <span className="badge badge-xs">{profiles.length}</span>
          </button>
          <button
            onClick={() => setTab("REQUESTS")}
            className={`btn btn-sm rounded-xl text-xs font-bold ${
              tab === "REQUESTS" ? "btn-primary" : "btn-ghost border border-base-300"
            }`}
          >
            Requests
            <span className="badge badge-xs">{requests.length}</span>
          </button>
        </div>
      </div>

      {tab === "PROFILES" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Creator profiles</h2>
              <p className="text-xs text-base-content/60">
                Verify creators before they appear as verified in the Hub.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search creators..."
                className="input input-bordered input-sm w-full pl-9 text-xs rounded-xl bg-base-200/50"
              />
              <Search className="w-3.5 h-3.5 text-base-content/40 absolute left-3 top-3" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
                  <th>Creator</th>
                  <th>Niche / platform</th>
                  <th>Followers</th>
                  <th>Rate card</th>
                  <th>Verification</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 text-xs">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-base-200/50">
                    <td>
                      <div className="font-black text-base-content">
                        {profile.displayName}
                      </div>
                      <div className="text-[10px] text-base-content/50">
                        {profile.handle}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold">{profile.niche}</div>
                      <div className="text-[10px] text-base-content/60">
                        {profile.platform}
                      </div>
                    </td>
                    <td className="font-mono">
                      {profile.followers.toLocaleString("en-NG")}
                    </td>
                    <td className="font-mono">
                      {profile.rateCard ? formatNaira(profile.rateCard) : "Quote"}
                    </td>
                    <td>
                      <span
                        className={`badge badge-xs font-bold ${
                          profile.verified
                            ? "badge-success badge-soft"
                            : "badge-warning badge-soft"
                        }`}
                      >
                        {profile.verified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => verify(profile.id, !profile.verified)}
                        disabled={isPending}
                        className={`btn btn-xs rounded-lg font-bold gap-1 ${
                          profile.verified ? "btn-ghost text-error" : "btn-primary"
                        }`}
                      >
                        {profile.verified ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <BadgeCheck className="w-3.5 h-3.5" />
                        )}
                        {profile.verified ? "Unverify" : "Verify"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "REQUESTS" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold">Collaboration requests</h2>
            <p className="text-xs text-base-content/60">
              Requests sent by advertisers to creators.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-base-content/60">
              No collaboration requests yet.
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {requests.map((request) => (
                <div key={request.id} className="py-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black">
                      {request.influencerName}
                    </span>
                    <span className="text-[10px] text-base-content/50">
                      {request.influencerHandle}
                    </span>
                    <span
                      className={`badge badge-xs font-bold ${
                        request.status === "ACCEPTED"
                          ? "badge-success badge-soft"
                          : request.status === "REJECTED"
                            ? "badge-error badge-soft"
                            : "badge-warning badge-soft"
                      }`}
                    >
                      {request.status}
                    </span>
                    <span className="text-[10px] text-base-content/50">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-base-content/70">
                    From <span className="font-bold">{request.clientName}</span>
                    {request.campaignName
                      ? ` · ${request.campaignNumber} · ${request.campaignName}`
                      : ""}
                  </div>
                  <p className="text-xs text-base-content/70">{request.brief}</p>
                  <div className="font-mono text-xs font-bold">
                    {formatNaira(request.budget)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
