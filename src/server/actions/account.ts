"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, setSessionCookie } from "@/lib/session";
import { canSwitchTo, landingPathForContext } from "@/lib/session-context";

const AccountSettingsSchema = z.object({
  name: z.string().min(2, "Full name is required."),
  phone: z.string().optional(),
  company: z.string().optional(),
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
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.id },
      data: {
        name: parsed.data.name.trim(),
        phone: parsed.data.phone?.trim() || null,
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
