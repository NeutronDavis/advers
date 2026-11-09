import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { AuthSessionUser } from "@/lib/types/dto";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * @deprecated Use `getSession()` from `@/lib/session` directly. Kept as a
 * compatibility wrapper while older screens are migrated.
 */
export async function getAuthSession(): Promise<AuthSessionUser | null> {
  return getSession();
}

export async function requireUser(): Promise<AuthSessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireStaff(): Promise<AuthSessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect("/portal/dashboard");
  }
  return session;
}

export async function requireAdmin(): Promise<AuthSessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") {
    redirect("/admin");
  }
  return session;
}

export async function requireClient(): Promise<AuthSessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export function landingPathForRole(
  role: AuthSessionUser["role"],
  profileComplete = true
): string {
  if (role === "ADMIN" || role === "STAFF") return "/admin";
  return profileComplete ? "/portal/dashboard" : "/portal/welcome";
}

/**
 * Client landing path is plan-aware: a client without an active subscription
 * is sent to billing before onboarding or the dashboard.
 */
export async function landingPathForAuthenticatedUser(user: {
  role: AuthSessionUser["role"];
  clientId: string | null;
  profileCompleteAt: Date | null;
}): Promise<string> {
  if (user.role === "ADMIN" || user.role === "STAFF") return "/admin";
  if (!user.clientId) return "/portal/billing";

  const subscription = await prisma.subscription.findFirst({
    where: {
      clientId: user.clientId,
      status: { in: ["ACTIVE", "RENEWAL_DUE", "GRACE_PERIOD"] },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (!subscription) return "/portal/billing";
  return user.profileCompleteAt ? "/portal/dashboard" : "/portal/welcome";
}
