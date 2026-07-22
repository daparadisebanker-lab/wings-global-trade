# REDESIGN-NOTES.md — TOWER macOS Shell migration

Visual/decision log for the TOWER-REDESIGN.md migration, merged with the
IA/UX “Path to 100” plan. One section per phase. Newest first.

Ratified direction (2026-07-22): **Option C — full adoption, law updated
ecosystem-wide** (see `DECISIONS.md` → “macOS material adoption”, and the
amendments to root `CLAUDE.md` §1.6 and §2). Additive only: wrap, don’t
rewrite; zero feature regression.

---

## P2a — Shell frame (page transition + greeting bar)  ·  status: built, in review

Frame only — NO theme toggle (the reviewer's P2a/P2b split; the toggle + full
dark re-points ship as P2b).

**What landed**
- `apps/tower/src/shell/frame/GreetingBar.tsx` — a slim top strip: time-of-day
  greeting + today's date (es-PE) + operator identity (`userEmail`). Real data
  only; time-sensitive values computed after mount (neutral "Hola" + no date on
  SSR/first paint) so there is no hydration mismatch.
- `globals.css` — `--duration-page: 200ms` token + `.mac-page` page-transition
  (200ms fade + `translateY(8→0)`, transform+opacity only). Reduced-motion
  redefines the keyframe to opacity-only at 80ms linear.
- `ShellChrome.tsx` — additive wrap: `<GreetingBar>` inserted below TopBar; the
  content `<main>` gains `key={pathname}` + `.mac-page` so the transition replays
  on navigation. The rail, TopBar, Breadcrumb, RouteProgress, OnboardingBanner,
  Mister dock/launcher, drawer a11y machinery — all untouched. NavRail remains
  the working nav until the P4 Dock.

