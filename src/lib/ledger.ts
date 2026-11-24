import { addMoney, compareMoney, negateMoney, zeroMoney } from "./money";
import type { CurrencyCode, Money } from "./money";

export type LedgerDirection = "DEBIT" | "CREDIT";

export interface LedgerLineDraft {
  /** Stable account identifier, resolved to a LedgerAccount by the server. */
  accountKey: string;
  direction: LedgerDirection;
  money: Money;
}

export interface LedgerValidation {
  ok: boolean;
  error?: string;
}

/**
 * Validates the invariants required before a ledger transaction is posted:
 * - at least two lines,
 * - every line has a positive amount and an account key,
 * - all lines share one currency,
 * - debits equal credits exactly.
 */
export function validateLedgerLines(lines: LedgerLineDraft[]): LedgerValidation {
  if (lines.length < 2) {
    return { ok: false, error: "A ledger transaction needs at least two lines." };
  }

  const currency = lines[0]?.money.currency;
  if (!currency) {
    return { ok: false, error: "A ledger transaction needs a currency." };
  }

  for (const line of lines) {
    if (!line.accountKey.trim()) {
      return { ok: false, error: "Every ledger line needs an account." };
    }
    if (line.direction !== "DEBIT" && line.direction !== "CREDIT") {
      return { ok: false, error: `Invalid ledger direction: ${String(line.direction)}` };
    }
    if (line.money.currency !== currency) {
      return {
        ok: false,
        error: `Mixed currencies in one transaction: ${currency} and ${line.money.currency}.`,
      };
    }
    if (line.money.amountMinor <= BigInt(0)) {
      return { ok: false, error: "Ledger line amounts must be positive; use the direction field." };
    }
  }

  const debits = totalFor(lines, "DEBIT");
  const credits = totalFor(lines, "CREDIT");
  if (compareMoney(debits, credits) !== 0) {
    return {
      ok: false,
      error: `Ledger transaction is unbalanced: debits ${debits.amountMinor} vs credits ${credits.amountMinor}.`,
    };
  }

  return { ok: true };
}

export function assertBalanced(lines: LedgerLineDraft[]): void {
  const validation = validateLedgerLines(lines);
  if (!validation.ok) {
    throw new Error(validation.error);
  }
}

function totalFor(
  lines: LedgerLineDraft[],
  direction: LedgerDirection
): Money {
  const currency = lines[0]?.money.currency;
  if (!currency) return zeroMoney("NGN");
  return lines
    .filter((line) => line.direction === direction)
    .reduce((total, line) => addMoney(total, line.money), zeroMoney(currency));
}

export interface AccountNet {
  accountKey: string;
  money: Money;
  /** Credits minus debits. Positive increases the account projection. */
  signedAmountMinor: bigint;
}

/**
 * Nets multiple lines for the same account. Credits increase the balance,
 * debits decrease it.
 */
export function netByAccount(lines: LedgerLineDraft[]): AccountNet[] {
  const currency = lines[0]?.money.currency;
  if (!currency) return [];

  const totals = new Map<string, Money>();
  for (const line of lines) {
    const current = totals.get(line.accountKey) ?? zeroMoney(currency);
    const signed =
      line.direction === "CREDIT" ? line.money : negateMoney(line.money);
    totals.set(line.accountKey, addMoney(current, signed));
  }

  return Array.from(totals.entries()).map(([accountKey, money]) => ({
    accountKey,
    money,
    signedAmountMinor: money.amountMinor,
  }));
}

export function isBalanced(lines: LedgerLineDraft[]): boolean {
  return validateLedgerLines(lines).ok;
}
