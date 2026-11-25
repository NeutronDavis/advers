"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { enforceRateLimit } from "@/server/security/rate-limit";

type ActionResult = { success: true } | { success: false; error: string };

const AddSchema = z.object({
  title: z.string().trim().min(2, "Add a portfolio title.").max(120),
  description: z.string().trim().max(500).optional(),
  mediaAssetId: z.string().min(1),
});

export async function addPortfolioMediaItemAction(
  input: z.input<typeof AddSchema>
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const parsed = AddSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const limited = await enforceRateLimit(
    `portfolio-add:${session.id}`,
    20,
    60 * 60_000
  );
  if (!limited.allowed) {
    return { success: false, error: "Too many portfolio uploads. Try again later." };
  }

  const profile = await prisma.boosterProfile.findUnique({
    where: { userId: session.id },
    select: { id: true, handle: true },
  });
  if (!profile) return { success: false, error: "Create your Booster profile first." };

  const asset = await prisma.mediaAsset.findFirst({
    where: {
      id: parsed.data.mediaAssetId,
      ownerId: session.id,
      kind: { in: ["IMAGE", "VIDEO"] },
    },
    select: { id: true },
  });
  if (!asset) return { success: false, error: "Upload a valid image or video first." };

  const count = await prisma.portfolioItem.count({
    where: { boosterId: profile.id },
  });
  if (count >= 20) {
    return {
      success: false,
      error: "Portfolio limit reached (20 items). Remove an item before adding another.",
    };
  }

  await prisma.portfolioItem.create({
    data: {
      boosterId: profile.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      mediaAssetId: asset.id,
      sortOrder: count,
    },
  });

  revalidatePath("/booster/profile");
  revalidatePath("/booster/profile/edit");
  revalidatePath(`/portal/adboosters/${profile.handle ?? profile.id}`);
  return { success: true };
}

export async function deletePortfolioItemAction(
  itemId: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const item = await prisma.portfolioItem.findFirst({
    where: { id: itemId, booster: { userId: session.id } },
    include: { booster: { select: { handle: true, id: true } } },
  });
  if (!item) return { success: false, error: "Portfolio item not found." };

  await prisma.portfolioItem.delete({ where: { id: item.id } });

  revalidatePath("/booster/profile");
  revalidatePath("/booster/profile/edit");
  revalidatePath(`/portal/adboosters/${item.booster.handle ?? item.booster.id}`);
  return { success: true };
}
