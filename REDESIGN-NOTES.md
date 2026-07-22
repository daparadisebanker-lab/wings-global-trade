# REDESIGN-NOTES.md — TOWER macOS Shell migration

Visual/decision log for the TOWER-REDESIGN.md migration, merged with the
IA/UX “Path to 100” plan. One section per phase. Newest first.

Ratified direction (2026-07-22): **Option C — full adoption, law updated
ecosystem-wide** (see `DECISIONS.md` → “macOS material adoption”, and the
amendments to root `CLAUDE.md` §1.6 and §2). Additive only: wrap, don’t
rewrite; zero feature regression.

---

## PT — Typography split: Inter (the tool) / Wings faces (the artifacts)  ·  status: built, in review

User ruling (via `/brand-universe`): the **TOWER app** moves to **Inter** (clean,
macOS-native, self-hostable, owns its numerals); the **generated brand artifacts**
— ficha técnica · cotización · proforma · container share images — **keep the Wings
Global Trade current fonts**. Numerals = the grotesque's own tabular figures.
**Scope: TOWER-only for now** (no CLAUDE.md §2 amendment yet; a later ecosystem
ratification is the separate, bigger call).

**Grounding (verified, not assumed):** "the Wings current fonts" = **NissanOpti
(display) + Flexo (body) + Teko (numerals)** — the *intentional* brand system, live
on `apps/site` and codified in `packages/liveries/wings/livery.css`. Not TOWER drift.
(The deeper question — is NissanOpti the right *owned* Wings face long-term — is a
brand-level conversation, explicitly parked.)

**Architecture — a token split, all in `apps/tower/src/app/globals.css`:**
- Added a self-hosted **Inter** variable `@font-face` (OFL, Fontsource;
  `public/fonts/inter/inter-variable-latin.woff2`, weight axis 100–900).
- Repointed the app defaults `--font-display / --font-ui / --font-mono` → **Inter**.
  App numerals get Inter's tabular figures for free via the pre-existing
  `[data-app='tower'] .font-mono, [data-numeric] { font-variant-numeric: tabular-nums }`
  rule — so Directive 5 ("numerals are brand assets, fixed-width") is now *actually*
  met (Teko was a condensed display face, never a real tabular set).
- Added a **brand-type override** rule that re-declares the three tokens back to
  NissanOpti/Flexo/Teko at each artifact root, so its whole subtree resolves the
  Wings faces regardless of the app default:
  `.wings-brand-type, .pdoc, .qdoc, .fdoc, .rts, .rbq, .pdoc-page, .qdoc-page, .fdoc-page, .rbqdoc-page`.
- `tailwind.config.ts` — comment/fallbacks updated (utilities already map to the
  tokens; no utility change needed).

**Why the artifacts are safe (verified):**
- The 9 document roots above each re-declare the tokens → Flexo/NissanOpti/Teko.
- The **container share images** (`ContainerPromoPanel` → `@wings/rb-core`
  `buildPromoCardSvg`) **hardcode the faces in-SVG** (`'NissanOpti'`, `'Flexo'`,
  `'Teko'`) and the server raster (`/api/promo-card`) uses `promoFontFiles()` +
  `defaultFontFamily: 'Flexo'`. Both are immune to the app token change; the only
  requirement — keep the brand `@font-face` loaded — is met. `packages/rb-core`
  untouched (and out of scope).
- **Cost sheet** (`.csheet`/`.csheet-page`) deliberately stays Inter: an internal
  margin document, never handed to a client — not in the brand-artifact list.
- TopBar brand mark is the isotipo **image** (`wings-isotipo.webp`), font-agnostic;
  the "WINGS" text is a `font-mono` micro-label (a system label, not the logotype)
  → correctly moves to Inter with the rest of the tool.

**Weight discipline:** Inter variable collapses the 8 static app-weight files to one;
the heavy brand set (NissanOpti/Flexo/Teko) now loads chiefly where a document/share
card renders. Ramp target 400 / 500 / 600.

**Fable review (APPROVE-WITH-FIXES) — applied before commit:**
- **F-PT-1** — the app `--font-mono` fallback was `system-ui,…` → if Inter ever
  failed to load, numeral columns would degrade to *proportional* figures, breaking
  Directive 5 in exactly the failure mode. Fixed to `'Inter', ui-monospace, 'SF
  Mono', Menlo, monospace` (aligned digits guaranteed on any fallback; raw-CSS
  consumers like `mister-dock.css` inherit it too).
