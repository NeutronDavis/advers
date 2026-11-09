"use server";

import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  landingPathForAuthenticatedUser,
  verifyPassword,
} from "@/lib/auth";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import {
  AcceptInviteSchema,
  LoginSchema,
  SignupSchema,
} from "@/lib/validations/auth";

export type AuthState = { error?: string } | undefined;

type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: "CLIENT" | "STAFF" | "ADMIN";
  clientId: string | null;
  profileCompleteAt: Date | null;
};

async function authenticate(
  email: string,
  password: string
): Promise<{ user: AuthenticatedUser } | { error: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user?.passwordHash) {
    return { error: "No account found with that email address." };
  }

  if (user.status === "DEACTIVATED") {
    return { error: "This account has been deactivated. Contact support." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Incorrect password. Please try again." };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
      profileCompleteAt: user.profileCompleteAt,
    },
  };
}

async function recordLogin(user: AuthenticatedUser): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }),
    prisma.activityLog.create({
      data: {
        userId: user.id,
        clientId: user.clientId,
        action: "LOGIN",
        description: `${user.name} signed in to the ${user.role.toLowerCase()} workspace.`,
      },
    }),
  ]);
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await authenticate(parsed.data.email, parsed.data.password);
  if ("error" in result) return { error: result.error };

  await recordLogin(result.user);
  await setSessionCookie(result.user.id);
  redirect(await landingPathForAuthenticatedUser(result.user));
}

/**
 * Used by the one-click demo buttons. Returns the destination so the client
 * can navigate after the HttpOnly cookie has been set.
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ success: true; redirectTo: string } | { success: false; error: string }> {
  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const result = await authenticate(parsed.data.email, parsed.data.password);
  if ("error" in result) return { success: false, error: result.error };

  await recordLogin(result.user);
  await setSessionCookie(result.user.id);

  return {
    success: true,
    redirectTo: await landingPathForAuthenticatedUser(result.user),
  };
}

export async function signupAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const termsValue = formData.get("terms");
  const parsed = SignupSchema.safeParse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    password: String(formData.get("password") || ""),
    terms: termsValue === "on" || termsValue === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Please sign in." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        name: parsed.data.name.trim(),
        notes: "Account created at signup. Complete the business profile next.",
      },
    });

    const created = await tx.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        phone: parsed.data.phone || null,
        passwordHash,
        role: "CLIENT",
        orgRole: "OWNER",
        status: "UNVERIFIED",
        clientId: client.id,
        source: "WEBSITE",
        termsAcceptedAt: new Date(),
        termsVersion: "1.0",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: created.id,
        clientId: client.id,
        action: "SIGNUP",
        description: `${created.name} created an Advers account and business record.`,
      },
    });

    return created;
  });

  await setSessionCookie(user.id);
  redirect("/portal/billing?onboarding=1");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

export async function acceptInviteAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const termsValue = formData.get("terms");
  const parsed = AcceptInviteSchema.safeParse({
    token: String(formData.get("token") || ""),
    name: String(formData.get("name") || ""),
    password: String(formData.get("password") || ""),
    phone: String(formData.get("phone") || ""),
    terms: termsValue === "on" || termsValue === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
    include: { client: true },
  });

  if (!invitation) {
    return { error: "This invitation link is invalid. Please request a new invite." };
  }
  if (invitation.acceptedAt) {
    return { error: "This invitation has already been used. Please sign in instead." };
  }
  if (invitation.expiresAt.getTime() < Date.now()) {
    return { error: "This invitation has expired. Please request a new invite." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const existing = await prisma.user.findUnique({ where: { email: invitation.email } });

  if (existing) {
    if (existing.clientId && existing.clientId !== invitation.clientId) {
      return { error: "This email already belongs to another Advers account." };
    }
    if (existing.clientId === invitation.clientId) {
      return { error: "This email is already on the team. Please sign in instead." };
    }

    const linked = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: existing.id },
        data: {
          clientId: invitation.clientId,
          orgRole: invitation.orgRole,
          passwordHash: existing.passwordHash ? undefined : passwordHash,
          profileCompleteAt: existing.profileCompleteAt ?? new Date(),
          termsAcceptedAt: new Date(),
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      await tx.activityLog.create({
        data: {
          userId: updatedUser.id,
          clientId: invitation.clientId,
          action: "INVITE_ACCEPTED",
          description: `${updatedUser.name} accepted an invitation to ${invitation.client.name}.`,
        },
      });

      return updatedUser;
    });

    await setSessionCookie(linked.id);
    redirect("/portal/dashboard");
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: parsed.data.name.trim(),
        email: invitation.email,
        phone: parsed.data.phone || null,
        passwordHash,
        role: "CLIENT",
        orgRole: invitation.orgRole,
        status: "ACTIVE",
        clientId: invitation.clientId,
        source: "INVITATION",
        profileCompleteAt: new Date(),
        termsAcceptedAt: new Date(),
        termsVersion: "1.0",
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    await tx.activityLog.create({
      data: {
        userId: created.id,
        clientId: invitation.clientId,
        action: "INVITE_ACCEPTED",
        description: `${created.name} accepted an invitation to ${invitation.client.name}.`,
      },
    });

    return created;
  });

  await setSessionCookie(user.id);
  redirect("/portal/dashboard");
}