**Deliberate deferrals (logged)**
- **Ground swap deferred.** The macOS `--surface-base` (#F5F5F7) ground is NOT
  applied yet — the content keeps the existing warm-white `--premium-ground`.
  The ground/material adoption lands in the P8 sweep with the material cards, so
  P2a stays additive (only the greeting strip + a subtle page-in animation are
  visible). Avoids flattening the designed premium gradient before it's QA'd.
- No Dock content-padding (96px) — that is P4's job.

**Visible deltas this phase:** a new greeting strip below the top bar **(desktop
only, `md+`)**; a 200ms page-in animation on route change (opacity-only under
reduced-motion).

**Review fixes / notes (Fable P2a: APPROVE-WITH-FIXES):**
- F-P2a-1 (applied) — GreetingBar is `hidden md:flex` (desktop only). Three
  stacked strips would have eaten ~140px of a 390px viewport, undoing the mobile
  work in `f44cde2`. Mobile greeting/identity arrives with the **P5 Control
  Center** quick-status row (spec §3.2), not a persistent mobile strip.
- F-P2a-2 (runtime check, PENDING) — with `<main key={pathname}>` remounting on
  navigation + a 200ms entrance, browser Back/Forward scroll restoration must be
  confirmed on the deployed build (navigate deep into /catalog → open a record →
  Back → scroll restores). Next's scroll restoration should re-apply; verify and
  record here. Not statically verifiable.
- F-P2a-3 (tripwire, no change) — while `.mac-page` animates, `<main>`'s
  `transform` is the containing block for any `position: fixed` descendant.
  Safe TODAY (all fixed UI lives in the shell outside `<main>`; page content uses
  only `sticky`). RULE for P8 + future features: any fixed-position UI rendered
  inside page content must be portaled, or it mispositions for 200ms after each
  navigation.

---

## P3 — Navigation registry + useActiveTool  ·  status: reviewed (APPROVE-WITH-FIXES), committing

The one source of truth (TOWER-REDESIGN §5, "one registry" DoD gate).

**What landed**
- `apps/tower/src/shell/navigation/registry.ts` — the canonical `TOOLS` array
  (the 11 modules, enriched with ES+EN `keywords`, `section` derived from `group`,
  `order`) PLUS the palette destinations/actions previously hardcoded in
  `CommandPalette` (`SELF_DESTINATIONS`, `ADMIN_DESTINATIONS`, `ADMIN_ACTIONS`, and
  the two disabled placeholders as `EVERYONE_ACTIONS`). `label: Localized`,
  `icon` stays a key (React-free, server-safe data module), plus a pure
  `resolveActiveTool(pathname)`.
- `apps/tower/src/shell/navigation/useActiveTool.ts` — `'use client'` hook, the
  SOLE active-route derivation now (segment-aware: `=== href || startsWith(href+'/')`).
- `lib/nav.ts` — `MODULES` now `= TOOLS` (re-export; zero call-site churn). Types +
  `NAV_GROUPS` stay here (group metadata, migrates to the registry in P4 when the
  Dock consumes `section`).
- Consumers rewired: `NavRail` active state + `ShellChrome` Breadcrumb both read
  `useActiveTool` (the two duplicated `pathname.startsWith` derivations removed);
  `CommandPalette` renders 100% from the registry.

**Review fixes applied (this commit)**
- F-P3-1 — this log entry.
- F-P3-2 — `keywords` wired into the palette `value` strings (modules read
  `TOOLS` directly for the typed field), so ⌘K search benefits now, not in P6.
- F-P3-3 — `adminOnly` is now consumed: the two ungated palette renders
  (`SELF_DESTINATIONS`, `EVERYONE_ACTIONS`) filter on `!adminOnly || isGroupAdmin`,
  so the flag can never be inert booby-trap metadata.

**Gate status:** one canonical source (grep-verified); zero consumer regression
(rail groups/labels/tags/empty-state, rbac `visible` filtering, breadcrumb
`/perfil → null → "TOWER"`, admin gating, disabled placeholders all identical);
no runtime import cycle (nav→registry value, registry→nav type-only). `next build`
NOT run locally (no node_modules) — the P2 commit must run a real build/CI.

**Next:** P2 (shell frame) — content surface + page-transition wrapper + greeting
bar, wrapping ShellChrome. Split recommended by review: P2a = frame, NO theme
toggle; P2b = full dark re-points of the core livery tokens + toggle + QA at
375/768/1440. A toggle with partial dark coverage will be BLOCKED.

---

## P1-fix — Fable review corrections + ratified decisions  ·  folded into the P3 commit

Fable pre-commit reviewer verdict on P1 (`cb045fe`): **APPROVE-WITH-FIXES**.
Corrections applied:
- **F1** — `.material-chrome` now leads with an opaque `var(--surface-raised)`
  fallback before the `color-mix` translucency (old engines drop color-mix AND
  backdrop-filter together, which would have left chrome fully transparent). The
  dead `@supports` block removed.
- **F4** — Tailwind key `'ease-exit'` → `'exit'` (the namespace prefixes `ease-`;
  the old key generated `ease-ease-exit`).
- **F5** — reduced-motion `.mac-motion` block now also zeroes `transition-delay`
  / `animation-delay` (so the P4 Dock tooltip's 400ms delay collapses too).
- Added `--duration-snappy/settle/exit` tokens (300/450/180ms) so P4 shell files
  never inline motion-duration literals.

Ratified decisions (logging, per guardrail §9):
- **F2 · ink-collision strategy — DECISION: Wings navy IS TOWER's Daylight ink.**
  We do NOT adopt spec §2.1's `--ink-primary #1D1D1F` / `--ink-secondary #6E6E73`;
  TOWER keeps its brand navy `#001E50` / `#5B6578` as the light-theme ink (guardrail
  §9 — codebase/brand conventions win over spec values). Consequence: the macOS
  layer ships NO ink tokens; new surfaces use the existing `text-ink-primary`.
  Nightwatch (dark) ink/surface/line re-points (`--ink-primary #F5F5F7`, etc.) ship
  in the SAME commit that mounts the theme toggle (P2) — never before — so dark is
  complete when first reachable. The P2 review BLOCKS a mounted toggle without full
  dark coverage.
- **F3 · accepted visual delta** — `text-ink-tertiary` was a latent no-op pre-P1;
  activating it changes the missing-client "—" placeholder in
  `QuotationsWindow.tsx` from inherited navy to `#AEAEB2`. Decorative, almost
  certainly the original author's intent; accepted and logged so the regression
  trail stays honest ("zero visible change" holds except this one cell).
- **Log-only ratifications:** dark `--elevation-1..4` (strengthened shadows) are an
  additive invention, not in spec §2 — ratified. Spec §2.6 SF type stacks
  deliberately NOT adopted (TOWER keeps Flexo/NissanOpti/Teko). Stale comment at
  `globals.css` (“the one deliberate departure from the no-gradients refusal”) is
  now inaccurate post-amendment — swept in P8.

---

## P1 — Token layer + theme plumbing  ·  status: SHIPPED to branch (preview)

**What landed**
- `apps/tower/src/app/globals.css` — the macOS token set added as a **new,
  additive layer** (no existing livery token redefined, so the live app is
  visually unchanged):
  - Color: `--surface-base/raised/sunken`, `--ink-tertiary`,
    `--accent-wings(+hover)`, `--signal-positive/negative/caution`,
    `--line-hairline` — Daylight (light) defaults + a Nightwatch block under
    `[data-app='tower'][data-theme='dark']`.
  - Elevation `--elevation-1..4`; radius `--radius-control/card-lg/panel/dock/pill`;
    spring motion `--spring-snappy/settle`, `--ease-exit`.
  - Materials `.material-chrome / .material-panel / .material-scrim` with a
    `@supports` fallback for no-`backdrop-filter` browsers; reduced-motion
    collapses `.mac-motion` to an 80ms fade.
- `apps/tower/tailwind.config.ts` — new tokens exposed as utilities
  (`bg-surface-base`, `text-ink-tertiary`, `rounded-control/card-lg/panel/dock/pill`,
  `shadow-elevation-*`, `ease-spring-*`). Legacy `rounded-card` (4px) untouched.
- `apps/tower/src/app/layout.tsx` — no-FOUC bootstrap script applies a persisted
  `data-theme` before paint; `suppressHydrationWarning` on `<html>`.

**Deliberate deferrals (safety, pre-QA)**
- **No theme toggle mounted yet.** A control that themes nothing would be a dead
  affordance (the exact anti-pattern the audit flagged). The toggle lands in P2
  with the first macOS shell surface.
- **Dark defaults OFF.** The bootstrap goes dark only on an explicit stored
  choice — never from OS preference yet — so no half-built dark reaches live
  users. “Honor OS on first load” switches on once the component sweep (P8)
  makes dark complete.
- **Colliding names kept safe.** `--radius-card` stays 4px; the macOS 12px card
  radius is `--radius-card-lg` until the sweep migrates usages.
- **Existing surface/ink/line tokens not re-pointed for dark** — that happens in
  the sweep wave, with visual QA at 375 / 768 / 1440.

**Gate check:** additive; no existing token changed; preview build green. The
next phase can consume these tokens on new surfaces in both themes.

**Next:** P3 navigation registry (`src/shell/navigation/registry.ts` +
`useActiveTool`) and P2 shell frame, then the Dock (P4) / Control Center (P5).
