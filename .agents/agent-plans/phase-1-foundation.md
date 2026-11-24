# Phase 1 — Foundation: Completion Note

**Date:** 2026-11-24
**Status:** Core complete. Deliberate deferrals listed in §5.
**Database:** Aiven MySQL `advers` — backup taken, baseline recorded, Phase 1 migration applied, backfill verified.

---

## 1. What shipped

### Exact money layer
- `src/lib/money.ts` — `Money`/`MoneyDTO`, `CURRENCY_DECIMALS` (`NGN=2`, `USDC=6`), `parseMoney`, `formatMoney`, `formatMoneyShort`, integer arithmetic, network allowlist (`POLYGON`), `legacyMoneyDTO`, `moneyFromLegacyNaira`.
- `src/lib/format.ts` — `formatNaira`/`formatNairaShort` now delegate to the exact formatter; added `formatCurrency` and `formatMoneyValue`.
- Tests: `src/lib/__tests__/money.test.ts` (10 tests).

### Double-entry ledger
- `src/lib/ledger.ts` — balanced-transaction validation, per-account netting, currency safety.
- `src/server/ledger/index.ts` — idempotent `postLedgerTransaction`, account keying, balance projections, `rebuildLedgerBalances`, recent transaction query.
- Tests: `src/lib/__tests__/ledger.test.ts` (6 tests).
- DB integration smoke test: balanced USDC transfer, idempotent replay, projection rebuild, cleanup (`scripts/ledger-smoke.ts`).

### Schema and migration
- Added `ThemePreference`; `User.username/avatarUrl/coverUrl/themePreference/sessionVersion`.
- Added `currency`/minor-unit columns to `Campaign`, `Wallet`, `WalletTransaction`, `LedgerEntry`, `Invoice`, `Payment`, `Quote`, `BoosterJob`, `BoosterEarning`, `Withdrawal`.
- Added `LedgerAccount`, `LedgerTransaction`, `LedgerLine`, `FxQuote`, `ProviderEvent`.
- Baseline migration `prisma/migrations/20261124000000_baseline` records the pre-existing schema.
- Phase 1 migration `prisma/migrations/20261124120000_phase1_foundation` is additive only (columns, tables, indexes, FKs; no drops).

### Backfill and safety
- `scripts/backup-database.ts` (`npm run db:backup`) — raw-SQL JSON backup that works before a migration.
- `scripts/backfill-money.ts` (`npm run backfill:money`) — dry-run by default, `--apply` writes `legacy * 100` and verifies every row.
- `scripts/verify-phase1.ts` (`npm run verify:phase1`) — checks migrations, tables, backfill completeness/correctness, smoke cleanup, new fields.

### Session context and step-up groundwork
- `src/lib/session-context.ts` — `resolveSessionContext`, `canSwitchTo`, `landingPathForContext`.
- `src/lib/types/dto.ts` — `SessionContext`, `ThemePreference`, extended `AuthSessionUser`.
- `src/lib/session.ts` — optional signed `ctx`/`ver` claims, DB re-derivation of context, revocation check.
- `src/lib/auth.ts` — `requireContext()`, `requireBooster()`.
- `src/server/actions/account.ts` — `switchAccountContextAction` with DB verification and audit log.
- Tests: `src/lib/__tests__/session-context.test.ts` (6 tests).

### Design tokens
- `src/app/globals.css` — obsidian/gold is now the canonical daisyUI palette for light and dark; added `--color-primary-hover`, `--color-primary-soft`, `--color-success-strong`.
- All `--portal-*` names are compatibility aliases to semantic tokens (removal remains Phase 4).
- Cleaned hardcoded colour utilities across 38 files: no remaining `bg-white`, `text-white`, `border-white`, `indigo-*`, `emerald-*`, or `amber-*` references.
- Fixed the active-badge dark-mode defect in `AdminShell`, `BoosterShell`, and `ModerationClient`; fixed the `visibility-journey` white panel; tokenized auth/marketing gradient overlays.

