import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/secret-box";
import {
  buildOtpauthUri,
  generateRecoveryCodes,
  generateTotpSecret,
  verifyTotp,
} from "@/lib/totp";

const RECOVERY_CODE_COUNT = 10;

export interface TwoFactorState {
  enabled: boolean;
  confirmedAt: string | null;
  recoveryCodesRemaining: number;
}

function parseCodes(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function getTwoFactorState(userId: string): Promise<TwoFactorState> {
  const record = await prisma.twoFactorSecret.findUnique({ where: { userId } });
  const enabled = Boolean(record?.confirmedAt && !record.disabledAt);
  return {
    enabled,
    confirmedAt: enabled && record?.confirmedAt ? record.confirmedAt.toISOString() : null,
    recoveryCodesRemaining: enabled ? parseCodes(record?.recoveryCodesJson).length : 0,
  };
}

export interface BeginEnrolmentResult {
  secret: string;
  otpauthUri: string;
  recoveryCodes: string[];
}

export async function beginTwoFactorEnrolment(
  userId: string,
  accountName: string
): Promise<BeginEnrolmentResult> {
  const existing = await prisma.twoFactorSecret.findUnique({ where: { userId } });
  if (existing?.confirmedAt && !existing.disabledAt) {
    throw new Error("Two-factor authentication is already enabled.");
  }

  const secret = generateTotpSecret();
  const recoveryCodes = generateRecoveryCodes(RECOVERY_CODE_COUNT);
  const hashedCodes = await Promise.all(
    recoveryCodes.map((code) => bcrypt.hash(code, 10))
  );

  await prisma.twoFactorSecret.upsert({
    where: { userId },
    update: {
      encryptedSecret: encryptSecret(secret),
      recoveryCodesJson: JSON.stringify(hashedCodes),
      confirmedAt: null,
      disabledAt: null,
      lastUsedAt: null,
    },
    create: {
      userId,
      encryptedSecret: encryptSecret(secret),
      recoveryCodesJson: JSON.stringify(hashedCodes),
    },
  });

  return {
    secret,
    otpauthUri: buildOtpauthUri({ secret, accountName }),
    recoveryCodes,
  };
}

export async function confirmTwoFactorEnrolment(
  userId: string,
  token: string
): Promise<void> {
  const record = await prisma.twoFactorSecret.findUnique({ where: { userId } });
  if (!record || record.confirmedAt) {
    throw new Error("Start two-factor enrolment first.");
  }
  const secret = decryptSecret(record.encryptedSecret);
  if (!verifyTotp(secret, token)) {
    throw new Error("That authenticator code is not valid.");
  }
  await prisma.twoFactorSecret.update({
    where: { userId },
    data: { confirmedAt: new Date(), disabledAt: null, lastUsedAt: new Date() },
  });
}

/** Verifies a TOTP code for an enabled account. Used for step-up actions. */
export async function verifyUserTotp(
  userId: string,
  token: string
): Promise<boolean> {
  const record = await prisma.twoFactorSecret.findUnique({ where: { userId } });
  if (!record?.confirmedAt || record.disabledAt) return false;
  const secret = decryptSecret(record.encryptedSecret);
  const valid = verifyTotp(secret, token);
  if (valid) {
    await prisma.twoFactorSecret.update({
      where: { userId },
      data: { lastUsedAt: new Date() },
    });
  }
  return valid;
}

export async function disableTwoFactor(
  userId: string,
  token: string
): Promise<void> {
  const valid = await verifyUserTotp(userId, token);
  if (!valid) {
    throw new Error("That authenticator code is not valid.");
  }
  await prisma.twoFactorSecret.update({
    where: { userId },
    data: { disabledAt: new Date(), confirmedAt: null },
  });
}

export async function regenerateRecoveryCodes(
  userId: string,
  token: string
): Promise<string[]> {
  const valid = await verifyUserTotp(userId, token);
  if (!valid) {
    throw new Error("That authenticator code is not valid.");
  }
  const codes = generateRecoveryCodes(RECOVERY_CODE_COUNT);
  const hashed = await Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
  await prisma.twoFactorSecret.update({
    where: { userId },
    data: { recoveryCodesJson: JSON.stringify(hashed) },
  });
  return codes;
}

/** Single-use recovery code. Returns true when the code was consumed. */
export async function consumeRecoveryCode(
  userId: string,
  code: string
): Promise<boolean> {
  const record = await prisma.twoFactorSecret.findUnique({ where: { userId } });
  if (!record?.confirmedAt || record.disabledAt) return false;
  const hashes = parseCodes(record.recoveryCodesJson);
  const normalized = code.trim().toUpperCase();

  for (let index = 0; index < hashes.length; index += 1) {
    if (await bcrypt.compare(normalized, hashes[index])) {
      const remaining = hashes.filter((_, position) => position !== index);
      await prisma.twoFactorSecret.update({
        where: { userId },
        data: { recoveryCodesJson: JSON.stringify(remaining) },
      });
      return true;
    }
  }
  return false;
}
