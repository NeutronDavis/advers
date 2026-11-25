import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { resolveSessionContext } from "@/lib/session-context";
import type {
  AuthSessionUser,
  SessionContext,
  UserRole,
} from "@/lib/types/dto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session-constants";

export { SESSION_COOKIE, SESSION_MAX_AGE };

interface SessionPayload {
  sub: string;
  exp: number;
  /** Active experience. Optional so pre-existing cookies remain valid. */
  ctx?: SessionContext;
  /** Session revocation version. Optional for backwards compatibility. */
  ver?: number;
}

function sessionSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET (or SESSION_SECRET) must be set in production.");
  }
  return "advers-development-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(
  userId: string,
  maxAge = SESSION_MAX_AGE,
  ctx?: SessionContext,
  sessionVersion?: number
): string {
  const payload: SessionPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + maxAge,
    ...(ctx ? { ctx } : {}),
    ...(sessionVersion !== undefined ? { ver: sessionVersion } : {}),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as SessionPayload;
    if (!payload.sub || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;
    if (
      payload.ctx !== undefined &&
      payload.ctx !== "USER" &&
      payload.ctx !== "BOOSTER" &&
      payload.ctx !== "ADMIN"
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  userId: string,
  ctx?: SessionContext,
  sessionVersion?: number
): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId, SESSION_MAX_AGE, ctx, sessionVersion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Reads and verifies the signed session cookie, then confirms the user still
 * exists and is not deactivated. Cached per request with React `cache`.
 *
 * The active context is re-derived from the database on every request; the
 * cookie claim is only a preference, never an authorization decision.
 */
export const getSession = cache(async (): Promise<AuthSessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatarUrl: true,
      themePreference: true,
      role: true,
      orgRole: true,
      status: true,
      clientId: true,
      profileCompleteAt: true,
      sessionVersion: true,
      boosterProfile: {
        select: { id: true, status: true },
      },
    },
  });

  if (!user || user.status === "DEACTIVATED") return null;

  // Versioned sessions are mandatory. Legacy cookies without a version are
  // rejected so a password change can always revoke older sessions.
  if (payload.ver === undefined || payload.ver !== user.sessionVersion) {
    return null;
  }

  const context = resolveSessionContext({
    role: user.role as UserRole,
    hasClient: Boolean(user.clientId),
    boosterStatus: user.boosterProfile?.status ?? null,
    requested: payload.ctx ?? null,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    themePreference: user.themePreference,
    role: user.role,
    orgRole: user.orgRole,
    clientId: user.clientId,
    profileComplete: !!user.profileCompleteAt,
    context,
    boosterProfileId: user.boosterProfile?.id ?? null,
    sessionVersion: user.sessionVersion,
  };
});
