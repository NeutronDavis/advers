import React from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEntitlements, getUsage } from "@/lib/entitlements";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import BillingClient, { type BillingPlan, type BillingInvoice } from "./BillingClient";

export const dynamic = "force-dynamic";

function parseFeatures(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;

  const [dbPlans, entitlements, usage, invoiceRecords] = await Promise.all([
    prisma.plan.findMany({
      where: { active: true },
      orderBy: { monthlyPrice: "asc" },
    }),
    getEntitlements(session.clientId),
    session.clientId
      ? getUsage(session.clientId)
      : Promise.resolve({ businessProfiles: 0, activeWorkspaces: 0, teamMembers: 0 }),
    session.clientId
      ? prisma.invoice.findMany({
          where: { clientId: session.clientId, serviceType: "SUBSCRIPTION" },
          orderBy: { createdAt: "desc" },
          take: 8,
        })
      : Promise.resolve([]),
  ]);

  const plans: BillingPlan[] =
    dbPlans.length > 0
      ? dbPlans.map((plan) => ({
          key: plan.key,
          name: plan.name,
          tagline: plan.tagline || "",
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          profileLimit: plan.profileLimit,
          workspaceLimit: plan.workspaceLimit,
          teamSeatLimit: plan.teamSeatLimit,
          features: parseFeatures(plan.featuresJson),
        }))
      : PLAN_DEFINITIONS.map((plan) => ({
          key: plan.key,
          name: plan.name,
          tagline: plan.tagline,
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          profileLimit: plan.profileLimit,
          workspaceLimit: plan.workspaceLimit,
          teamSeatLimit: plan.teamSeatLimit,
          features: [...plan.features],
        }));

  const invoices: BillingInvoice[] = invoiceRecords.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    title: invoice.title,
    amount: invoice.amount,
    status: invoice.status,
    paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
    createdAt: invoice.createdAt.toISOString(),
  }));

  return (
    <BillingClient
      plans={plans}
      entitlements={entitlements}
      usage={usage}
      invoices={invoices}
      onboarding={params.onboarding === "1"}
      isOwner={session.orgRole === "OWNER" || session.role === "ADMIN"}
    />
  );
}
