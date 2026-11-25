import { createHash, randomBytes } from "crypto";

export const STEP_UP_TTL_MS = 5 * 60 * 1000;

export interface StepUpMaterial {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

export function hashStepUpToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateStepUpMaterial(
  ttlMs = STEP_UP_TTL_MS,
  now = Date.now()
): StepUpMaterial {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashStepUpToken(token),
    expiresAt: new Date(now + ttlMs),
  };
}

export function isStepUpExpired(
  expiresAt: Date,
  now = Date.now()
): boolean {
  return expiresAt.getTime() <= now;
}
