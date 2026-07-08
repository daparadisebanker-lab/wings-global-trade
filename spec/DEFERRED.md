# DEFERRED — proposed amendments & founder calibrations

Per the amendment protocol in `WINGS_IMAGE_GENERATION_THESIS.md`: agents
never edit law inline — proposals land here with rationale and artifacts,
and take effect only when the founder ratifies (changelog row + version
bump in the affected document). Resolved items get a **RESOLVED** line,
never deleted.

---

## D-1 · Freeze or shift `--ramp-hot` (collision with error red) — OPEN

**Status:** `#C63A1E` ships marked FROZEN_PENDING_CALIBRATION in
`packages/liveries/mister/ramp.ts`; do not treat as frozen.

**Finding:** the site has no error token — every error surface hardcodes
`#DC2626` (8 sites, see D-3). `--ramp-hot #C63A1E` vs `#DC2626`:
**ΔE2000 = 5.42, OKLCH hue Δ = 5.8°** — perceptually the same red.
Scarcity (CRÍTICO, "quedan N cupos") and failure ("Error al calcular
CIF") would be indistinguishable, which breaks the instrument's
credibility (a hot reading must not look like a malfunction).

**Proposals** (hue toward burnt orange, away from both error red 27.3°
and gold 78.1°):
- **Candidate A `#C34200`** — conservative; ΔE 18.06 / 17.7° vs error red.
- **Candidate B `#B93400`** — recommended; ΔE 22.88 / 20.7° vs error red,
  and more separated from gold (ΔE 27.91) than the original.

**Artifacts:** `packages/liveries/mister/review/ramp-calibration-sheet.png`
(row 3), `packages/liveries/mister/review/collision-report.md`.
**On ratification:** update the t=1.0 stop in `ramp.ts`, run
`pnpm --filter @wings/livery-mister build`, add changelog row to the
thesis (INSTRUMENT COLOR lint `ramp` array changes with it).

---

## D-2 · Ramp midtone interpolation: OKLCH detours through green — OPEN

**Finding:** piecewise OKLCH interpolation (as specified) swings the
azul→warm-white segment through cyan/mint (`t=0.3 → #00ADDD`,
`t=0.4 → #9CD8B2`) because polar interpolation toward a near-neutral
stop inherits its arbitrary hue angle. A thermal reading should not pass
through green — green is not on the instrument's temperature register.

**Proposal:** interpolate piecewise in **OKLab** (rectangular) instead —
desaturates in a straight line through neutral with no hue detour
(`t=0.3 → #559CF4`, `t=0.4 → #A8CAF5`) while still avoiding the muddy
RGB grey the OKLCH mandate was protecting against. One-line change in
`ramp.ts` + regenerate `livery.css`; chroma-floor tests remain valid.

**Artifacts:** `packages/liveries/mister/review/ramp-calibration-sheet.png`
(rows 1 vs 2, judge by eye).

---

## D-3 · No semantic error token — 8 hardcoded `#DC2626` literals — OPEN

**Finding (side effect of D-1 analysis):** error styling hardcodes the
raw hex in `packages/ui` (Toast, Input, Textarea, Select, RFQFlow) and
`apps/site` (QuotationForm ×3, ContactForm ×3) — violating Prime
Directive 3 (semantic tokens only). Inventory in
`packages/liveries/mister/review/collision-report.md`.

**Proposal:** introduce a semantic error token in the Tier-1/Tier-2 token
system and sweep the 8 sites. Independent of the ramp decision, but decide
D-1 first so the error hue is chosen with the scarcity hue on the table.

---

## D-4 · Favicon variant (deepened notches) — NO ACTION, noted

**Finding:** favicon gate PASSED — `mister-m-solid.svg` reads at 16/32 px
under normal anti-aliased rendering; only a worst-case 1-bit/low-DPI
downsample closes the upper counters. The deepen-the-notches favicon cut
was deliberately NOT attempted by agents: the master's metaball M is a
single flattened path whose junction necks cannot be edited in isolation
without risking a contour move (= redraw, refused by the logo standard).

**If ever wanted:** a designer cuts it in the vector source and submits
`review/mister-m-favicon.proposed.svg`; it enters the registry only via a
changelog row in `MISTER_LOGO_APPLICATION_STANDARD.md`.
**Artifacts:** `packages/liveries/mister/review/favicon-gate.md` +
`GATE-m-*.png`.