- **F-PT-2** — the `globals.css` "Typographic voice" header comment still described
  the pre-split world (Flexo as the UI grotesque). Rewritten to describe the split
  and to mark the NissanOpti/Flexo/Teko `@font-face` set **load-bearing** for the
  in-page promo-card SVG preview (so no future "unused fonts" prune removes them).
- **F-PT-3 (info, no code):** the login card's `font-display` h1 ("Admin Portal")
  was NissanOpti, now Inter — the one brand-forward live text that visibly shifts.
  Legit under the tool-voice ruling (login is app UI). If the serif is wanted back
  there, the sanctioned hook already exists: add `wings-brand-type` to the login
  card. Left as a post-deploy eyeball for the user.

**Deferred / follow-ups:** Inter `<link rel=preload>` (subtle swap from system-ui
fallback — perf nicety, not required); ecosystem-wide ratification of Inter-for-tools
if it proves out; the NissanOpti-ownership brand question.

**Post-deploy QA:** app chrome + tables + Mister + palette render Inter; numerals
stay fixed-width; proforma / cotización / ficha / container-quote documents still
render in Flexo/NissanOpti/Teko (light, even in dark shell); the container share
card preview + PNG/JPG download unchanged; cost sheet in Inter.

---

## P5 — WINGS Control Center (mobile), tap-first  ·  status: reviewed (APPROVE-WITH-FIXES), committing

User chose **tap-first, straight-to-prod** — solid + accessible Control Center now;
the finger-tracked pull-down gesture + top-right pill are a later polish pass (they
need a touch device to tune). Built by restyling the existing mobile drawer (the
`<aside>`, mobile-only after P4b) so it INHERITS the proven a11y contract
(inert-when-closed, focus trap + restore, scrim, ≥44px) — lowest risk.

**What landed**
- `src/shell/control-center/ControlCenter.tsx` — `ControlCenterGrid` (registry-
  driven 2-col module tile grid, TOOLS × `visible` × `useActiveTool`; no new nav
  list; keeps the zero-module empty note) + `ControlCenterStatus` (quick-status
  row: greeting + es-PE date + operator identity + the mobile theme toggle).
- `ThemeToggle.tsx` — now takes a `className` prop (default `hidden md:inline-flex`
  for the TopBar; the Control Center passes `inline-flex` to show it on mobile).
- `layout.tsx` — the bootstrap now honors `prefers-color-scheme` when no stored
  choice exists (the **P2b OS-auto-dark debt**, safe now that dark is escapable on
  BOTH surfaces: desktop TopBar toggle + mobile Control Center toggle).
- `ShellChrome.tsx` — the drawer renders `ControlCenterGrid` (replacing NavRail) +
  `ControlCenterStatus`; NavRail import removed (NavRail.tsx now unused, left in
  place). Below `md` the drawer a11y/trigger (hamburger) is unchanged.

**Three parked debts discharged:** mobile theme toggle ✓ · OS-auto-dark ✓ ·
mobile greeting/identity ✓ (F-P2a-1).

**Two ThemeToggle + two greeting sources, one visible per surface:** desktop →
TopBar toggle + GreetingBar; mobile → Control Center toggle + status row. Shared
`data-theme`/`tower-theme` state, can't disagree.

**Deferred to a later polish pass (needs device testing):** the top-right WINGS
pill, top-anchored panel, and the interruptible pull-down gesture (spec §3.2's
signature). Current trigger = the existing hamburger; current position = the
existing slide-in. Long-press-pill → palette also deferred (search stays via ⌘K /
the hamburger drawer + palette).

**Post-deploy QA:** mobile toggle flips + persists; OS-dark auto-applies on a
dark-OS device and is escapable via the toggle; grid nav + active state; zero-
module empty note on mobile; quick-status greeting/date/identity; dark mode of the
whole drawer; focus trap still cycles the grid tiles + toggle.

