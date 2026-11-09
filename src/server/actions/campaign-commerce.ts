"use server";

import { revalidatePath } from "next/cache";
import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { normalizeCampaignStatus } from "@/lib/campaign-status";

export type CommerceResult =
  | { success: true }
  | { success: false; error: string };

function isTerminal(status: string): boolean {
  return ["COMPLETED", "CANCELLED", "REJECTED"].includes(
    normalizeCampaignStatus(status)
  );
}

export async function approveQuoteAction(quoteId: string): Promise<CommerceResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { campaign: true },
  });
  if (!quote?.campaign) {
    return { success: false, error: "Quote not found." };
  }

  const campaign = quote.campaign;
  const ownsCampaign =
    campaign.userId === session.id ||
    (!!session.clientId && campaign.clientId === session.clientId);
  if (!ownsCampaign) {
    return { success: false, error: "You do not have access to this quote." };
  }

  if (!["SENT", "VIEWED"].includes(quote.status)) {
    return { success: false, error: "This quote is no longer awaiting approval." };
  }

  const normalized = normalizeCampaignStatus(campaign.status);
  if (!["QUOTE_REQUIRED", "AWAITING_APPROVAL"].includes(normalized)) {
    return { success: false, error: "This campaign is not ready for quote approval." };
  }
  if (!campaign.clientId) {
    return { success: false, error: "Campaign is not linked to a client account." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.quote.update({
      where: { id: quote.id },
      data: { status: "ACCEPTED", approvedAt: new Date() },
    });

    await tx.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.AWAITING_PAYMENT },
    });

    await tx.campaignStatusEvent.create({
      data: {
        campaignId: campaign.id,
        fromStatus: campaign.status,
        toStatus: CampaignStatus.AWAITING_PAYMENT,
        actorId: session.id,
        note: "Advertiser approved the quote. Awaiting payment.",
      },
    });

    await tx.invoice.create({
      data: {
        invoiceNumber: `CAMP-INV-${Date.now()}`,
        clientId: campaign.clientId!,
        campaignId: campaign.id,
        userId: session.id,
        title: `Campaign: ${campaign.name}`,
        amount: quote.amount,
        serviceType: "CAMPAIGN",
        status: "PENDING",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: campaign.clientId,
        action: "QUOTE_APPROVED",
        description: `${session.name} approved quote ${quote.quoteNumber} for "${campaign.name}".`,
        metadata: JSON.stringify({ campaignId: campaign.id, quoteId: quote.id }),
      },
    });
  });

  revalidatePath(`/portal/campaigns/${campaign.id}`);
  revalidatePath("/portal/campaigns");
  revalidatePath("/admin/moderation");
  return { success: true };
}

export async function rejectQuoteAction(
  quoteId: string,
  reason?: string
): Promise<CommerceResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { campaign: true },
  });
  if (!quote?.campaign) {
    return { success: false, error: "Quote not found." };
  }

  const campaign = quote.campaign;
  const ownsCampaign =
    campaign.userId === session.id ||
    (!!session.clientId && campaign.clientId === session.clientId);
  if (!ownsCampaign) {
    return { success: false, error: "You do not have access to this quote." };
  }

  if (!["SENT", "VIEWED"].includes(quote.status)) {
    return { success: false, error: "This quote is no longer awaiting approval." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.quote.update({
      where: { id: quote.id },
      data: { status: "REJECTED" },
    });

    await tx.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.REJECTED },
    });

    await tx.campaignStatusEvent.create({
      data: {
        campaignId: campaign.id,
        fromStatus: campaign.status,
        toStatus: CampaignStatus.REJECTED,
        actorId: session.id,
        note: reason?.trim() || "Advertiser rejected the quote.",
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: campaign.clientId,
        action: "QUOTE_REJECTED",
        description: `${session.name} rejected quote ${quote.quoteNumber} for "${campaign.name}".`,
        metadata: JSON.stringify({ campaignId: campaign.id, quoteId: quote.id }),
      },
    });
  });

  revalidatePath(`/portal/campaigns/${campaign.id}`);
  revalidatePath("/portal/campaigns");
  revalidatePath("/admin/moderation");
  return { success: true };
}

