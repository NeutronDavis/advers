"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canCreateBusinessProfile } from "@/lib/entitlements";
import { ProfileWelcomeSchema } from "@/lib/validations/onboarding";

export type WelcomeState = { error?: string } | undefined;

export async function completeWelcomeProfileAction(
  _prevState: WelcomeState,
  formData: FormData
): Promise<WelcomeState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in to complete your profile." };

  const parsed = ProfileWelcomeSchema.safeParse({
    fullName: String(formData.get("fullName") || ""),
    whatsappNumber: String(formData.get("whatsappNumber") || ""),
    companyName: String(formData.get("companyName") || ""),
    industry: String(formData.get("industry") || ""),
    notificationPref: String(formData.get("notificationPref") || "both"),
    timezone: "Africa/Lagos",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let clientId = session.clientId;

  if (!clientId) {
    const client = await prisma.client.create({
      data: {
        name: parsed.data.companyName.trim(),
        industry: parsed.data.industry.trim(),
      },
    });
    clientId = client.id;
  }

  const primaryProfile = await prisma.businessProfile.findFirst({
    where: { clientId, isPrimary: true },
  });

  if (!primaryProfile) {
    const check = await canCreateBusinessProfile(clientId);
    if (!check.allowed) {
      return {
        error:
          check.reason ||
          "Choose a subscription plan before creating your business profile.",
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.client.update({
      where: { id: clientId! },
      data: {
        name: parsed.data.companyName.trim(),
        industry: parsed.data.industry.trim(),
      },
    });

    await tx.user.update({
      where: { id: session.id },
      data: {
        name: parsed.data.fullName.trim(),
        phone: parsed.data.whatsappNumber.trim(),
        clientId,
        profileCompleteAt: new Date(),
      },
    });

    if (primaryProfile) {
      await tx.businessProfile.update({
        where: { id: primaryProfile.id },
        data: {
          name: parsed.data.companyName.trim(),
          category: parsed.data.industry.trim(),
        },
      });
    } else {
      await tx.businessProfile.create({
        data: {
          clientId: clientId!,
          name: parsed.data.companyName.trim(),
          category: parsed.data.industry.trim(),
          isPrimary: true,
          status: "DRAFT",
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId,
        action: "PROFILE_COMPLETED",
        description: `${parsed.data.fullName.trim()} completed the business profile for ${parsed.data.companyName.trim()}.`,
        metadata: JSON.stringify({
          notificationPref: parsed.data.notificationPref,
          timezone: parsed.data.timezone,
        }),
      },
    });
  });

  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/business-profiles");
  redirect("/portal/dashboard");
}
