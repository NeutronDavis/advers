"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dispatchNotificationSafe } from "@/lib/notifications";
import { getSession } from "@/lib/session";
import { getPaymentProvider } from "@/server/payments";
import {
  processProviderEvent,
  reverseWithdrawalById,
  settlePayout,
} from "@/server/payments/processing";

type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? {} : T))
  | { success: false; error: string };

async function staffSession() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "ADMIN" && session.role !== "STAFF") return null;
  return session;
}

export async function retryProviderEventAction(
  eventId: string
): Promise<ActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const stored = await prisma.providerEvent.findUnique({ where: { id: eventId } });
  if (!stored) return { success: false, error: "Provider event not found." };

  try {
    const provider = getPaymentProvider(stored.provider);
    const event = provider.parseWebhook(stored.payloadJson);
    const result = await processProviderEvent(event);
    await prisma.providerEvent.update({
      where: { id: stored.id },
      data: {
        status: result.ignored ? "IGNORED" : "PROCESSED",
        processedAt: new Date(),
        lastAttemptAt: new Date(),
        attempts: { increment: 1 },
        error: null,
      },
    });
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        action: "PROVIDER_EVENT_RETRIED",
        description: `${session.name} retried provider event ${stored.eventId}.`,
        metadata: JSON.stringify({ providerEventId: stored.id, result }),
      },
    });
    revalidatePath("/admin/reconciliation");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Retry failed.";
    await prisma.providerEvent.update({
      where: { id: stored.id },
      data: {
        status: "FAILED",
        lastAttemptAt: new Date(),
        attempts: { increment: 1 },
        error: message,
      },
    });
    revalidatePath("/admin/reconciliation");
    return { success: false, error: message };
  }
}

export async function ignoreProviderEventAction(
  eventId: string
): Promise<ActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const stored = await prisma.providerEvent.findUnique({ where: { id: eventId } });
  if (!stored) return { success: false, error: "Provider event not found." };
  if (stored.status === "PROCESSED") {
    return { success: false, error: "Processed events cannot be ignored." };
  }

  await prisma.providerEvent.update({
    where: { id: stored.id },
    data: { status: "IGNORED", processedAt: new Date(), attempts: { increment: 1 } },
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: "PROVIDER_EVENT_IGNORED",
      description: `${session.name} ignored provider event ${stored.eventId}.`,
      metadata: JSON.stringify({ providerEventId: stored.id }),
    },
  });
  revalidatePath("/admin/reconciliation");
  return { success: true };
}

export async function resolveAdvertiserWithdrawalAction(input: {
  withdrawalId: string;
  decision: "PAID" | "FAILED";
  notes?: string;
}): Promise<ActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const withdrawal = await prisma.advertiserWithdrawal.findUnique({
    where: { id: input.withdrawalId },
  });
  if (!withdrawal) return { success: false, error: "Withdrawal not found." };
  if (withdrawal.status === "PAID" || withdrawal.status === "FAILED") {
    return { success: false, error: "This withdrawal is already final." };
  }

  if (input.decision === "PAID") {
    if (!withdrawal.providerReference) {
      return {
        success: false,
        error: "No provider reference. Mark it failed to return the funds instead.",
      };
    }
    await settlePayout({
      eventId: `admin-paid:${withdrawal.id}`,
      type: "payout.paid",
      data: { providerReference: withdrawal.providerReference },
    });
  } else {
    const reversed = await reverseWithdrawalById(
      withdrawal.id,
      input.notes?.trim() || "Resolved by finance."
    );
    if (!reversed) {
      return { success: false, error: "Could not reverse this withdrawal." };
    }
  }

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: `ADVERTISER_WITHDRAWAL_${input.decision}_BY_FINANCE`,
      description: `${session.name} marked withdrawal ${withdrawal.id} as ${input.decision}.`,
      metadata: JSON.stringify({ withdrawalId: withdrawal.id, notes: input.notes ?? null }),
    },
  });
  revalidatePath("/admin/reconciliation");
  revalidatePath("/portal/wallet");
  return { success: true };
}

export async function setWalletStatusAction(input: {
  walletId: string;
  status: "ACTIVE" | "FROZEN" | "CLOSED";
  notes?: string;
}): Promise<ActionResult> {
  const session = await staffSession();
  if (!session) return { success: false, error: "Staff access required." };

  const wallet = await prisma.wallet.findUnique({
    where: { id: input.walletId },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!wallet) return { success: false, error: "Wallet not found." };

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { status: input.status },
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      action: `WALLET_${input.status}`,
      description: `${session.name} set ${wallet.user.name}'s ${wallet.currency} wallet to ${input.status}.`,
      metadata: JSON.stringify({
        walletId: wallet.id,
        notes: input.notes ?? null,
        previousStatus: wallet.status,
      }),
    },
  });
  await dispatchNotificationSafe({
    userId: wallet.user.id,
    event: `WALLET_${input.status}`,
    title:
      input.status === "ACTIVE"
        ? "Wallet reactivated"
        : input.status === "FROZEN"
          ? "Wallet frozen"
          : "Wallet closed",
    body:
      input.status === "ACTIVE"
        ? "Your wallet can be used again."
        : "Your wallet is restricted. Contact support for details.",
    link: "/portal/wallet",
  });

  revalidatePath("/admin/reconciliation");
  revalidatePath("/portal/wallet");
  return { success: true };
}
