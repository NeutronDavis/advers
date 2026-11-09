"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const SubscribeSchema = z.object({
  planKey: z.string().min(1),
  billingPeriod: z.enum(["MONTHLY", "ANNUAL"]),
});

export type SubscribeResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

function addBillingPeriod(date: Date, period: "MONTHLY" | "ANNUAL"): Date {
  const next = new Date(date);
  if (period === "ANNUAL") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export async function subscribeToPlanAction(input: {
  planKey: string;
  billingPeriod: "MONTHLY" | "ANNUAL";
}): Promise<SubscribeResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in to choose a plan." };
  if (!session.clientId) {
    return {
      success: false,
      error: "Complete your account setup before choosing a plan.",
    };
  }
  if (session.orgRole !== "OWNER" && session.role !== "ADMIN") {
    return {
      success: false,
      error: "Only the account owner can change the subscription plan.",
    };
  }

  const parsed = SubscribeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const plan = await prisma.plan.findFirst({
    where: { key: parsed.data.planKey, active: true },
  });
  if (!plan) return { success: false, error: "That plan is not available." };

  const now = new Date();
  const price =
    parsed.data.billingPeriod === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;
  const renewalDate = addBillingPeriod(now, parsed.data.billingPeriod);
  const reference = `SUB-PAY-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

  await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: {
        clientId: session.clientId!,
        status: { in: ["ACTIVE", "RENEWAL_DUE", "GRACE_PERIOD"] },
      },
      data: { status: "CANCELLED", cancelledAt: now },
    });

    await tx.subscription.create({
      data: {
        clientId: session.clientId!,
        planId: plan.id,
        billingPeriod: parsed.data.billingPeriod,
        status: "ACTIVE",
        price,
        startDate: now,
        renewalDate,
        paymentReference: reference,
      },
    });

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber: `SUB-${Date.now()}`,
        clientId: session.clientId!,
        userId: session.id,
        title: `${plan.name} — ${parsed.data.billingPeriod.toLowerCase()}`,
        amount: price,
        serviceType: "SUBSCRIPTION",
        status: "PAID",
        dueDate: now,
        paidAt: now,
      },
    });

    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: price,
        paymentMethod: "MOCK_CHECKOUT",
        reference,
        status: "SUCCESS",
      },
    });

    await tx.ledgerEntry.create({
      data: {
        type: "SUBSCRIPTION",
        status: "PAID",
        payerId: session.id,
        grossAmount: price,
        feeAmount: 0,
        netAmount: price,
        reference: `LEDGER-SUB-${invoice.id}`,
        metadataJson: JSON.stringify({
          planKey: plan.key,
          billingPeriod: parsed.data.billingPeriod,
        }),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "SUBSCRIPTION_ACTIVATED",
        description: `${session.name} activated ${plan.name} (${parsed.data.billingPeriod.toLowerCase()}).`,
        metadata: JSON.stringify({ planKey: plan.key, price }),
      },
    });
  });

  revalidatePath("/portal/billing");
  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/business-profiles");
  revalidatePath("/portal/campaigns");
  revalidatePath("/portal/team");
  revalidatePath("/admin/subscriptions");

  return {
    success: true,
    redirectTo: session.profileComplete ? "/portal/dashboard" : "/portal/welcome",
  };
}

export async function cancelSubscriptionAction(): Promise<SubscribeResult> {
  const session = await getSession();
  if (!session?.clientId) {
    return { success: false, error: "Please sign in to manage your subscription." };
  }
  if (session.orgRole !== "OWNER" && session.role !== "ADMIN") {
    return {
      success: false,
      error: "Only the account owner can cancel the subscription.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: {
        clientId: session.clientId!,
        status: { in: ["ACTIVE", "RENEWAL_DUE", "GRACE_PERIOD"] },
      },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "SUBSCRIPTION_CANCELLED",
        description: `${session.name} cancelled the active subscription.`,
      },
    });
  });

  revalidatePath("/portal/billing");
  revalidatePath("/portal/dashboard");
  revalidatePath("/admin/subscriptions");
  return { success: true, redirectTo: "/portal/billing" };
}
