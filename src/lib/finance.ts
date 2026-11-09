export interface EarningBalance {
  id: string;
  amount: number;
  paidAmount: number;
  status: string;
}

export function approvedRemaining(earnings: EarningBalance[]): number {
  return earnings
    .filter((earning) => earning.status === "APPROVED")
    .reduce((total, earning) => total + Math.max(0, earning.amount - earning.paidAmount), 0);
}

export function computeWithdrawable(
  earnings: EarningBalance[],
  pendingWithdrawals: number
): number {
  return Math.max(0, approvedRemaining(earnings) - Math.max(0, pendingWithdrawals));
}

export interface WithdrawalAllocation {
  earningId: string;
  paidAmount: number;
  fullyPaid: boolean;
}

/**
 * Allocates a withdrawal amount across approved earnings in FIFO order.
 * Partial earnings keep their APPROVED status and track paidAmount.
 */
export function allocateWithdrawal(
  amount: number,
  earnings: EarningBalance[]
): WithdrawalAllocation[] {
  let remaining = Math.max(0, amount);
  const allocations: WithdrawalAllocation[] = [];

  for (const earning of earnings) {
    if (remaining <= 0) break;
    if (earning.status !== "APPROVED") continue;

    const available = Math.max(0, earning.amount - earning.paidAmount);
    if (available <= 0) continue;

    if (available <= remaining) {
      allocations.push({
        earningId: earning.id,
        paidAmount: earning.amount,
        fullyPaid: true,
      });
      remaining -= available;
    } else {
      allocations.push({
        earningId: earning.id,
        paidAmount: earning.paidAmount + remaining,
        fullyPaid: false,
      });
      remaining = 0;
    }
  }

  return allocations;
}
