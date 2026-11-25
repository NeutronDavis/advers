"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dispatchNotificationSafe } from "@/lib/notifications";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { getSession } from "@/lib/session";
import {
  beginTwoFactorEnrolment,
  confirmTwoFactorEnrolment,
  consumeRecoveryCode,
  disableTwoFactor,
  getTwoFactorState,
  regenerateRecoveryCodes,
} from "@/server/security/two-factor";

type TwoFactorResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? {} : T))
  | { success: false; error: string };

async function requireSession() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

async function requireTwoFactorRateLimit(userId: string): Promise<string | null> {
  const result = await enforceRateLimit(`2fa:${userId}`, 5, 60_000);
  if (result.allowed) return null;
  return `Too many attempts. Try again in ${Math.ceil(result.retryAfterMs / 1000)}s.`;
}

export async function beginTwoFactorAction(): Promise<
  TwoFactorResult<{
    secret: string;
    otpauthUri: string;
    recoveryCodes: string[];
  }>
> {
  const session = await requireSession();
  if (!session) return { success: false, error: "Please sign in." };

  const limited = await requireTwoFactorRateLimit(session.id);
  if (limited) return { success: false, error: limited };

  try {
    const state = await getTwoFactorState(session.id);
    if (state.enabled) {
      return { success: false, error: "Two-factor authentication is already enabled." };
    }
    const enrolment = await beginTwoFactorEnrolment(session.id, session.email);
    revalidatePath("/portal/settings/security");
    return { success: true, ...enrolment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not start enrolment.",
    };
  }
}

export async function confirmTwoFactorAction(
  code: string
): Promise<TwoFactorResult> {
  const session = await requireSession();
  if (!session) return { success: false, error: "Please sign in." };

  const limited = await requireTwoFactorRateLimit(session.id);
  if (limited) return { success: false, error: limited };

  try {
    await confirmTwoFactorEnrolment(session.id, code);
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "TWO_FACTOR_ENABLED",
        description: `${session.name} enabled two-factor authentication.`,
      },
    });
    await dispatchNotificationSafe({
      userId: session.id,
      event: "TWO_FACTOR_ENABLED",
      title: "Two-factor authentication enabled",
      body: "Withdrawals now require your authenticator code.",
      link: "/portal/settings/security",
    });
    revalidatePath("/portal/settings/security");
    revalidatePath("/portal/wallet");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not confirm enrolment.",
    };
  }
}

export async function disableTwoFactorAction(
  code: string
): Promise<TwoFactorResult> {
  const session = await requireSession();
  if (!session) return { success: false, error: "Please sign in." };

  const limited = await requireTwoFactorRateLimit(session.id);
  if (limited) return { success: false, error: limited };

  try {
    await disableTwoFactor(session.id, code);
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "TWO_FACTOR_DISABLED",
        description: `${session.name} disabled two-factor authentication.`,
      },
    });
    await dispatchNotificationSafe({
      userId: session.id,
      event: "TWO_FACTOR_DISABLED",
      title: "Two-factor authentication disabled",
      body: "Withdrawals no longer require an authenticator code.",
      link: "/portal/settings/security",
    });
    revalidatePath("/portal/settings/security");
    revalidatePath("/portal/wallet");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not disable 2FA.",
    };
  }
}

/**
 * Lost-authenticator recovery. Consumes a one-time recovery code and disables
 * 2FA so the user can enrol a new device. The user must then set 2FA up again.
 */
export async function recoverTwoFactorAction(
  code: string
): Promise<TwoFactorResult> {
  const session = await requireSession();
  if (!session) return { success: false, error: "Please sign in." };

  const limited = await requireTwoFactorRateLimit(session.id);
  if (limited) return { success: false, error: limited };

  const consumed = await consumeRecoveryCode(session.id, code);
  if (!consumed) {
    return { success: false, error: "That recovery code is invalid or already used." };
  }

  await prisma.twoFactorSecret.update({
    where: { userId: session.id },
    data: { disabledAt: new Date(), confirmedAt: null },
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      clientId: session.clientId,
      action: "TWO_FACTOR_RECOVERY_CODE_USED",
      description: `${session.name} disabled 2FA with a recovery code.`,
    },
  });
  await dispatchNotificationSafe({
    userId: session.id,
    event: "TWO_FACTOR_RECOVERY_CODE_USED",
    title: "Recovery code used",
    body: "2FA was disabled with a recovery code. Enrol a new authenticator now.",
    link: "/portal/settings/security",
  });

  revalidatePath("/portal/settings/security");
  revalidatePath("/portal/wallet");
  return { success: true };
}

export async function regenerateRecoveryCodesAction(
  code: string
): Promise<TwoFactorResult<{ recoveryCodes: string[] }>> {
  const session = await requireSession();
  if (!session) return { success: false, error: "Please sign in." };

  const limited = await requireTwoFactorRateLimit(session.id);
  if (limited) return { success: false, error: limited };

  try {
    const recoveryCodes = await regenerateRecoveryCodes(session.id, code);
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "TWO_FACTOR_RECOVERY_CODES_REGENERATED",
        description: `${session.name} regenerated two-factor recovery codes.`,
      },
    });
    await dispatchNotificationSafe({
      userId: session.id,
      event: "TWO_FACTOR_RECOVERY_CODES_REGENERATED",
      title: "Recovery codes regenerated",
      body: "Your previous recovery codes no longer work.",
      link: "/portal/settings/security",
    });
    revalidatePath("/portal/settings/security");
    return { success: true, recoveryCodes };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not regenerate codes.",
    };
  }
}
