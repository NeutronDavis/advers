import { prisma } from "@/lib/prisma";
import { generateStepUpMaterial, hashStepUpToken } from "@/lib/step-up";

export interface IssuedStepUpToken {
  token: string;
  expiresAt: Date;
}

export async function issueStepUpToken(
  userId: string,
  action: string,
  resourceId?: string
): Promise<IssuedStepUpToken> {
  const material = generateStepUpMaterial();
  await prisma.stepUpToken.create({
    data: {
      userId,
      tokenHash: material.tokenHash,
      action,
      resourceId: resourceId ?? null,
      expiresAt: material.expiresAt,
    },
  });
  return { token: material.token, expiresAt: material.expiresAt };
}

/**
 * Atomically consumes a step-up token. Returns false if it is unknown, already
 * used, expired, or bound to a different user/action/resource.
 */
export async function consumeStepUpToken(input: {
  userId: string;
  token: string;
  action: string;
  resourceId?: string;
}): Promise<boolean> {
  if (!input.token.trim()) return false;
  const tokenHash = hashStepUpToken(input.token);
  const record = await prisma.stepUpToken.findUnique({ where: { tokenHash } });
  if (!record) return false;
  if (record.userId !== input.userId) return false;
  if (record.action !== input.action) return false;
  if ((record.resourceId ?? null) !== (input.resourceId ?? null)) return false;
  if (record.usedAt) return false;
  if (record.expiresAt.getTime() <= Date.now()) return false;

  const consumed = await prisma.stepUpToken.updateMany({
    where: {
      id: record.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });
  return consumed.count === 1;
}
