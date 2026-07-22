# REDESIGN-NOTES.md — TOWER macOS Shell migration

Visual/decision log for the TOWER-REDESIGN.md migration, merged with the
IA/UX “Path to 100” plan. One section per phase. Newest first.

Ratified direction (2026-07-22): **Option C — full adoption, law updated
ecosystem-wide** (see `DECISIONS.md` → “macOS material adoption”, and the
amendments to root `CLAUDE.md` §1.6 and §2). Additive only: wrap, don’t
rewrite; zero feature regression.

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