### Tooling
- Added scripts: `typecheck`, `test`, `db:backup`, `db:migrate`, `backfill:money`, `ledger:smoke`, `verify:phase1`.
- `.gitignore` now excludes `/backups/`.

---

## 2. Verification evidence

| Check | Result |
|---|---|
| Database backup before migration | 43 tables / 282 rows written to `backups/` (gitignored) |
| Prisma schema validate/generate | Passed |
| Migration apply | Baseline recorded, Phase 1 applied |
| Backfill dry run | 60 legacy rows across 15 columns |
| Backfill apply | 60 rows written, 0 mismatches |
| `npm run verify:phase1` | All checks passed |
| `npm run ledger:smoke` | Passed; idempotent replay returned the same transaction; test rows cleaned up |
| `npm run typecheck` | Passed |
| `npm test` | 43/43 passed |
| `npm run build` | Passed (Next.js 16.4.5, Turbopack) |

---

## 3. Files added

- `src/lib/money.ts`
- `src/lib/ledger.ts`
- `src/lib/session-context.ts`
- `src/server/ledger/index.ts`
- `scripts/backup-database.ts`
- `scripts/backfill-money.ts`
- `scripts/ledger-smoke.ts`
- `scripts/verify-phase1.ts`
- `prisma/migrations/20261124000000_baseline/migration.sql`
- `prisma/migrations/20261124120000_phase1_foundation/migration.sql`
- `prisma/migrations/migration_lock.toml`
- Tests: `money.test.ts`, `ledger.test.ts`, `session-context.test.ts`

## 4. Files modified

- `prisma/schema.prisma`
- `src/lib/session.ts`, `src/lib/auth.ts`, `src/lib/types/dto.ts`, `src/lib/format.ts`
- `src/server/actions/account.ts`, `src/server/data/finance.ts`
- `src/app/globals.css`
- 38 UI files for token cleanup (shells, portal pages, auth, marketing components)
- `package.json`, `.gitignore`

---

## 5. Deliberate deferrals

These do **not** block Phase 2 and are tracked so a fresh session does not assume they are done.

1. **Legacy `Int` is still the UI read source.** Minor-unit columns are backfilled and `MoneyDTO` fields now exist on finance views, but screens still render legacy `amount`/`budget` numbers. The read cutover happens with the Phase 2 wallet rebuild so behaviour changes once, not twice.
2. **`requireContext` is available but not yet applied to every route.** Existing `requireAdmin`/`requireStaff` guards remain in place. Route adoption belongs to Phase 2 (wallet) and Phase 4 (settings/switching).
3. **Theme preference is not yet synced to the account.** `User.themePreference` exists; the toggle still uses `localStorage`. Server-side theme persistence and flash-free first paint are Phase 4.
4. **`--portal-*` aliases remain.** Removing them before all 1,213 usages migrate would break the portal. Removal is Phase 4.
5. **ESLint is not installed.** The repo has no ESLint dependency or config. Adding it now would surface pre-existing debt and expand Phase 1. Current gate is `typecheck` + unit tests + build; lint and Playwright belong to Phase 6.
6. **No automated E2E yet.** The ledger integration smoke script covers the DB path; browser E2E starts in Phase 6.
7. **Provider spike still blocked.** No Yellow Card sandbox credentials. Phase 2 provider work cannot start until they are issued.

---

## 6. How to re-run

```bash
npm run db:backup        # only needed before future migrations
npm run db:migrate       # applies pending migrations
npm run backfill:money   # dry run
npm run backfill:money -- --apply
npm run verify:phase1
npm run ledger:smoke
npm run typecheck
npm test
npm run build
```

## 7. Rollback

The migration is additive; no existing column, row, or table was removed. If a rollback is required:
1. Restore the affected tables from `backups/advers-<timestamp>.json` or the provider's point-in-time backup.
2. Drop the Phase 1 tables (`LedgerLine`, `LedgerTransaction`, `LedgerAccount`, `FxQuote`, `ProviderEvent`) and new columns only after restoring.
3. Re-run `npm run db:migrate` after fixing the migration; do not edit an applied migration file.