**Fable review (APPROVE-WITH-FIXES) — applied before commit:**
- **F-P5-1** — the mobile theme toggle was 40×40; spec §8 requires ≥44px on
  mobile. The size utilities moved out of ThemeToggle's base string into the
  `className` prop (deterministic — `cn` is plain concatenation, no
  tailwind-merge, so a size override must not depend on stylesheet order): default
  `hidden h-10 w-10 md:inline-flex`; the Control Center passes `inline-flex h-11
  w-11`. Desktop byte-equivalent (attribute order is CSS-irrelevant).
- **F-P5-2** — twin toggles snapshotted `data-theme` once on mount, so the hidden
  mobile instance went stale after a desktop toggle + resize below `md`. The mount
  effect now attaches a `MutationObserver` on `<html>` (`data-theme`) and syncs
  local state; disconnects on cleanup. Future-proofs any 3rd instance.
- **F-P5-3** — `.cc-tile` deviated from spec §3.2 (56px/8px/`radius-card-lg`)
  without a logged deviation. Aligned to spec: `min-height: 72px`, grid `gap-3`
  (12px), `var(--radius-panel)`. No deviation remains to log.

**Ledger (reviewer-required honesty notes):**
- **IA — mobile group labels dropped:** the drawer's 3-group nav (Operación ·
  Marca e inteligencia · Sistema) flattens into the spec-§3.2 2-col tile grid.
  Deliberate and spec-sanctioned; the registry's `group` field survives for the
  palette's future use. Recorded so the IA scorecard trail reflects the change.
- **Spec §8 Control Center acceptance line stays OPEN.** Tap-first delivers a
  functional, a11y-inherited Control Center, but does NOT close §8's signature
  (interruptible pull-down gesture, top-right pill morph, top-anchored panel,
  three-way dismiss). The Path-to-100 scorecard must not mark §8 complete on P5.
  When the gesture lands it must be **additive** over this tap-first base (spec:
  "pull down **or** tap"). Deferred: needs a touch device to tune.

**Orphaned, intentionally kept one phase:** `NavRail.tsx` + `NAV_GROUPS` are now
fully unreferenced (every remaining mention is a comment) but retained for
rollback; delete in the P8 sweep with nav.ts's stale header comment. `collapsed`
state stays referenced (button renders nowhere since P4a) — no unused-var; build
is strict-safe (no `noUnusedLocals`).

---

## P4b — Rail retired on desktop + lane switching re-homed  ·  status: SHIPPED to production

User chose the **Dock lane tile + popover** placement (Option 1).

**What landed**
- `Dock.tsx` — a leading lane-stamp tile (tinted by the active lane accent) opens
  the **LaneSwitcher in a popover** (panel material, `--radius-panel`, outside-
  click + Escape close, `role="dialog"`, `aria-haspopup`/`aria-expanded`).
  LaneSwitcher is a **props-passthrough** (`lanes`/`activeLaneId`/`onSelect`) — zero
  internal edits; `--lane-accent` state stays in ShellChrome. Lane tile shown only
  when `lanes.length > 0`. Dock now returns null when the operator has zero
  modules (`tools.length === 0`) so it never shows an empty shell.
- `ShellChrome.tsx` — the `<aside>` gets `md:hidden` **gated on `visible.size > 0`**:
  the desktop rail is retired for normal operators (Dock is the nav), but a
  zero-module operator keeps the aside on desktop for NavRail's designed empty
  note. Below md the aside stays the off-canvas drawer, untouched — the mobile
  focus-trap/inert contract is gated on `isMobile` and never fires on desktop, and
  `md:hidden` keeps the aside in the DOM (`display:none`) so `railRef` stays valid.
  Lane props passed to the Dock; `--lane-accent` flood unchanged.
- `globals.css` — lane stamp + `.mac-dock-lane-pop` popover styles (tokens only).

**Two LaneSwitcher instances, one visible per surface:** desktop → the Dock
popover; mobile → the drawer's (inside the aside). Shared state via ShellChrome.
Reviewer verified exactly one is in the a11y tree per viewport (the other's
surface is `display:none`).

**Review fixes (Fable P4b: APPROVE-WITH-FIXES):**
- F-P4b-1 (applied) — `shown = pinned || revealed || laneOpen`: an auto-hidden
  dock must not slide off while the lane popover is open (crossing the 12px gap
  would fire mouseleave and hide both).
- F-P4b-2 (applied) — lane stamp `border-radius 3px → var(--radius-card)`.

