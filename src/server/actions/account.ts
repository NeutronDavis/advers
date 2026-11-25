"use server";

import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { dispatchNotificationSafe } from "@/lib/notifications";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/lib/session";
import { canSwitchTo, landingPathForContext } from "@/lib/session-context";
import { enforceRateLimit } from "@/server/security/rate-limit";

const THEME_COOKIE = "advers-theme";
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{2,29}$/;

const AccountSettingsSchema = z.object({
  name: z.string().min(2, "Full name is required."),
  phone: z.string().optional(),
  company: z.string().optional(),
  username: z.string().trim().toLowerCase().max(30).optional(),
  avatarUrl: z.string().trim().max(500).optional(),
});

export type AccountSettingsState =
  | { success?: boolean; error?: string }
  | undefined;

export async function updateAccountSettingsAction(
  _prevState: AccountSettingsState,
  formData: FormData
): Promise<AccountSettingsState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in to update your settings." };

  const parsed = AccountSettingsSchema.safeParse({
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    company: String(formData.get("company") || ""),
    username: String(formData.get("username") || ""),
    avatarUrl: String(formData.get("avatarUrl") || ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const username = parsed.data.username?.trim();
  if (username && !USERNAME_PATTERN.test(username)) {
    return {
      error:
        "Username must be 3–30 characters, start with a letter or number, and use only lowercase letters, numbers, underscores or hyphens.",
    };
  }
  if (username) {
    const taken = await prisma.user.findFirst({
      where: { username, NOT: { id: session.id } },
      select: { id: true },
    });
    if (taken) return { error: "That username is already taken." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.id },
      data: {
        name: parsed.data.name.trim(),
        phone: parsed.data.phone?.trim() || null,
        username: username || undefined,
        avatarUrl: parsed.data.avatarUrl?.trim() || null,
      },
    });

    const canEditCompany =
      session.role === "ADMIN" || session.orgRole === "OWNER";
    if (canEditCompany && session.clientId && parsed.data.company?.trim()) {
      await tx.client.update({
        where: { id: session.clientId },
        data: { name: parsed.data.company.trim() },
      });
    }

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "ACCOUNT_SETTINGS_UPDATED",
        description: `${parsed.data.name.trim()} updated account settings.`,
      },
    });
  });

  revalidatePath("/portal/settings");
  revalidatePath("/portal/dashboard");
  return { success: true };
}

export type SwitchAccountContextResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

/**
 * Switches the active experience between the advertiser account and the
 * AdBooster account attached to the same login.
 *
 * The target is re-verified against the database; a forged or stale cookie
 * claim can never grant access. See ADR-0004.
 */
export async function switchAccountContextAction(
  target: "USER" | "BOOSTER"
): Promise<SwitchAccountContextResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const booster =
    target === "BOOSTER"
      ? await prisma.boosterProfile.findUnique({
          where: { userId: session.id },
          select: { id: true, status: true },
        })
      : null;

  const decision = canSwitchTo(target, {
    role: session.role,
    hasClient: Boolean(session.clientId),
    boosterStatus: booster?.status ?? null,
  });
  if (!decision.allowed) {
    return { success: false, error: decision.reason };
  }

  await setSessionCookie(session.id, target, session.sessionVersion);

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      clientId: session.clientId,
      action: "ACCOUNT_CONTEXT_SWITCHED",
      description: `${session.name} switched to the ${target === "BOOSTER" ? "AdBooster" : "advertiser"} experience.`,
      metadata: JSON.stringify({ from: session.context, to: target }),
    },
  });

  revalidatePath("/", "layout");
  return { success: true, redirectTo: landingPathForContext(target) };
}

async function verifyCurrentPassword(userId: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

async function notifyAdmins(event: string, title: string, body: string, link: string) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await Promise.all(
    admins.map((admin) =>
      dispatchNotificationSafe({ userId: admin.id, event, title, body, link })
    )
  );
}

export type AccountActionResult =
  | { success: true; message?: string; verificationUrl?: string }
  | { success: false; error: string };

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<AccountActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const limited = await enforceRateLimit(`password:${session.id}`, 5, 60 * 60_000);
  if (!limited.allowed) {
    return { success: false, error: "Too many password attempts. Try again later." };
  }

  const newPassword = input.newPassword.trim();
  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }
  if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return {
      success: false,
      error: "New password must include at least one letter and one number.",
    };
  }
  if (newPassword === input.currentPassword) {
    return { success: false, error: "Choose a password different from the current one." };
  }

  const valid = await verifyCurrentPassword(session.id, input.currentPassword);
  if (!valid) {
    return { success: false, error: "Your current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const updated = await prisma.user.update({
    where: { id: session.id },
    data: {
      passwordHash,
      sessionVersion: { increment: 1 },
    },
    select: { sessionVersion: true },
  });

  // Keep the current device signed in while revoking older sessions.
  await setSessionCookie(session.id, session.context, updated.sessionVersion);

  await prisma.activityLog.create({
    data: {
      userId: session.id,
      clientId: session.clientId,
      action: "PASSWORD_CHANGED",
      description: `${session.name} changed their password.`,
    },
  });
  await dispatchNotificationSafe({
    userId: session.id,
    event: "PASSWORD_CHANGED",
    title: "Password changed",
    body: "Your ADVERS password was changed. Other sessions have been signed out.",
    link: "/portal/settings",
  });

  revalidatePath("/portal/settings");
  return { success: true, message: "Password updated. Other sessions were signed out." };
}

const EmailChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newEmail: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export async function requestEmailChangeAction(
  input: z.input<typeof EmailChangeSchema>
): Promise<AccountActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const limited = await enforceRateLimit(`email-change:${session.id}`, 3, 60 * 60_000);
  if (!limited.allowed) {
    return { success: false, error: "Too many email change requests. Try again later." };
  }

  const parsed = EmailChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  if (parsed.data.newEmail === session.email.toLowerCase()) {
    return { success: false, error: "That is already your current email address." };
  }

  const valid = await verifyCurrentPassword(session.id, parsed.data.currentPassword);
  if (!valid) {
    return { success: false, error: "Your current password is incorrect." };
  }

  const taken = await prisma.user.findUnique({
    where: { email: parsed.data.newEmail },
    select: { id: true },
  });
  if (taken) return { success: false, error: "That email is already in use." };

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  await prisma.$transaction([
    prisma.emailChangeRequest.deleteMany({
      where: { userId: session.id, usedAt: null },
    }),
    prisma.emailChangeRequest.create({
      data: {
        userId: session.id,
        newEmail: parsed.data.newEmail,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  const verificationUrl = `/portal/settings/email/confirm?token=${encodeURIComponent(token)}`;
  await dispatchNotificationSafe({
    userId: session.id,
    event: "EMAIL_CHANGE_REQUESTED",
    title: "Confirm your new email",
    body: `A request was made to change your email to ${parsed.data.newEmail}. Use the verification link to confirm.`,
    link: verificationUrl,
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      clientId: session.clientId,
      action: "EMAIL_CHANGE_REQUESTED",
      description: `${session.name} requested an email change.`,
      metadata: JSON.stringify({ newEmail: parsed.data.newEmail }),
    },
  });

  return {
    success: true,
    message:
      process.env.NODE_ENV === "production"
        ? "Verification link generated. Connect the email provider to deliver it."
        : "Verification link generated below.",
    verificationUrl:
      process.env.NODE_ENV === "production" ? undefined : verificationUrl,
  };
}

export async function confirmEmailChangeToken(
  token: string
): Promise<AccountActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in to confirm the change." };

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const request = await prisma.emailChangeRequest.findUnique({
    where: { tokenHash },
  });
  if (!request || request.userId !== session.id) {
    return { success: false, error: "This verification link is invalid." };
  }
  if (request.usedAt) {
    return { success: false, error: "This verification link has already been used." };
  }
  if (request.expiresAt.getTime() <= Date.now()) {
    return { success: false, error: "This verification link has expired." };
  }

  const taken = await prisma.user.findUnique({
    where: { email: request.newEmail },
    select: { id: true },
  });
  if (taken && taken.id !== session.id) {
    return { success: false, error: "That email is already in use." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.id },
      data: { email: request.newEmail, emailVerifiedAt: new Date() },
    }),
    prisma.emailChangeRequest.update({
      where: { id: request.id },
      data: { usedAt: new Date() },
    }),
    prisma.activityLog.create({
      data: {
        userId: session.id,
        clientId: session.clientId,
        action: "EMAIL_CHANGED",
        description: `${session.name} confirmed a new email address.`,
        metadata: JSON.stringify({ newEmail: request.newEmail }),
      },
    }),
  ]);

  revalidatePath("/portal/settings");
  return { success: true, message: "Email address updated." };
}

export async function updateThemePreferenceAction(
  preference: "LIGHT" | "DARK" | "SYSTEM"
): Promise<AccountActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  await prisma.user.update({
    where: { id: session.id },
    data: { themePreference: preference },
  });

  const store = await cookies();
  if (preference === "SYSTEM") {
    store.delete(THEME_COOKIE);
  } else {
    store.set(THEME_COOKIE, preference.toLowerCase(), {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  revalidatePath("/portal/settings");
  return { success: true };
}

export async function deactivateAccountAction(
  currentPassword: string
): Promise<AccountActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const valid = await verifyCurrentPassword(session.id, currentPassword);
  if (!valid) {
    return { success: false, error: "Your current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { status: "DEACTIVATED", sessionVersion: { increment: 1 } },
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      clientId: session.clientId,
      action: "ACCOUNT_DEACTIVATED",
      description: `${session.name} deactivated their account.`,
    },
  });
  await clearSessionCookie();
  return { success: true, message: "Account deactivated." };
}

export async function requestAccountDeletionAction(input: {
  currentPassword: string;
  reason?: string;
}): Promise<AccountActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const valid = await verifyCurrentPassword(session.id, input.currentPassword);
  if (!valid) {
    return { success: false, error: "Your current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: session.id },
    data: {
      status: "DEACTIVATED",
      deletionRequestedAt: new Date(),
      sessionVersion: { increment: 1 },
    },
  });
  await prisma.activityLog.create({
    data: {
      userId: session.id,
      clientId: session.clientId,
      action: "ACCOUNT_DELETION_REQUESTED",
      description: `${session.name} requested account deletion.`,
      metadata: input.reason ? JSON.stringify({ reason: input.reason }) : null,
    },
  });
  await notifyAdmins(
    "ACCOUNT_DELETION_REQUESTED",
    "Account deletion requested",
    `${session.name} (${session.email}) requested account deletion.`,
    "/admin/users"
  );
  await clearSessionCookie();
  return { success: true, message: "Account deletion requested." };
}
