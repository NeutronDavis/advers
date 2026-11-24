# Phase 0 — UI Token Inventory

**Date:** 2026-11-24
**Scope:** `src/**/*.{ts,tsx,css}`
**Method:** regex scan for Tailwind palette utilities, hex colours, `rgba()/hsl()`, `var(--portal-*)`, and `var(--color-*)`. Counts are raw occurrences, not unique classes.

---

## 1. Headline numbers

| Signal | Occurrences | Interpretation |
|---|---:|---|
| `var(--portal-*)` | **1,213** | The advertiser portal is already token-driven. This is the strongest asset for unification. |
| Hardcoded Tailwind palette classes | **189** | Mostly `text-white` on dark brand cards; a small number are genuine dark-mode defects. |
| Hardcoded hex colours | **124** | 99 are inside `globals.css` (theme definitions, acceptable). 25 are in pages/components and encode the *indigo* identity. |
| `rgba()/hsl()` | **25** | Mostly `globals.css` and two widget gradients. |
| `var(--color-*)` | **11** | Admin charts + `globals.css`; the daisyUI semantic system is barely used. |

**Conclusion:** the platform currently has **three visual identities**:
1. **Marketing / auth / onboarding** — indigo/violet (`#4f46e5`, `#3525cd`, `#712ae2`).
2. **Advertiser portal** — obsidian/gold (`--portal-*`).
3. **Booster + admin shells** — daisyUI semantic tokens, which resolve to the indigo palette.

That is why the theme toggle appears "broken": it works at the `data-theme` level, but surfaces are painted with three unrelated palettes.

---

## 2. Hardcoded class breakdown

| Class | Count | Where | Verdict |
|---|---:|---|---|
| `text-white` | 117 | Dark hero cards, buttons on obsidian/indigo, marketing sections | Mostly legitimate contrast, but must become `--color-*-content` so it follows the theme |
| `bg-black` | 23 | Hover states on gold/obsidian buttons | Replace with `--color-neutral` or a `--color-action-hover` token |
| `border-white` | 16 | Glass cards / dark overlays | Replace with `--color-neutral-content` at low alpha |
| `bg-white` | 13 | Active badges in admin/booster shells, marketing circles, `visibility-journey` panel | **Genuine dark-mode defects** — `bg-white` stays white in dark mode |
| `text-amber-*` / `bg-amber-*` | 6 | Star ratings / warnings | Map to `--color-warning` |
| `bg-emerald-*` / `text-emerald-*` | 13 | Success states, positive deltas | Map to `--color-success` / `--color-success-strong` |
| `text-indigo-*` / `bg-indigo-*` / `shadow-indigo-*` | 6 | Login shield, admin user action, projects grid | Map to `--color-primary` |
| `from-slate-*` / `via-slate-*` / `border-slate-*` / `text-slate-*` | 6 | Project image gradient, visibility journey | Map to neutral surface tokens |

### High-risk defects to fix first

| File:line | Current | Problem | Replacement |
|---|---|---|---|
| `src/app/(admin)/AdminShell.tsx:196` | `bg-white text-primary` | Active badge is white in dark mode | `bg-[var(--color-base-100)] text-[var(--color-primary)]` |
| `src/app/booster/BoosterShell.tsx:185` | `bg-white text-primary` | Same defect | Same |
| `src/app/visibility-journey/page.tsx:151` | `bg-white/90`, `border-slate-200/80` | White panel in dark mode | `bg-[var(--color-base-200)]/90`, `border-[var(--color-base-300)]` |
| `src/app/(auth)/layout.tsx:21` | `#0b0f19` | Hardcoded dark background; will not follow theme | `var(--color-neutral)` |
| `src/app/contact/page.tsx:205,217` | `bg-white text-[#3525cd]` | Fixed white circles on indigo | `bg-[var(--color-primary-content)] text-[var(--color-primary)]` |
| `src/components/Navbar.tsx:99,174` | `bg-[#4f46e5]`, `hover:bg-[#3525cd]` | Indigo hardcoded | `bg-[var(--color-primary)]`, hover token |
| `src/app/globals.css` | two theme blocks + 30 `--portal-*` values | Duplicate palettes | One canonical block + compatibility aliases |

---

## 3. Hex colours outside `globals.css`

| Hex | Count | Meaning | Action |
|---|---:|---|---|
| `#4f46e5` | 8 | Indigo primary | `var(--color-primary)` |
| `#3525cd` | 14 | Indigo primary-dark / hover | `var(--color-primary-hover)` |
| `#0b0f19` | 5 | Dark page background | `var(--color-base-100)` / `var(--color-neutral)` |
| `#131b2e` | 2 | Dark surface | `var(--color-base-200)` |
| `#eaedff` | 1 | Indigo soft background | `var(--color-primary-soft)` |

All remaining hex values are inside `globals.css` theme definitions and are expected.

---

## 4. Recommended token map

Adopt obsidian/gold as canonical (D-06). Add a temporary compatibility block so pages can migrate incrementally without a flag day.