**Post-deploy QA:** lane popover open/close (click, outside-click, Escape); accent
flood still applies on select; multi-lane vs single-lane vs zero-lane; zero-module
operator still gets the rail empty note on desktop; popover in dark mode; keyboard
(Tab into stamp → Enter → focus into LaneSwitcher rows).

---

## P4a — Desktop Dock + rail demotion  ·  status: SHIPPED to production

Orchestrator ruling: Option B refined — P4a = Dock + rail demoted to a "stamp
strip" via ADDITIVE `md:hidden` wrappers (no NavRail/LaneSwitcher/aside internals
edited; mobile drawer pixel-identical). P4b (later) re-homes lane switching +
retires the rail on desktop.

**What landed**
- `src/shell/dock/Dock.tsx` (`'use client'`) — the desktop Dock. Renders ONLY
  from the registry: `TOOLS.filter(visible.has)` split by `section` (core |
  divider | utility) + a ⌘K trigger tile + a pin/auto-hide toggle. Active dot
  from `useActiveTool` (gold). Tiles are `<Link>`s (deep links preserved).
  Desktop-only via `hidden md:flex` (CSS-gated, no hydration wobble).
- `globals.css` — Dock styles: chrome material (opaque-first fallback), 48px
  tiles, `--radius-dock` body / `--radius-control` tiles, `--elevation-3`,
  `--spring-snappy`/`--duration-snappy`, hover magnification (1.18 / neighbours
  1.08 via `+` and `:has`, `(hover:hover)` only), 400ms tooltip, 4px active dot,
  auto-hide slide + 24px summon zone, launcher clearance, reduced-motion → fade +
  no magnification.
- `ShellChrome.tsx` — additive only: `dockPinned` state (persisted `tower-dock`,
  default pinned, read post-mount), `⌘.` keybind, `data-dock-pinned` on root,
  Dock mounted by the palette. Rail demotion via wrappers: NavRail wrapped in
  `md:hidden` **only when `visible.size > 0`** (zero-module operators keep the
  designed empty note on desktop); the rail footer (Mister entry + collapse)
  wrapped `md:hidden`. Content clearance `md:pb-24` pinned / `md:pb-6` auto-hidden
  on `<main>` (mobile untouched).

**Z-ladder (declared):** content(auto) < summon-zone(29) < Dock(30) <
palette-overlay(40) = mobile aside(40) < launcher(45) < palette-content(50).
Dock(30) and mobile drawer-scrim(30) never coexist (Dock desktop / drawer mobile).

**Padding contract:** on `<main>`, `md:` only — mobile has no Dock, no change.
One-time padding settle after hydration for auto-hide users (pin read post-mount)
— accepted.

**Deferrals:** `⌘1–9` tile jumps → P6 (`order` already in registry); lane
switching re-home + full aside `md:hidden` → P4b (needs user input on placement);
`⌘.` vs Safari "stop loading" → preview QA (fallback = P6 palette "Collapse dock").

**Review fixes (Fable P4a: APPROVE-WITH-FIXES):**
- F-P4a-1 (applied) — auto-hide stuck-open bug: the summon zone had `onMouseEnter`
  only. Added `onMouseLeave` on the zone + `onMouseEnter` on the nav so a pointer
  that dips in and back out can't leave the dock stuck open.
- F-P4a-2 (applied) — `.mac-dock` `gap 6px → 4px`: on the 8pt scale AND buys ~25px
  margin so a 13-tile full-admin dock clears a 768px viewport.
- F-P4a-3 (applied) — tooltip `font-size 12px → var(--type-label)`.
- F-P4a-4 (applied) — tile/tooltip `ease` keywords → `var(--ease-settle)` (livery
  convention; reduced-motion `linear` kept).
- F-P4a-5 (applied) — corrected the `.is-hidden` comment (24px summon zone is the
  reveal affordance; no literal 4px peek).

**Post-deploy QA (log results here):** full-admin dock at exactly 768px; `⌘.` in
Safari (stop-loading collision); auto-hide reveal/leave cycles; magnification in
Firefox <121 (previous-neighbour degrades gracefully); dock in dark mode; launcher
clearance pinned vs auto-hidden.

**Preview note:** orchestrator recommends preview + user sign-off (largest desktop
interaction change). User's standing policy is straight-to-prod on Fable approval;
proceeding to prod on approval, rollback available if anything reads wrong.

