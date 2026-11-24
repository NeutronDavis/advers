import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { landingPathForContext } from "@/lib/session-context";
import { prisma } from "@/lib/prisma";
import type { AuthSessionUser, SessionContext } from "@/lib/types/dto";

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

/**
 * Authorizes the active experience for a route or server action.
 *
 * This is the deny-by-default guard described in ADR-0004. Prefer it over
 * checking `role` directly for any route that belongs to one experience.
 */
export async function requireContext(
  context: SessionContext
): Promise<AuthSessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");

  if (context === "ADMIN") {
    if (session.role !== "ADMIN" && session.role !== "STAFF") {
      redirect(landingPathForContext(session.context));
    }
    return session;
  }

  if (session.context !== context) {
    redirect(landingPathForContext(session.context));
  }

  if (context === "BOOSTER" && !session.boosterProfileId) {
    redirect("/booster/profile/edit");
  }

  if (context === "USER" && !session.clientId) {
    redirect("/portal/billing");
  }

  return session;
}

export async function requireBooster(): Promise<AuthSessionUser> {
  return requireContext("BOOSTER");
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
  id: string;
  role: AuthSessionUser["role"];
  clientId: string | null;
  profileCompleteAt: Date | null;
}): Promise<string> {
  if (user.role === "ADMIN" || user.role === "STAFF") return "/admin";

  if (!user.clientId) {
    const boosterProfile = await prisma.boosterProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    return boosterProfile ? "/booster" : "/portal/billing";
  }

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
