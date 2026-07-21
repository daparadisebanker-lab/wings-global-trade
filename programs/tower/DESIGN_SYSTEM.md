# TOWER · DESIGN_SYSTEM.md — The Control-Room Livery

TOWER inherits the frozen skeleton (Tier-1 primitives, organs, motion curves) from the ecosystem CLAUDE.md. This file defines only what is TOWER-specific.

## The livery

TOWER is the seventh identity — internal, never public. Where lanes are painted for their cargo, TOWER is painted for **vigilance**: the room where every lane is watched at 03:00.

```css
[data-app="tower"] {
  --surface-0: #101214;      /* graphite — the room */
  --surface-1: #16191C;      /* raised panel */
  --ink-primary: #E8EAED;
  --ink-secondary: #9AA0A6;
  --line: #26292D;
  --accent: #FFB020;         /* signal amber — attention, pending, in-motion */
  --positive: #37B26C;       /* radar green — cleared, passed, filled */
  --negative: #E5484D;       /* alarm — failed QC, over-capacity, expired */
  --stamp: #E8EAED;
  --texture: none;           /* the control room is textureless; data is the texture */
}
```

**The active-lane tint rule:** the chrome never changes, but the active lane's accent colors its stamps, chart series, and status chips. Machinery's queue reads cyan inside the graphite; Interiors' reads brass. Operators feel the lane without leaving the room. (Implementation: `--lane-accent` set by LaneSwitcher; components use it only for stamps/series/chips — never surfaces.)

## Typography

Shared UI grotesque for labels/nav; **tabular mono is the dominant voice** — every quantity, CBM, currency, code, timestamp. Display sizes are rare in TOWER; when used (LanePulse headline numbers), they are mono numerals at scale — the control-room's one moment of tension per screen.

## Density & spacing

Operational density: base row height 40px, compact 32px toggle on all ManifestTables. 8-pt grid holds. Radius 0–2px. Panels separated by `--line` rules, not shadows — shadows are for consumer software; rules are for instruments.

## Status language (one vocabulary, everywhere)

Stamped chips, uppercase mono, dot + label:
`DRAFT` neutral · `IN_REVIEW` amber · `PUBLISHED / PASS / CLEARED / CONFIRMED` green · `RETIRED / CANCELLED` muted strikethrough · `FAIL / OVER-CAPACITY / EXPIRED` alarm · in-motion states (`FILLING`, `IN_TRANSIT`) amber with a slow 2s pulse (the only ambient animation permitted).

## Charts

Recharts restyled: thin 1px series, no gradients, no area fills above 8% opacity, mono axis numerals, `--line` grid. Funnel edges annotated with conversion %. Every chart answers one question; if a chart needs a legend of more than 4 items, it is two charts.

## Motion

`--ease-settle` for panel/detail reveals (150–200ms), `--ease-gantry` for lane switches (the stamp rail floods, 300ms — faster than the public 600ms; operators switch constantly). No page transitions otherwise. `prefers-reduced-motion`: pulses and floods off.

## The refusals (TOWER edition)

No dashboards-as-wallpaper (every metric must have an owner and an action), no skeleton shimmer (instrument panels appear laid-out or not at all), no emoji in status language, no third accent color — amber and green carry everything, alarm red is spent only on true failure states so it never inflates.

## Premium ground (Tier-2 amendment · 2026-07)

Two reconciliations, both shipped and both TOWER-scoped (`[data-app='tower']` only — lanes and the public site never inherit them):

1. **Livery.** TOWER ships on the light **Wings house identity** (warm-white ground · navy ink · gold jewel), not the dark graphite/amber register sketched at the top of this file. The dark "control-room" remains a retired direction; the tokens of record live in `apps/site/globals.css` under `[data-app='tower']`.
2. **Premium ground.** The earlier "no soft shadows / no gradients" refusal is amended to a rule, not a ban: **depth lives in the atmosphere, never behind the data.** Gradient + light are permitted on the *ground*, the *chrome* (rail, top bar), and *moment* surfaces (metric tiles, hero/empty states). The *data layer* — tables, rows, status chips, numerals, cost sheets — stays flat, ruled and tabular. Implemented as `--premium-*` tokens + `.tower-*` utilities built from existing tokens (no raw brand hex), so it swaps and reverts cleanly. Cards soften to 2–4px; structural radius stays 0.

## Accessibility

All status conveyed by label + dot shape, never color alone. Contrast: amber/green/alarm all verified ≥4.5:1 on both surfaces. Full keyboard: every board and table navigable; ⌘K reaches everything.
