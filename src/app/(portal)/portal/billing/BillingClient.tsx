"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Receipt,
  Users,
  Layers,
  Building2,
  CalendarClock,
} from "lucide-react";
import { PLAN_FEATURES } from "@/lib/plans";
import { formatDate, formatNaira } from "@/lib/format";
import {
  cancelSubscriptionAction,
  subscribeToPlanAction,
} from "@/server/actions/subscription";

export interface BillingPlan {
  key: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  profileLimit: number;
  workspaceLimit: number;
  teamSeatLimit: number;
  features: string[];
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface BillingEntitlements {
  hasPlan: boolean;
  planKey: string | null;
  planName: string;
  profileLimit: number;
  workspaceLimit: number;
  teamSeatLimit: number;
  subscription: {
    id: string;
    status: string;
    billingPeriod: string;
    price: number;
    startDate: string | Date;
    renewalDate: string | Date;
  } | null;
}

interface BillingUsage {
  businessProfiles: number;
  activeWorkspaces: number;
  teamMembers: number;
}

function UsageMeter({
  label,
  used,
  limit,
  icon,
}: {
  label: string;
  used: number;
  limit: number;
  icon: React.ReactNode;
}) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const atLimit = limit > 0 && used >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-[var(--portal-body)] flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className={atLimit ? "text-[var(--portal-gold-ink)]" : "text-[var(--portal-muted)]"}>
          {used} / {limit > 0 ? limit : "—"}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-[var(--portal-line-soft)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            atLimit ? "bg-[var(--portal-gold)]" : "bg-[var(--portal-success)]"
          }`}
          style={{ width: `${limit > 0 ? Math.max(percent, 4) : 0}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingClient({
  plans,
  entitlements,
  usage,
  invoices,
  onboarding,
  isOwner,
}: {
  plans: BillingPlan[];
  entitlements: BillingEntitlements;
  usage: BillingUsage;
  invoices: BillingInvoice[];
  onboarding: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"MONTHLY" | "ANNUAL">(
    entitlements.subscription?.billingPeriod === "ANNUAL" ? "ANNUAL" : "MONTHLY"
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentPlanKey = entitlements.planKey;
  const currentBillingPeriod = entitlements.subscription?.billingPeriod;

  const choosePlan = (planKey: string) => {
    setError(null);
    setPendingPlan(planKey);
    startTransition(async () => {
      const result = await subscribeToPlanAction({ planKey, billingPeriod });
      if (!result.success) {
        setError(result.error);
        setPendingPlan(null);
        return;
      }
      router.push(result.redirectTo);
      router.refresh();
    });
  };

  const cancelPlan = () => {
    if (!window.confirm("Cancel your current subscription? Existing data is kept.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await cancelSubscriptionAction();
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Marketing Access Plan
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Billing &amp; Subscription
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Your plan controls profiles, active campaign workspaces, team seats and
            reporting tools. Media placements and services are billed separately.
          </p>
        </div>
        <div className="badge badge-lg bg-[var(--portal-gold-soft-2)] border-[var(--portal-gold-border)] text-[var(--portal-gold-ink)] font-bold">
          <CreditCard className="w-3.5 h-3.5 mr-1" />
          {entitlements.hasPlan ? entitlements.planName : "No active plan"}
        </div>
      </div>

      {onboarding && (
        <div className="alert bg-[var(--portal-gold-soft)] border-[var(--portal-gold-border)] text-[var(--portal-body)] rounded-2xl text-xs">
          <Sparkles className="w-4 h-4 text-[var(--portal-gold-ink)]" />
          <span>
            Welcome to Advers. Choose a plan to unlock your business profile and
            campaign workspace.
          </span>
        </div>
      )}

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Current plan & usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card bg-[var(--portal-obsidian)] text-white rounded-3xl p-6 shadow-xl lg:col-span-1 space-y-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--portal-gold)]">
              Current plan
            </div>
            <div className="text-2xl font-black tracking-tight mt-1">
              {entitlements.hasPlan ? entitlements.planName : "No active plan"}
            </div>
            {entitlements.subscription ? (
              <div className="text-[11px] text-[var(--portal-obsidian-muted-2)] mt-1">
                {entitlements.subscription.status.replace(/_/g, " ")} ·{" "}
                {entitlements.subscription.billingPeriod.toLowerCase()} ·{" "}
                {formatNaira(entitlements.subscription.price)}
              </div>
            ) : (
              <div className="text-[11px] text-[var(--portal-obsidian-muted-2)] mt-1">
                Choose a plan below to start creating campaigns.
              </div>
            )}
          </div>

          {entitlements.subscription && (
            <div className="p-3 rounded-2xl bg-[var(--portal-obsidian-2)] border border-[var(--portal-obsidian-line)] text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--portal-obsidian-muted)]">Renewal date</span>
                <span className="font-bold">
                  {formatDate(entitlements.subscription.renewalDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--portal-obsidian-muted)]">Started</span>
                <span className="font-bold">
                  {formatDate(entitlements.subscription.startDate)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-1">
            <UsageMeter
              label="Business profiles"
              used={usage.businessProfiles}
              limit={entitlements.profileLimit}
              icon={<Building2 className="w-3.5 h-3.5" />}
            />
            <UsageMeter
              label="Active workspaces"
              used={usage.activeWorkspaces}
              limit={entitlements.workspaceLimit}
              icon={<Layers className="w-3.5 h-3.5" />}
            />
            <UsageMeter
              label="Team seats"
              used={usage.teamMembers}
              limit={entitlements.teamSeatLimit}
              icon={<Users className="w-3.5 h-3.5" />}
            />
          </div>

          {entitlements.hasPlan && isOwner && (
            <button
              type="button"
              onClick={cancelPlan}
              disabled={isPending}
              className="btn btn-sm btn-ghost text-[var(--portal-obsidian-muted-2)] hover:text-white border-[var(--portal-obsidian-line)] rounded-xl text-[11px] font-bold w-full"
            >
              Cancel subscription
            </button>
          )}
        </div>

        {/* Plan cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--portal-ink)]">
                Choose the plan that fits your stage
              </h2>
              <p className="text-[11px] text-[var(--portal-muted)]">
                All plans can browse every advertising channel. Higher plans add
                capacity, control and support.
              </p>
            </div>
            <div className="join">
              <button
                type="button"
                onClick={() => setBillingPeriod("MONTHLY")}
                className={`btn btn-xs sm:btn-sm join-item rounded-none first:rounded-l-xl last:rounded-r-xl font-bold ${
                  billingPeriod === "MONTHLY"
                    ? "bg-[var(--portal-obsidian)] text-white border-[var(--portal-obsidian)]"
                    : "bg-[var(--portal-surface)] text-[var(--portal-muted)] border-[var(--portal-line)]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod("ANNUAL")}
                className={`btn btn-xs sm:btn-sm join-item rounded-none first:rounded-l-xl last:rounded-r-xl font-bold ${
                  billingPeriod === "ANNUAL"
                    ? "bg-[var(--portal-obsidian)] text-white border-[var(--portal-obsidian)]"
                    : "bg-[var(--portal-surface)] text-[var(--portal-muted)] border-[var(--portal-line)]"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = currentPlanKey === plan.key;
              const isBusinessPro = plan.key === "BUSINESS_PRO";
              const price =
                billingPeriod === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;
              const periodLabel = billingPeriod === "ANNUAL" ? "/year" : "/month";
              const actionLabel = !isOwner
                ? isCurrent
                  ? "Current plan"
                  : "Owner only"
                : isCurrent
                  ? currentBillingPeriod === billingPeriod
                    ? "Current plan"
                    : "Switch billing period"
                  : entitlements.hasPlan
                    ? "Switch plan"
                    : "Choose plan";

              return (
                <div
                  key={plan.key}
                  className={`card rounded-3xl p-5 border shadow-xs flex flex-col justify-between gap-4 ${
                    isCurrent
                      ? "bg-[var(--portal-gold-soft)] border-[var(--portal-gold)]"
                      : isBusinessPro
                        ? "bg-[var(--portal-surface)] border-[var(--portal-gold-border)]"
                        : "bg-[var(--portal-surface)] border-[var(--portal-line)]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-black text-[var(--portal-ink)]">
                          {plan.name}
                        </div>
                        <div className="text-[10px] text-[var(--portal-muted)] mt-0.5">
                          {plan.tagline}
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="badge badge-xs bg-[var(--portal-gold)] text-[var(--portal-obsidian)] border-none font-bold">
                          Current
                        </span>
                      ) : isBusinessPro ? (
                        <span className="badge badge-xs bg-[var(--portal-obsidian)] text-white border-none font-bold">
                          Pro
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <div className="text-2xl font-black text-[var(--portal-ink)] tracking-tight">
                        {formatNaira(price)}
                      </div>
                      <div className="text-[10px] text-[var(--portal-muted)]">
                        {periodLabel}
                        {billingPeriod === "ANNUAL" && (
                          <span className="ml-1 text-[var(--portal-success)] font-bold">
                            · annual saving
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="p-2 rounded-xl bg-[var(--portal-soft)]">
                        <div className="text-sm font-black text-[var(--portal-ink)]">
                          {plan.profileLimit}
                        </div>
                        <div className="text-[9px] text-[var(--portal-muted)] font-bold uppercase">
                          Profiles
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-[var(--portal-soft)]">
                        <div className="text-sm font-black text-[var(--portal-ink)]">
                          {plan.workspaceLimit}
                        </div>
                        <div className="text-[9px] text-[var(--portal-muted)] font-bold uppercase">
                          Workspaces
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-[var(--portal-soft)]">
                        <div className="text-sm font-black text-[var(--portal-ink)]">
                          {plan.teamSeatLimit}
                        </div>
                        <div className="text-[9px] text-[var(--portal-muted)] font-bold uppercase">
                          Team
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {plan.features.slice(0, 8).map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-1.5 text-[10px] text-[var(--portal-body)]"
                        >
                          <Check className="w-3 h-3 text-[var(--portal-success)] shrink-0 mt-0.5" />
                          <span>
                            {PLAN_FEATURES[
                              feature as keyof typeof PLAN_FEATURES
                            ] || feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => choosePlan(plan.key)}
                    disabled={
                      !isOwner ||
                      isPending ||
                      (isCurrent && currentBillingPeriod === billingPeriod)
                    }
                    className={`btn btn-sm rounded-xl text-xs font-bold w-full ${
                      isCurrent && currentBillingPeriod === billingPeriod
                        ? "btn-disabled bg-[var(--portal-line-soft)] text-[var(--portal-muted)] border-none"
                        : isBusinessPro
                          ? "bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none"
                          : "bg-[var(--portal-obsidian)] hover:bg-black text-white border-none"
                    }`}
                  >
                    {pendingPlan === plan.key && isPending ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>{actionLabel}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--portal-success)] shrink-0" />
          <div>
            <div className="text-xs font-bold text-[var(--portal-ink)]">
              Subscription is separate
            </div>
            <div className="text-[10px] text-[var(--portal-muted)]">
              Media placements, production, logistics and SMS delivery are paid
              separately from your plan.
            </div>
          </div>
        </div>
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-4 flex items-start gap-3">
          <CalendarClock className="w-5 h-5 text-[var(--portal-gold-ink)] shrink-0" />
          <div>
            <div className="text-xs font-bold text-[var(--portal-ink)]">
              Downgrades keep your data
            </div>
            <div className="text-[10px] text-[var(--portal-muted)]">
              Existing profiles and campaigns are never deleted. New activity is
              blocked until you are within the lower plan limits.
            </div>
          </div>
        </div>
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-4 flex items-start gap-3">
          <Receipt className="w-5 h-5 text-[var(--portal-muted)] shrink-0" />
          <div>
            <div className="text-xs font-bold text-[var(--portal-ink)]">
              Billing history
            </div>
            <div className="text-[10px] text-[var(--portal-muted)]">
              Subscription invoices appear below. Campaign invoices are kept
              separately.
            </div>
          </div>
        </div>
      </div>

      {/* Invoice history */}
      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--portal-line-soft)]">
          <div>
            <h3 className="text-base font-bold text-[var(--portal-ink)]">
              Subscription invoices
            </h3>
            <p className="text-[11px] text-[var(--portal-muted)]">
              Plan payments only. Media and service invoices are separate.
            </p>
          </div>
          <span className="badge badge-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
            {invoices.length} records
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--portal-muted)]">
            No subscription invoices yet. Choose a plan to create your first one.
          </div>
        ) : (
          <div className="divide-y divide-[var(--portal-line-soft)]">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--portal-ink)]">
                    {invoice.title}
                  </div>
                  <div className="text-[10px] text-[var(--portal-muted)] font-mono">
                    {invoice.invoiceNumber} ·{" "}
                    {formatDate(invoice.paidAt || invoice.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-[var(--portal-ink)]">
                    {formatNaira(invoice.amount)}
                  </div>
                  <span
                    className={`badge badge-xs font-bold ${
                      invoice.status === "PAID"
                        ? "badge-success badge-soft"
                        : "badge-warning badge-soft"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