export async function payCampaignInvoiceAction(
  invoiceId: string
): Promise<CommerceResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { campaign: true },
  });
  if (!invoice?.campaign) {
    return { success: false, error: "Campaign invoice not found." };
  }

  const campaign = invoice.campaign;
  const ownsCampaign =
    campaign.userId === session.id ||
    (!!session.clientId && campaign.clientId === session.clientId);
  if (!ownsCampaign) {
    return { success: false, error: "You do not have access to this invoice." };
  }

  if (invoice.status === "PAID") return { success: true };
  if (!["PENDING", "OVERDUE"].includes(invoice.status)) {
    return { success: false, error: "This invoice cannot be paid." };
  }

  const reference = `MOCK-CAMPAIGN-${invoice.id}`;
  const existingPayment = await prisma.payment.findUnique({ where: { reference } });
  if (existingPayment) return { success: true };

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount,
        paymentMethod: "MOCK_CHECKOUT",
        reference,
        status: "SUCCESS",
      },
    });

    await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidAt: new Date() },
    });

    await tx.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.CONFIRMED },
    });

    await tx.campaignStatusEvent.create({
      data: {
        campaignId: campaign.id,
        fromStatus: campaign.status,
        toStatus: CampaignStatus.CONFIRMED,
        actorId: session.id,
        note: "Payment received. Campaign confirmed.",
      },
    });

    await tx.ledgerEntry.create({
      data: {
        type: "CAMPAIGN_PAYMENT",
        status: "HELD",
        payerId: session.id,
        grossAmount: invoice.amount,
        feeAmount: 0,
        netAmount: invoice.amount,
        reference: `LEDGER-CAMPAIGN-${invoice.id}`,
        campaignId: campaign.id,
        metadataJson: JSON.stringify({ invoiceId: invoice.id }),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: campaign.clientId,
        action: "CAMPAIGN_PAYMENT_SUCCESS",
        description: `${session.name} paid ${invoice.invoiceNumber} for "${campaign.name}".`,
        metadata: JSON.stringify({ campaignId: campaign.id, invoiceId: invoice.id }),
      },
    });
  });

  revalidatePath(`/portal/campaigns/${campaign.id}`);
  revalidatePath("/portal/campaigns");
  revalidatePath("/admin/moderation");
  return { success: true };
}

export async function cancelCampaignAction(
  campaignId: string,
  reason?: string
): Promise<CommerceResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in." };

  const campaign = await prisma.campaign.findFirst({
    where: session.clientId
      ? {
          id: campaignId,
          OR: [{ userId: session.id }, { clientId: session.clientId }],
        }
      : { id: campaignId, userId: session.id },
  });
  if (!campaign) return { success: false, error: "Campaign not found." };
  if (isTerminal(campaign.status)) {
    return { success: false, error: "This campaign is already closed." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.CANCELLED },
    });
    await tx.campaignStatusEvent.create({
      data: {
        campaignId: campaign.id,
        fromStatus: campaign.status,
        toStatus: CampaignStatus.CANCELLED,
        actorId: session.id,
        note: reason?.trim() || "Campaign cancelled by advertiser.",
      },
    });
    await tx.activityLog.create({
      data: {
        userId: session.id,
        clientId: campaign.clientId,
        action: "CAMPAIGN_CANCELLED",
        description: `${session.name} cancelled campaign "${campaign.name}".`,
        metadata: JSON.stringify({ campaignId: campaign.id }),
      },
    });
  });

  revalidatePath(`/portal/campaigns/${campaign.id}`);
  revalidatePath("/portal/campaigns");
  revalidatePath("/admin/moderation");
  return { success: true };
}