---

## P2b — Nightwatch (dark) + theme toggle  ·  status: SHIPPED to production

The first big *visible* change. Deployed to preview and reviewed BEFORE production
(the user-agreed exception to the auto-deploy loop).

**What landed**
- `globals.css` — full `[data-app='tower'][data-theme='dark']` re-point of the core
  livery (`--surface-0/1/2`, `--ink-primary/secondary`, `--line`, `--accent/accent-ink`,
  `--gold/gold-ink`, `--positive/negative`, `--stamp`, `--scrim`) PLUS explicit dark
  values for the premium/tile set (`--premium-ground/chrome`, the three
  `--premium-*-shadow`, `--premium-tile`, `--tile-ink(-muted)`, `--tile-positive/negative`)
  — never composed, because they mix from `--ink-primary` which is now light and
  would invert. `color-scheme: dark`.
- `components/shell/ThemeToggle.tsx` + mounted in TopBar (right cluster). Writes the
  `tower-theme` key (P1 bootstrap contract); flips `data-theme` instantly; renders
  after mount (no hydration mismatch); `aria-pressed` + labeled + gold focus ring.
- Document/print exemption: verified by grep that the document CSS
  (proforma/quote/ficha/cost-sheet/rb) uses ZERO livery color tokens — they are
  self-scoped hardcoded light palettes, so dark cannot reach them. Added defensive
  `color-scheme: light` on the document page frames.

**Design decision — inverted primary.** As in light (where `--accent == --ink-primary`
= navy), dark keeps them equal (`#f5f5f7`): a primary button is a light fill with
dark ink. High-contrast, macOS-appropriate; the gold jewel carries brand colour.

**Deferrals (logged, deliberate):**
- **OS-preference auto-dark deferred to P5.** The bootstrap stays explicit-only
  (no `prefers-color-scheme` fallback yet). Reason: the toggle is desktop-only in
  P2b (per the reviewer, mobile waits for the P5 Control Center) — so if OS-dark
  auto-applied, a dark-OS mobile user would be stuck with no way out. Dark must be
  escapable everywhere before it can be automatic. P5 mounts the mobile toggle AND
  turns on the OS fallback together.
- Mobile toggle → P5 Control Center quick-status row.

**Contrast spot-check (WCAG AA; full matrix pending on preview):**
`ink-primary #f5f5f7` on `surface-0 #1c1c1e` ≈ 15:1 ✓ · `ink-secondary #9a9aa2` on
`surface-0` ≈ 6.2:1 ✓ · `gold #e0b866` on `surface-0` ≈ 9.6:1 ✓ (emphasis/large) ·
`accent-ink #17171a` on `accent #f5f5f7` ≈ 16:1 ✓ · `gold-ink #1a1c1f` on `gold` ≈ 9:1 ✓.
PENDING on preview: every LaneSwitcher lane-accent against dark surfaces; `/login`
hero+scrim legibility in dark; positive/negative chips on dark rows; the full
375/768/1440 × both-theme × (table · board · form · document · /login) matrix.

**Review fixes (Fable P2b: APPROVE-WITH-FIXES; both sequencing calls accepted):**
- F-P2b-1 (applied) — dark `--negative` lifted `#e0564a → #ec7b72`: the old value
  passed on `surface-0` but FAILED AA (~3.8:1) on `surface-1/2`, where negative
  text (failed QC, expired, negative deltas) actually renders. Now ≈5.2:1 on
  surface-1. `--tile-negative` re-derives (var-based).
- F-P2b-2 (applied) — doc `color-scheme: light` selector corrected
  `.rbqdoc-annex → .rbqdoc-page` (the actual marcas-cotización page frame).
- F-P2b-3 (applied) — ThemeToggle renders an invisible same-footprint placeholder
  pre-mount instead of `null`, so the TopBar cluster doesn't shift on hydration.
- Coverage-ledger exemption: `--texture` (value `none`, colorless) has no dark
  counterpart — nothing to re-point. `--lane-accent` auto-re-points via
  `var(--accent)`; per-lane inline accents parked in the preview QA matrix.

**Why preview-only:** dark is now reachable on a live app. Holding production until
the preview QA matrix + user review pass (F-P2a-2 scroll check rides along).

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
