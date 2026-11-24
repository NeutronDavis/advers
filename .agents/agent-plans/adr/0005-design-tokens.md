# ADR-0005: Unified Design Tokens

**Status:** Proposed — pending palette sign-off
**Date:** 2026-11-24
**Deciders:** Product, Design, Engineering

## Context

The codebase contains three visual identities:
1. Marketing/auth/onboarding: indigo/violet hex values (`#4f46e5`, `#3525cd`, `#712ae2`).
2. Advertiser portal: the obsidian/gold `--portal-*` set (1,213 usages) with a dark override block.
3. Booster and admin shells: daisyUI semantic classes (`bg-base-100`, `text-primary`), which resolve to the indigo daisyUI theme.

`ThemeToggle` sets `data-theme` on `<html>` and persists to `localStorage`; a `beforeInteractive` script applies it on load. The mechanism works, but surfaces painted with `bg-white`, `text-white`, hardcoded hex, or the wrong token family do not follow it. Audit details and counts are in `.agents/agent-plans/phase-0/token-inventory.md`.

The brief requires one approved palette, consistent typography/spacing/radii/states, and reliable Light/Dark across all experiences, persisted across devices where account settings allow.

## Decision

1. **Obsidian/gold is canonical** (D-06 recommendation). It is the most distinctive identity and is already the portal standard.
2. **One token source** in `src/app/globals.css`: a single `@plugin "daisyui/theme"` block per mode, mapping brand values onto daisyUI semantic tokens. No second palette.
3. **Brand mapping:**
   - `base-100` = page background, `base-200` = card/surface, `base-300` = border/muted surface, `base-content` = text.
   - `primary` = ADVERS gold, `primary-content` = obsidian (not white).
   - `neutral` = obsidian (`#101113` light, `#131b2e` dark), `neutral-content` = off-white (`#f8fafc` both). Keeping neutral dark in both modes preserves the obsidian card identity; do not flip it to white in dark mode.
   - Functional colours (success/warning/error/info) remain semantic and theme-aware.
4. **Compatibility bridge.** Keep `--portal-*` as aliases to canonical tokens during migration so all 1,213 existing usages continue to work. Remove aliases at the end of Phase 4, not before.
5. **No hardcoded colour utilities** in changed surfaces. `bg-white`, `text-black`, `bg-[#...]`, and raw palette scales are defects for any surface touched after Phase 1.
6. **Opacity via tokens.** Prefer `color-mix(in oklab, var(--token) 10%, transparent)` for alpha variants so both themes behave correctly.
7. **Component states are tokens too:** hover, active, focus ring, disabled, selected, skeleton, overlay, and inverse text.
8. **Theme persistence:**
   - `localStorage` for instant first paint (existing behaviour),
   - `User.themePreference` (`LIGHT` | `DARK` | `SYSTEM`) for cross-device,
   - server-rendered `data-theme` when signed in to avoid a flash,
   - `SYSTEM` respects `prefers-color-scheme` and is the default for new users.
9. **Accessibility:** WCAG AA contrast for body text and interactive labels in both modes; visible focus rings on gold, obsidian, and card surfaces; no colour-only status communication.
10. **Typography/spacing/radii** are defined once (Plus Jakarta Sans already loaded; keep it) and exposed as tokens/utilities rather than per-page overrides.

## Consequences

- Positive: one identity, predictable theming, less CSS, easier QA.
- Positive: compatibility aliases allow incremental migration without a flag day.
- Negative: the indigo marketing identity is retired; marketing pages need visual review.
- Negative: `primary` becomes gold, so any component assuming white text on primary must switch to `primary-content` (obsidian). This is a broad but mechanical change.
- Risk: gold as a large-surface colour can reduce readability; use it for actions/accents, not body backgrounds.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Indigo/violet canonical | Portal's 1,213 obsidian/gold usages would all need rewriting; loses the stronger brand identity |
| Keep both palettes scoped by area | Directly contradicts the brief's "one approved palette" |
| CSS-in-JS theme provider | Adds runtime and migration cost; daisyUI + CSS variables already solve it |

## Open questions

- D-06 sign-off on obsidian/gold.
- Whether `secondary` stays violet for accent variety or becomes a warm neutral (recommendation: warm neutral/graphite).
- Whether a `SYSTEM` default is acceptable for the marketing site (recommendation: yes).