### Canonical semantic tokens

| Token | Light | Dark | Replaces |
|---|---|---|---|
| `--color-base-100` | `#f5f6f8` | `#0b0f19` | `--portal-bg`, page backgrounds |
| `--color-base-200` | `#ffffff` | `#131b2e` | `--portal-surface`, cards |
| `--color-base-300` | `#e8e9ed` | `#1e293b` | `--portal-line`, borders |
| `--color-base-content` | `#15171b` | `#f8fafc` | `--portal-ink` |
| `--color-neutral` | `#101113` | `#131b2e` | `--portal-obsidian`, `bg-black` |
| `--color-neutral-content` | `#f8fafc` | `#f8fafc` | `text-white` on dark cards |
| `--color-primary` | `#e8b64b` | `#e8b64b` | `--portal-gold`, `#4f46e5` |
| `--color-primary-content` | `#101113` | `#101113` | text on gold buttons |
| `--color-primary-hover` | `#d6a53b` | `#d6a53b` | `--portal-gold-hover`, `#3525cd` hover |
| `--color-secondary` | `#131b2e` | `#a855f7` | indigo/violet accents |
| `--color-success` | `#16845b` | `#4ade80` | `--portal-success`, `emerald-*` |
| `--color-warning` | `#b45309` | `#fb923c` | `amber-*` |
| `--color-error` | `#dc2626` | `#f87171` | `red-*` |
| `--color-info` | `#0284c7` | `#38bdf8` | `sky/blue-*` |

### Compatibility aliases (temporary, removed at end of Phase 4)

```css
:root {
  --portal-bg: var(--color-base-100);
  --portal-surface: var(--color-base-200);
  --portal-surface-muted: var(--color-base-200);
  --portal-soft: var(--color-base-100);
  --portal-ink: var(--color-base-content);
  --portal-body: var(--color-base-content);
  --portal-muted: color-mix(in oklab, var(--color-base-content) 62%, transparent);
  --portal-line: var(--color-base-300);
  --portal-obsidian: var(--color-neutral);
  --portal-gold: var(--color-primary);
  --portal-gold-hover: var(--color-primary-hover);
  --portal-gold-ink: var(--color-primary);
  --portal-success: var(--color-success);
  --portal-error: var(--color-error);
}
```

This keeps all 1,213 existing `--portal-*` usages working while the 189 palette utilities are migrated file by file. It is a bridge, not the destination.

### Class replacement rules

| Legacy | Replacement |
|---|---|
| `bg-white` (surface) | `bg-[var(--color-base-200)]` |
| `bg-white` (active badge) | `bg-[var(--color-base-100)]` |
| `text-white` (on dark brand) | `text-[var(--color-neutral-content)]` |
| `text-white` (on gold) | `text-[var(--color-primary-content)]` |
| `bg-black` | `bg-[var(--color-neutral)]` |
| `bg-black` (hover on gold) | `hover:bg-[var(--color-primary-hover)]` |
| `border-white/10` | `border-[var(--color-neutral-content)]/10` |
| `text-emerald-*` | `text-[var(--color-success)]` |
| `bg-emerald-*` | `bg-[var(--color-success)]` |
| `text-amber-*` | `text-[var(--color-warning)]` |
| `bg-indigo-*`, `text-indigo-*` | `bg-[var(--color-primary)]`, `text-[var(--color-primary)]` |
| `from-slate-950`, `via-slate-950` | `from-[var(--color-neutral)]`, `via-[var(--color-neutral)]` |

Note: Tailwind v4 opacity modifiers on arbitrary CSS variables use `color-mix` and work when the variable resolves to a colour. Verify visually per surface.

---

## 5. Migration order

1. **Tokens first:** add the canonical block + compatibility aliases. No visual change expected.
2. **Shells:** `AdminShell`, `BoosterShell`, `PortalShell`, `Navbar`, `ThemeToggle`. Fix active badges and theme flash.
3. **Auth + onboarding:** `(auth)/layout`, login, signup, accept-invite, portal welcome.
4. **Portal pages:** billing, dashboard, explore, channels, campaigns, wallet, settings, adboosters, influencers, reports, team, support, projects, notifications.
5. **Marketing pages:** home sections, about, contact, visibility-journey.
6. **Remove aliases** and delete the second palette block only after a full visual pass.

---

## 6. Verification checklist

- [ ] Every `bg-white` / `text-black` occurrence is either removed or justified in a comment.
- [ ] `grep` for `#[0-9a-fA-F]{6}` outside `globals.css` returns zero.
- [ ] Both themes on: marketing home, login, portal dashboard, wallet, booster dashboard, admin home.
- [ ] Contrast ≥ WCAG AA for body text and interactive labels in both themes.
- [ ] Focus rings visible on gold, obsidian, and card surfaces.
- [ ] Theme preference persists after logout/login and on a second device.
- [ ] No flash of light theme on first paint when dark is saved.
