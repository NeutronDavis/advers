import { prisma } from "@/lib/prisma";
import { approvedRemaining, computeWithdrawable } from "@/lib/finance";

export interface BoosterEarningView {
  id: string;
  jobId: string;
  jobTitle: string;
  jobNumber: string;
  amount: number;
  paidAmount: number;
  paymentModel: string;
  status: string;
  reference: string;
  approvedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface WithdrawalView {
  id: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
  requestedAt: string;
  reviewedAt: string | null;
  paidAt: string | null;
  notes: string | null;
  boosterName?: string;
}

export interface BoosterFinanceData {
  boosterId: string;
  displayName: string;
  earnings: BoosterEarningView[];
  withdrawals: WithdrawalView[];
  totals: {
    pending: number;
    approved: number;
    paid: number;
    pendingWithdrawals: number;
    withdrawable: number;
  };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export async function getBoosterFinanceData(
  userId: string
): Promise<BoosterFinanceData | null> {
  const profile = await prisma.boosterProfile.findUnique({ where: { userId } });
  if (!profile) return null;

  const [earnings, withdrawals] = await Promise.all([
    prisma.boosterEarning.findMany({
      where: { boosterId: profile.id },
      include: { job: { select: { title: true, jobNumber: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.withdrawal.findMany({
      where: { boosterId: profile.id },
      orderBy: { requestedAt: "desc" },
    }),
  ]);

  const pending = sum(
    earnings.filter((earning) => earning.status === "PENDING").map((earning) => earning.amount)
  );
  const approved = approvedRemaining(earnings);
  const paid = sum(earnings.map((earning) => earning.paidAmount));
  const pendingWithdrawals = sum(
    withdrawals
      .filter((withdrawal) =>
        ["REQUESTED", "UNDER_REVIEW", "APPROVED"].includes(withdrawal.status)
      )
      .map((withdrawal) => withdrawal.amount)
  );

  return {
    boosterId: profile.id,
    displayName: profile.displayName,
    earnings: earnings.map((earning) => ({
      id: earning.id,
      jobId: earning.jobId,
      jobTitle: earning.job.title,
      jobNumber: earning.job.jobNumber,
      amount: earning.amount,
      paidAmount: earning.paidAmount,
      paymentModel: earning.paymentModel,
      status: earning.status,
      reference: earning.reference,
      approvedAt: earning.approvedAt ? earning.approvedAt.toISOString() : null,
      paidAt: earning.paidAt ? earning.paidAt.toISOString() : null,
      createdAt: earning.createdAt.toISOString(),
    })),
    withdrawals: withdrawals.map((withdrawal) => ({
      id: withdrawal.id,
      amount: withdrawal.amount,
      status: withdrawal.status,
      method: withdrawal.method,
      reference: withdrawal.reference,
      requestedAt: withdrawal.requestedAt.toISOString(),
      reviewedAt: withdrawal.reviewedAt ? withdrawal.reviewedAt.toISOString() : null,
      paidAt: withdrawal.paidAt ? withdrawal.paidAt.toISOString() : null,
      notes: withdrawal.notes,
    })),
    totals: {
      pending,
      approved,
      paid,
      pendingWithdrawals,
      withdrawable: computeWithdrawable(earnings, pendingWithdrawals),
    },
  };
}

export interface AdminLedgerEntryView {
  id: string;
  type: string;
  status: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  reference: string;
  campaignName: string | null;
  jobTitle: string | null;
  boosterName: string | null;
  createdAt: string;
}

export interface AdminWithdrawalView extends WithdrawalView {
  boosterId: string;
  boosterName: string;
  reviewedByName: string | null;
  accountDetails: string | null;
}

export interface AdminDisputeView {
  id: string;
  reason: string;
  status: string;
  resolution: string | null;
  jobId: string | null;
  jobTitle: string | null;
  campaignId: string | null;
  campaignName: string | null;
  openedByName: string;
  againstBoosterName: string | null;
  createdAt: string;
}

export interface AdminFinanceData {
  ledger: AdminLedgerEntryView[];
  earnings: {
    id: string;
    boosterName: string;
    jobTitle: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  withdrawals: AdminWithdrawalView[];
  disputes: AdminDisputeView[];
  totals: {
    grossInflow: number;
    escrowHeld: number;
    boosterPayable: number;
    adversFees: number;
    pendingWithdrawals: number;
  };
}

export async function getAdminFinanceData(): Promise<AdminFinanceData> {
  const [ledger, earnings, withdrawals, disputes] = await Promise.all([
    prisma.ledgerEntry.findMany({
      include: {
        campaign: { select: { name: true } },
        job: { select: { title: true } },
        booster: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    prisma.boosterEarning.findMany({
      include: {
        booster: { select: { displayName: true } },
        job: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.withdrawal.findMany({
      include: {
        booster: { select: { id: true, displayName: true } },
        reviewedBy: { select: { name: true } },
      },
      orderBy: { requestedAt: "desc" },
      take: 50,
    }),
    prisma.dispute.findMany({
      include: {
        job: { select: { title: true } },
        campaign: { select: { name: true } },
        openedBy: { select: { name: true } },
        againstBooster: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const grossInflow = sum(
    ledger
      .filter((entry) =>
        ["SUBSCRIPTION", "CAMPAIGN_PAYMENT"].includes(entry.type)
      )
      .map((entry) => entry.grossAmount)
  );
  const escrowHeld = sum(
    ledger
      .filter((entry) => entry.status === "HELD")
      .map((entry) => entry.netAmount)
  );
  const boosterPayable = sum(
    earnings
      .filter((earning) => earning.status === "APPROVED")
      .map((earning) => Math.max(0, earning.amount - earning.paidAmount))
  );
  const adversFees = sum(
    ledger
      .filter((entry) =>
        ["SUBSCRIPTION", "CAMPAIGN_PAYMENT", "BOOSTER_PAYMENT"].includes(entry.type)
      )
      .map((entry) => entry.feeAmount)
  );
  const pendingWithdrawals = sum(
    withdrawals
      .filter((withdrawal) =>
        ["REQUESTED", "UNDER_REVIEW", "APPROVED"].includes(withdrawal.status)
      )
      .map((withdrawal) => withdrawal.amount)
  );

  return {
    ledger: ledger.map((entry) => ({
      id: entry.id,
      type: entry.type,
      status: entry.status,
      grossAmount: entry.grossAmount,
      feeAmount: entry.feeAmount,
      netAmount: entry.netAmount,
      currency: entry.currency,
      reference: entry.reference,
      campaignName: entry.campaign?.name || null,
      jobTitle: entry.job?.title || null,
      boosterName: entry.booster?.displayName || null,
      createdAt: entry.createdAt.toISOString(),
    })),
    earnings: earnings.map((earning) => ({
      id: earning.id,
      boosterName: earning.booster.displayName,
      jobTitle: earning.job.title,
      amount: earning.amount,
      status: earning.status,
      createdAt: earning.createdAt.toISOString(),
    })),
    withdrawals: withdrawals.map((withdrawal) => {
      let accountDetails: string | null = null;
      try {
        const parsed = JSON.parse(withdrawal.accountDetailsJson || "null");
        accountDetails =
          parsed && typeof parsed.details === "string" ? parsed.details : null;
      } catch {
        accountDetails = null;
      }

      return {
        id: withdrawal.id,
        boosterId: withdrawal.boosterId,
        boosterName: withdrawal.booster.displayName,
        amount: withdrawal.amount,
        status: withdrawal.status,
        method: withdrawal.method,
        reference: withdrawal.reference,
        requestedAt: withdrawal.requestedAt.toISOString(),
        reviewedAt: withdrawal.reviewedAt
          ? withdrawal.reviewedAt.toISOString()
          : null,
        paidAt: withdrawal.paidAt ? withdrawal.paidAt.toISOString() : null,
        notes: withdrawal.notes,
        reviewedByName: withdrawal.reviewedBy?.name || null,
        accountDetails,
      };
    }),
    disputes: disputes.map((dispute) => ({
      id: dispute.id,
      reason: dispute.reason,
      status: dispute.status,
      resolution: dispute.resolution,
      jobId: dispute.jobId,
      jobTitle: dispute.job?.title || null,
      campaignId: dispute.campaignId,
      campaignName: dispute.campaign?.name || null,
      openedByName: dispute.openedBy.name,
      againstBoosterName: dispute.againstBooster?.displayName || null,
      createdAt: dispute.createdAt.toISOString(),
    })),
    totals: {
      grossInflow,
      escrowHeld,
      boosterPayable,
      adversFees,
      pendingWithdrawals,
    },
  };
}

export interface AdminTrustData {
  verifications: {
    id: string;
    displayName: string;
    businessName: string | null;
    verificationStatus: string;
    verificationLevel: string | null;
    documents: string[];
    notes: string | null;
    fraudRisk: string;
    createdAt: string;
  }[];
  ratings: {
    id: string;
    score: number;
    comment: string | null;
    jobTitle: string;
    reviewerName: string;
    boosterName: string;
    createdAt: string;
  }[];
  disputes: AdminDisputeView[];
}

export async function getAdminTrustData(): Promise<AdminTrustData> {
  const [profiles, ratings, disputes] = await Promise.all([
    prisma.boosterProfile.findMany({
      where: { verificationStatus: "PENDING" },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.rating.findMany({
      where: { moderationState: "PENDING" },
      include: {
        job: { select: { title: true } },
        reviewer: { select: { name: true } },
        ratedBooster: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.dispute.findMany({
      where: { status: { in: ["OPEN", "UNDER_REVIEW", "APPEALED"] } },
      include: {
        job: { select: { title: true } },
        campaign: { select: { name: true } },
        openedBy: { select: { name: true } },
        againstBooster: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    verifications: profiles.map((profile) => {
      let documents: string[] = [];
      try {
        const parsed = JSON.parse(profile.verificationDocumentsJson || "[]");
        documents = Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === "string")
          : [];
      } catch {
        documents = [];
      }
      return {
        id: profile.id,
        displayName: profile.displayName,
        businessName: profile.businessName,
        verificationStatus: profile.verificationStatus,
        verificationLevel: profile.verificationLevel,
        documents,
        notes: profile.verificationNotes,
        fraudRisk: profile.fraudRisk,
        createdAt: profile.createdAt.toISOString(),
      };
    }),
    ratings: ratings.map((rating) => ({
      id: rating.id,
      score: rating.score,
      comment: rating.comment,
      jobTitle: rating.job.title,
      reviewerName: rating.reviewer.name,
      boosterName: rating.ratedBooster.displayName,
      createdAt: rating.createdAt.toISOString(),
    })),
    disputes: disputes.map((dispute) => ({
      id: dispute.id,
      reason: dispute.reason,
      status: dispute.status,
      resolution: dispute.resolution,
      jobId: dispute.jobId,
      jobTitle: dispute.job?.title || null,
      campaignId: dispute.campaignId,
      campaignName: dispute.campaign?.name || null,
      openedByName: dispute.openedBy.name,
      againstBoosterName: dispute.againstBooster?.displayName || null,
      createdAt: dispute.createdAt.toISOString(),
    })),
  };
}
