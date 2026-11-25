export interface LedgerAccountKeyInput {
  userId?: string | null;
  type: string;
  currency: string;
  network?: string | null;
}

/** Stable, unique key for an account tuple. */
export function ledgerAccountKey(input: LedgerAccountKeyInput): string {
  return [
    input.userId ?? "SYSTEM",
    input.type,
    input.currency,
    input.network ?? "NONE",
  ].join(":");
}
