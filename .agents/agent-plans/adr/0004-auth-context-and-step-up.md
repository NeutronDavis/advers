# ADR-0004: Session Context and Step-Up Authentication

**Status:** Proposed — pending sign-off
**Date:** 2026-11-24
**Deciders:** Engineering, Security, Product

## Context

Authentication today is a custom HMAC-signed cookie (`src/lib/session.ts`) containing `sub` and `exp`. `getSession()` re-reads the user on every request and returns `role` (`CLIENT`/`STAFF`/`ADMIN`), `orgRole`, `clientId`, and `profileComplete`. `src/proxy.ts` is an optimistic cookie-presence check; real authorization lives in pages/actions.

AdBooster is not a role — it is a `BoosterProfile` attached to a `User`. A user can therefore be an advertiser (has `clientId`) and a Booster (has a profile) at the same time. `landingPathForAuthenticatedUser()` currently returns `/booster` only when `clientId` is null, so a dual-role user can never reach the Booster experience. The brief requires a toggle/account switcher with separate data, roles, and permissions, and explicitly requires that switching must not bypass authorization.

The brief also requires TOTP 2FA, recovery codes, replacement of a lost authenticator after identity verification, and 2FA for withdrawals. There is currently no 2FA, no rate limiting, no step-up, and no session revocation.

## Decision

1. **Explicit active context in the session.** Add a signed `ctx` claim (`USER` | `BOOSTER` | `ADMIN`) to the session payload. The claim is advisory; the server re-verifies ownership on every request.
2. **Deny-by-default guard.**
   ```ts
   requireContext("BOOSTER") // loads user + boosterProfile, rejects if missing/suspended
   requireContext("USER")    // requires clientId or a user-scoped wallet
   requireContext("ADMIN")   // ADMIN or STAFF per policy
   ```
   Routes and server actions call `requireContext`, not raw role checks.
3. **Switch action.** `switchAccountContextAction(target)`:
   - authenticates the current session,
   - verifies the target context exists and is permitted,
   - reissues the cookie with the new `ctx`,
   - writes an `AuthEvent` and `AuditLog` entry.
   Switching never elevates role; ADMIN is not reachable from a client context.
4. **TOTP.** Add `TwoFactorSecret`: `userId` unique, `encryptedSecret` (AES-256-GCM with a key from env), `confirmedAt`, `lastUsedAt`, `recoveryCodesJson` (bcrypt/argon2 hashes), `disabledAt`. Use a maintained TOTP library; verify with a ±1 time-step window.
5. **Recovery codes.** 10 single-use codes, shown once, hashed at rest, individually invalidated on use. Regeneration requires step-up.
6. **Step-up tokens.** Sensitive actions require a `StepUpToken`: short-lived (5 minutes), single-use, bound to `userId + action + resourceId`, stored server-side (not only in the cookie). Actions: withdraw, add/change payout address, change password, change email, disable 2FA, regenerate recovery codes.
7. **Rate limiting.** Per-user and per-IP limits on login, TOTP verify, step-up, withdrawal, address add, comments/reviews/recommendations, and reports. Backend is pluggable (DB table initially, Redis when available).
8. **Audit.** Every auth event, context switch, 2FA change, step-up, and sensitive action writes `AuditLog` with actor, action, target, and timestamp. Secrets and codes are never logged.
9. **Session hygiene.** Rotate the cookie on login and context switch; support server-side revocation via a `sessionVersion` on `User` or a `Session` table. Add `SameSite=Lax`, `HttpOnly`, `Secure` in production (already present) and a shorter max age for ADMIN contexts.
10. **Recovery without KYC.** If the provider does not supply identity verification, lost-authenticator recovery is support-assisted (registered email + phone + recent transaction evidence) and always requires step-up-equivalent review. This is documented as a support procedure, not an automated bypass.

## Consequences

- Positive: dual-role users work without privilege escalation; the brief's switch requirement is satisfiable safely.
- Positive: withdrawal security is a server-side primitive, not a UI checkbox.
- Negative: a session-format change invalidates existing cookies (acceptable; users re-login).
- Negative: step-up adds friction to withdrawals and address changes (required by the brief).
- Operational: support needs a documented recovery runbook and audit review.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Add `BOOSTER` to `Role` enum | One user could not hold both contexts without duplicate accounts; role checks would still be ambiguous |
| Separate login for Booster | Brief explicitly wants one login with a switcher |
| Client-side 2FA gate before calling the action | Trivially bypassed; 2FA must be enforced server-side |
| Long-lived "2FA passed" cookie | Replayable; use bound, single-use, short-lived step-up tokens |

## Open questions

- Whether ADMIN/STAFF should also support TOTP in v1 (recommendation: yes for ADMIN, optional for STAFF).
- Whether to introduce a `Session` table now or keep stateless cookies + `sessionVersion` (recommendation: `sessionVersion` now, table when device management is needed).
