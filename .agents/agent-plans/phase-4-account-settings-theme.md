# Phase 4 — Account Settings, Switching & Theme: Completion Note

**Date:** 2026-11-25
**Status:** Core complete. External blockers: email delivery provider and manual contrast QA.

---

## 1. What shipped

### Profile settings
- Username with format validation and uniqueness check.
- Avatar URL and preview.
- Name, phone, company (existing) preserved.
- Email change request with current-password check, 24-hour token, confirmation page, and email-verified timestamp.
- Password change with current-password check, strength rules, and `sessionVersion` increment to revoke other sessions.
- Theme preference: `LIGHT`, `DARK`, `SYSTEM`, stored on `User.themePreference` and mirrored to the theme cookie.
- Danger zone: deactivate account, request deletion with reason. Both require password + explicit confirmation, sign the user out, and notify admins for deletion.

### Account switching
- Reusable `AccountContextSwitcher` in the advertiser sidebar and Booster sidebar.
- Settings card showing current context, linked accounts, switch action, and public AdBooster profile link.
- `Create AdBooster account` link when the user has no Booster profile.
- Switching re-verifies the target account server-side through `switchAccountContextAction`; admin sessions cannot switch.
- `npm run seed:dual-role` creates a Booster profile for `client@advers.ng` so the switcher can be demoed.

### Theme
- `ThemeToggle` now accepts the signed-in user's preference and persists changes through `updateThemePreferenceAction`.
- Theme preference card in settings.
- Token audit: no remaining hardcoded `bg-white`, `text-white`, `indigo-*`, `emerald-*`, `amber-*` or hex colours in TSX surfaces.
- All shells pass the user's preference to the toggle.

### Migration
- `20261125170000_phase4_account_settings`:
  - `User.deletionRequestedAt`
  - `EmailChangeRequest` table (hashed token, expiry, single use).
- Applied after a fresh database backup.

---

## 2. Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | **76/76 passed** |
| `npm run build` | Passed |
| `npm run seed:dual-role` | Dual-role demo created for `client@advers.ng` |
| `/portal/settings` | 200; “Account experience” and “Danger zone” render |
| `/portal/settings/email/confirm?token=bad` | 200; invalid-token state renders |
| `/portal/settings` (dual-role client) | 200; “Switch to AdBooster” renders |
| `/booster` (BOOSTER context) | 200; “Switch to Advertiser” renders |
| `prisma migrate status` | Up to date |

Note: the build needed the dev server stopped because Prisma’s Windows query-engine DLL was locked.

---

## 3. Files added

- `src/app/(portal)/portal/settings/{AccountExperienceCard,ThemePreferenceCard,EmailChangeCard,PasswordCard,DangerZoneCard}.tsx`
- `src/app/(portal)/portal/settings/email/confirm/page.tsx`
- `src/components/AccountContextSwitcher.tsx`
- `scripts/seed-dual-role.ts`
- Migration: `20261125170000_phase4_account_settings`

## 4. Files modified

- `prisma/schema.prisma`
- `src/server/actions/account.ts`
- `src/components/ThemeToggle.tsx`
- `src/app/(portal)/PortalShell.tsx`, `src/app/booster/BoosterShell.tsx`, `src/app/(admin)/AdminShell.tsx`
- `src/app/(portal)/portal/settings/{page.tsx,SettingsClient.tsx}`
- `package.json`

---

## 5. Deferrals and blockers

1. **Email delivery provider** — the verification link is returned in development and stored as a notification row; production needs Resend/SES wiring.
2. **Logged-out email confirmation** — the login flow does not preserve the `next` verification URL, so a user must be signed in before opening the link. Fix in Phase 6 auth polish.
3. **Theme first-paint** — cross-device preference is applied after hydration via `ThemeToggle`; a server-rendered theme script is still needed to eliminate any flash.
4. **Contrast QA** — automated token audit passed; manual WCAG AA checks in both themes remain for Phase 6.
5. **Avatar uploads** — URL only; real uploads belong to Phase 5 media.
6. **Account deletion** — records a request and deactivates; hard deletion is a support/finance process.
7. **Device/session list** — only `sessionVersion` revocation exists; no per-device session management UI.
8. **Booster onboarding** — “Create AdBooster account” links to the profile editor; no dedicated inline wizard yet.
9. **Route-level context enforcement** — booster routes still use `requireUser`; a USER with a Booster profile can view their own Booster data without switching. This is same-user data, not a privilege escalation, but a stricter redirect can be added later.

---

## 6. How to run

```bash
npm run db:migrate
npm run seed:dual-role
npm run typecheck
npm test
npm run build
npm run dev
```

Demo:
- `client@advers.ng` → `/portal/settings` → switch to AdBooster, save theme, change password, request email change.
- `booster@advers.ng` → `/booster` → switch to Advertiser (only if a client account is linked).
