/**
 * Phase 2 security smoke test.
 *
 * Usage: npm run security:smoke
 *
 * Exercises TOTP enrolment/verification and one-time step-up tokens against the
 * real database, then removes the temporary user.
 */
import { randomBytes } from "crypto";
import { prisma } from "../src/lib/prisma";
import { generateTotp } from "../src/lib/totp";
import {
  beginTwoFactorEnrolment,
  confirmTwoFactorEnrolment,
  consumeRecoveryCode,
  disableTwoFactor,
  getTwoFactorState,
  verifyUserTotp,
} from "../src/server/security/two-factor";
import { consumeStepUpToken, issueStepUpToken } from "../src/server/security/step-up";
import { enforceRateLimit } from "../src/server/security/rate-limit";

const suffix = randomBytes(4).toString("hex");

async function main(): Promise<void> {
  const user = await prisma.user.create({
    data: {
      email: `security-smoke-${suffix}@example.com`,
      name: "Security Smoke",
      role: "CLIENT",
      status: "ACTIVE",
    },
  });

  try {
    const enrolment = await beginTwoFactorEnrolment(user.id, user.email);
    if (enrolment.recoveryCodes.length !== 10) {
      throw new Error("Expected ten recovery codes.");
    }

    await confirmTwoFactorEnrolment(user.id, generateTotp(enrolment.secret));

    const state = await getTwoFactorState(user.id);
    if (!state.enabled || state.recoveryCodesRemaining !== 10) {
      throw new Error(`Unexpected 2FA state: ${JSON.stringify(state)}`);
    }

    const valid = await verifyUserTotp(user.id, generateTotp(enrolment.secret));
    const invalid = await verifyUserTotp(user.id, "000000");
    if (!valid || invalid) {
      throw new Error("TOTP verification did not behave correctly.");
    }

    const stepUp = await issueStepUpToken(user.id, "WITHDRAWAL");
    const first = await consumeStepUpToken({
      userId: user.id,
      token: stepUp.token,
      action: "WITHDRAWAL",
    });
    const stepUpReused = await consumeStepUpToken({
      userId: user.id,
      token: stepUp.token,
      action: "WITHDRAWAL",
    });
    if (!first || stepUpReused) {
      throw new Error("Step-up token was not single-use.");
    }

    await disableTwoFactor(user.id, generateTotp(enrolment.secret));
    const disabled = await getTwoFactorState(user.id);
    if (disabled.enabled) {
      throw new Error("2FA was not disabled.");
    }

    const recoveryEnrolment = await beginTwoFactorEnrolment(user.id, user.email);
    await confirmTwoFactorEnrolment(user.id, generateTotp(recoveryEnrolment.secret));
    const recoveryCode = recoveryEnrolment.recoveryCodes[0];
    const recovered = await consumeRecoveryCode(user.id, recoveryCode);
    const reused = await consumeRecoveryCode(user.id, recoveryCode);
    if (!recovered || reused) {
      throw new Error("Recovery code was not single-use.");
    }

    const rateKey = `smoke-rate:${suffix}`;
    const firstHit = await enforceRateLimit(rateKey, 1, 60_000);
    const secondHit = await enforceRateLimit(rateKey, 1, 60_000);
    if (!firstHit.allowed || secondHit.allowed) {
      throw new Error("Database rate limiter did not enforce the limit.");
    }
    await prisma.rateLimitBucket.deleteMany({ where: { key: rateKey } });

    console.log("Security smoke test passed.");
    console.log("  TOTP, step-up, recovery codes and DB rate limiting all worked.");
  } finally {
    await prisma.user.deleteMany({ where: { id: user.id } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "Security smoke test failed:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
