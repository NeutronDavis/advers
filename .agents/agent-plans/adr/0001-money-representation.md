# ADR-0001: Money Representation

**Status:** Proposed — pending sign-off
**Date:** 2026-11-24
**Deciders:** Product, Engineering, Finance

## Context

Every monetary field in `prisma/schema.prisma` is `Int` and implicitly whole Nigerian Naira: `Campaign.budget`, `Wallet.availableBalance/escrowBalance/totalSpent`, `WalletTransaction.amount`, `LedgerEntry.grossAmount/feeAmount/netAmount`, `Invoice.amount`, `Payment.amount`, `Quote.*`, `BoosterJob.budget`, `BoosterEarning.amount`, `Withdrawal.amount`. `src/lib/format.ts` hardcodes `NGN`.

USDC has 6 decimals. A signed 32-bit `Int` cannot hold meaningful USDC minor units (max ≈ 2,147 USDC at 1e-6). JavaScript floats cannot represent money exactly. The brief requires NGN pricing with USDC settlement (user decision D-02), so both currencies must coexist and be converted through a recorded rate.

## Decision

1. **Store exact minor units.**
   - New columns: `amountMinor`, `grossMinor`, `feeMinor`, `netMinor`, `balanceMinor` as Prisma `BigInt` (MySQL `BIGINT`).
   - Each monetary row also stores `currency` (`NGN` | `USDC`) and, where funds move on-chain, `network` (`POLYGON` | `BASE` | `ETHEREUM` | `SOLANA`).
2. **One decimals map**, defined once in `src/lib/money.ts`:
   ```ts
   export const CURRENCY_DECIMALS = { NGN: 2, USDC: 6 } as const;
   ```
   Callers must never pass decimals explicitly.
3. **Integer-only domain arithmetic.** All operations go through `addMoney`, `subMoney`, `mulMoney`, `compareMoney`, `parseMoney`, `formatMoney`. Floats are rejected at the boundary.
4. **DTO boundary is strings.** React Server Components cannot serialize `BigInt`. Every server action and data loader returns:
   ```ts
   type MoneyDTO = { amountMinor: string; currency: "NGN" | "USDC"; network?: string };
   ```
   Client components parse with `parseMoney` and format with `MoneyText`.
5. **Pricing vs settlement.** A transaction stores:
   - `priceMinor` + `priceCurrency` (NGN list price),
   - `settlementMinor` + `settlementCurrency` + `network` (USDC actually charged),
   - `fxRate`, `fxProvider`, `fxQuoteId`, `fxLockedAt`.
6. **Migration is additive.** Add new columns/tables, dual-write, backfill, cut over reads, then drop legacy `Int` columns in a later migration. Never rename in place.
7. **Backfill rule.** Existing whole-Naira values are multiplied by 100 into kobo minor units. The backfill script writes a reconciliation report (row counts and sums per table) before and after.

## Consequences

- Positive: exact arithmetic; one formatting path; USDC and NGN can coexist; FX is auditable.
- Negative: `BigInt` JSON handling adds boilerplate; Prisma returns `BigInt` and will throw on naive `JSON.stringify`; every financial screen needs a DTO pass.
- Negative: the migration touches every financial table. It must be rehearsed on a staging copy.
- Follow-ups: add a lint/review rule banning raw `Number` arithmetic on money and raw `₦`/`$` literals in JSX.

## Alternatives considered

| Option | Why rejected |
|---|---|
| `Int` cents | Still caps USDC at ~2,147 USDC; would require a second scheme later |
| `Decimal(18,6)` | Viable, but pulls Decimal.js through every boundary and invites accidental float coercion; `BigInt` is unambiguous |
| Single 1e8 integer scale for all currencies | Works mathematically but obscures currency semantics and makes provider reconciliation harder |
| `Float`/`Double` | Cannot represent 0.1 exactly; unacceptable for money |
| Keep NGN `Int` and add separate USDC tables only | Faster short term, but guarantees a second migration when campaign budgets/fees/invoices move to USDC |

## Open questions

- D-04: final network(s).
- D-07: fee amounts and rounding policy for fees.
- Whether historical NGN transactions should display a back-computed USDC equivalent (recommendation: no — display the recorded currency only).
