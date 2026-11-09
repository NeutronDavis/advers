import { prisma } from "@/lib/prisma";
import type { AuthSessionUser } from "@/lib/types/dto";
import { campaignStatusLabel } from "@/lib/campaign-status";
import { CHANNEL_LABELS } from "@/lib/types/campaign";

export interface CampaignDetailQuote {
  id: string;
  quoteNumber: string;
  title: string;
  amount: number;
  mediaCost: number;
  adversFee: number;
  productionCost: number;
  logisticsCost: number;
  smsCost: number;
  taxAmount: number;
  status: string;
  bookingReference: string | null;
  notes: string | null;
  expiresAt: string;
  sentAt: string;
}

export interface CampaignDetailInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

export interface CampaignDetailProof {
  id: string;
  proofCode: string;
  type: string;
  fileUrl: string;
  caption: string | null;
  broadcastTimestamp: string | null;
  verifiedBy: string;
  verifiedAt: string;
}

export interface CampaignDetailEvent {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  actorName: string | null;
  createdAt: string;
}

export interface CampaignDetailData {
  id: string;
  campaignNumber: string;
  name: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  channel: string;
  objective: string;
  targetLocation: string;
  budget: number;
  duration: string;
  startDate: string | null;
  endDate: string | null;
  productService: string | null;
  targetAudience: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  creativeAssetUrl: string | null;
  creativeAssetType: string | null;
  businessProfileName: string | null;
  inventoryName: string | null;
  inventoryCity: string | null;
  inventoryRate: number | null;
  quotes: CampaignDetailQuote[];
  invoices: CampaignDetailInvoice[];
  proofs: CampaignDetailProof[];
  events: CampaignDetailEvent[];
}

export async function getCampaignDetail(
  id: string,
  user: AuthSessionUser
): Promise<CampaignDetailData | null> {
  const campaign = await prisma.campaign.findFirst({
    where: user.clientId
      ? { id, OR: [{ userId: user.id }, { clientId: user.clientId }] }
      : { id, userId: user.id },
    include: {
      businessProfile: { select: { name: true } },
      inventory: { select: { name: true, city: true, ratePerUnit: true } },
      quotes: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      proofs: { orderBy: { createdAt: "desc" } },
      statusEvents: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true } } },
      },
    },
  });

  if (!campaign) return null;

  return {
    id: campaign.id,
    campaignNumber: campaign.campaignNumber,
    name: campaign.name,
    status: campaign.status,
    statusLabel: campaignStatusLabel(campaign.status),
    createdAt: campaign.createdAt.toISOString(),
    channel: CHANNEL_LABELS[campaign.channel] || campaign.channel,
    objective: campaign.objective,
    targetLocation: campaign.targetLocation,
    budget: campaign.budget,
    duration: campaign.duration,
    startDate: campaign.startDate ? campaign.startDate.toISOString() : null,
    endDate: campaign.endDate ? campaign.endDate.toISOString() : null,
    productService: campaign.productService,
    targetAudience: campaign.targetAudience,
    contactName: campaign.contactName,
    contactEmail: campaign.contactEmail,
    contactPhone: campaign.contactPhone,
    notes: campaign.notes,
    creativeAssetUrl: campaign.creativeAssetUrl,
    creativeAssetType: campaign.creativeAssetType,
    businessProfileName: campaign.businessProfile?.name || null,
    inventoryName: campaign.inventory?.name || null,
    inventoryCity: campaign.inventory?.city || null,
    inventoryRate: campaign.inventory?.ratePerUnit || null,
    quotes: campaign.quotes.map((quote) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      title: quote.title,
      amount: quote.amount,
      mediaCost: quote.mediaCost,
      adversFee: quote.adversFee,
      productionCost: quote.productionCost,
      logisticsCost: quote.logisticsCost,
      smsCost: quote.smsCost,
      taxAmount: quote.taxAmount,
      status: quote.status,
      bookingReference: quote.bookingReference,
      notes: quote.notes,
      expiresAt: quote.expiresAt.toISOString(),
      sentAt: quote.sentAt.toISOString(),
    })),
    invoices: campaign.invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      title: invoice.title,
      amount: invoice.amount,
      status: invoice.status,
      dueDate: invoice.dueDate.toISOString(),
      paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
      createdAt: invoice.createdAt.toISOString(),
    })),
    proofs: campaign.proofs.map((proof) => ({
      id: proof.id,
      proofCode: proof.proofCode,
      type: proof.type,
      fileUrl: proof.fileUrl,
      caption: proof.caption,
      broadcastTimestamp: proof.broadcastTimestamp
        ? proof.broadcastTimestamp.toISOString()
        : null,
      verifiedBy: proof.verifiedBy,
      verifiedAt: proof.verifiedAt.toISOString(),
    })),
    events: campaign.statusEvents.map((event) => ({
      id: event.id,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      note: event.note,
      actorName: event.actor?.name || null,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
