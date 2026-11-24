import type { SessionContext, UserRole } from "./types/dto";

export type { SessionContext } from "./types/dto";

export type BoosterAccountStatus = "ACTIVE" | "PAUSED" | "SUSPENDED";

export interface SessionContextInput {
  role: UserRole;
  hasClient: boolean;
  boosterStatus: BoosterAccountStatus | null;
  requested?: SessionContext | null;
}

/**
 * Resolves which experience a session should operate in.
 *
 * Rules (ADR-0004):
 * - Staff/admin always operate in the ADMIN context.
 * - An explicit, valid BOOSTER request wins.
 * - Without an explicit request, a booster-only user (no client account) lands
 *   in BOOSTER; everyone else lands in USER.
 * - A suspended/paused Booster profile can never be the active context.
 */
export function resolveSessionContext(input: SessionContextInput): SessionContext {
  if (input.role === "ADMIN" || input.role === "STAFF") {
    return "ADMIN";
  }

  const boosterAvailable = input.boosterStatus === "ACTIVE";

  if (input.requested === "BOOSTER" && boosterAvailable) {
    return "BOOSTER";
  }
  if (input.requested === "USER") {
    return "USER";
  }
  if (!input.hasClient && boosterAvailable) {
    return "BOOSTER";
  }
  return "USER";
}

/** Whether a switch action is permitted for the current account. */
export function canSwitchTo(
  target: Exclude<SessionContext, "ADMIN">,
  input: SessionContextInput
): { allowed: true } | { allowed: false; reason: string } {
  if (input.role === "ADMIN" || input.role === "STAFF") {
    return {
      allowed: false,
      reason: "Admin sessions cannot switch into a customer workspace.",
    };
  }

  if (target === "BOOSTER") {
    if (input.boosterStatus !== "ACTIVE") {
      return {
        allowed: false,
        reason: "You do not have an active AdBooster account.",
      };
    }
    return { allowed: true };
  }

  if (!input.hasClient) {
    return {
      allowed: false,
      reason: "No advertiser account is linked to this login.",
    };
  }
  return { allowed: true };
}

export function landingPathForContext(context: SessionContext): string {
  if (context === "ADMIN") return "/admin";
  if (context === "BOOSTER") return "/booster";
  return "/portal/dashboard";
}
