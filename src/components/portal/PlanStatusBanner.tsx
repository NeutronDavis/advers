"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, Sparkles, ArrowRight } from "lucide-react";

interface BannerEntitlements {
  hasPlan: boolean;
  planName: string;
  profileLimit: number;
  workspaceLimit: number;
}

interface BannerUsage {
  businessProfiles: number;
  activeWorkspaces: number;
}

export default function PlanStatusBanner({
  entitlements,
  usage,
}: {
  entitlements: BannerEntitlements;
  usage: BannerUsage;
}) {
  const pathname = usePathname();
  if (pathname === "/portal/billing") return null;

  if (!entitlements.hasPlan) {
    return (
      <div className="mb-4 alert bg-[var(--portal-gold-soft)] border-[var(--portal-gold-border)] text-[var(--portal-body)] rounded-2xl text-xs">
        <Sparkles className="w-4 h-4 text-[var(--portal-gold-ink)]" />
        <span>
          You do not have an active Marketing Access Plan. Choose a plan to
          create campaigns and business profiles.
        </span>
        <Link
          href="/portal/billing"
          className="btn btn-xs bg-[var(--portal-obsidian)] text-white border-none rounded-lg font-bold ml-auto gap-1"
        >
          <span>Choose plan</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  const workspaceAtLimit =
    entitlements.workspaceLimit > 0 &&
    usage.activeWorkspaces >= entitlements.workspaceLimit;
  const profileAtLimit =
    entitlements.profileLimit > 0 &&
    usage.businessProfiles >= entitlements.profileLimit;

  if (!workspaceAtLimit && !profileAtLimit) return null;

  return (
    <div className="mb-4 alert bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-2xl text-xs">
      <AlertCircle className="w-4 h-4 text-[var(--portal-gold-ink)]" />
      <span>
        You have reached a {entitlements.planName} limit
        {workspaceAtLimit ? " for active campaign workspaces" : " for business profiles"}.
        Complete or archive an existing item, or upgrade for more capacity.
      </span>
      <Link
        href="/portal/billing"
        className="btn btn-xs bg-[var(--portal-gold)] text-[var(--portal-obsidian)] border-none rounded-lg font-bold ml-auto"
      >
        Upgrade
      </Link>
    </div>
  );
}
