# DEFERRED — proposed amendments & founder calibrations

Per the amendment protocol in `WINGS_IMAGE_GENERATION_THESIS.md`: agents
never edit law inline — proposals land here with rationale and artifacts,
and take effect only when the founder ratifies (changelog row + version
bump in the affected document). Resolved items get a **RESOLVED** line,
never deleted.

---

## D-1 · Freeze or shift `--ramp-hot` (collision with error red) — RESOLVED

**RESOLVED 2026-07-08:** founder ratified **Candidate B `#B93400`** —
frozen in `ramp.ts` v1.1, thesis bumped to v2.2 (changelog rows there),
expressive-layer spec to v1.1, `livery.css` regenerated. The calibration
sheet was re-rendered to show the shipped state.

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

## D-2 · Ramp midtone interpolation: OKLCH detours through green — RESOLVED

**RESOLVED 2026-07-08:** founder ratified piecewise **OKLab**. Shipped in
`ramp.ts` v1.1; the chroma-floor tests were replaced by a hue-exclusion
corridor suite (`ramp.test.ts`): every sample must be neutral (chroma
< 0.02) or inside the blue corridor [230°, 290°] (cold side) / warm
corridor [15°, 100°] (hot side); any hue in the green/cyan band
[100°, 220°] at visible chroma fails. A companion test reproduces the
retired OKLCH mode and asserts it violates the band — proof the gate
catches the regression it was built for.

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

## D-3 · Semantic error token `--error` — RESOLVED

**RESOLVED 2026-07-08:** founder ratified **`--error: #A61B3A`** by eye
from the calibration sheet. PROPOSED marker removed from the wings livery;
the token and its alpha variants are law. Legacy `#DC2626` survives only
as `var()` fallbacks for consumers without the wings livery.

**Finding (side effect of D-1 analysis):** error styling hardcoded
`#DC2626` in `packages/ui` (Toast, Input, Textarea, Select, RFQFlow) and
`apps/site` (QuotationForm ×3, ContactForm ×3) — violating Prime
Directive 3. Inventory in
`packages/liveries/mister/review/collision-report.md`.

**Implemented 2026-07-08 (value NOT frozen):** `--error: #A61B3A` (cool
crimson) + alpha variants `--error-70/-40/-glow` defined in
`packages/liveries/wings/livery.css` marked PROPOSED_PENDING_RATIFICATION;
all 11 literal instances swept to the token with `#DC2626` fallbacks (so
consumers without the wings livery keep legacy behavior). Swap test,
typecheck, build green.

**Why not the ordered starting point `#B91C1C`:** it sits ΔE2000 = 8.34 /
9.1° hue from the frozen `--ramp-hot #B93400` — it would recreate the D-1
collision in reverse. `#A61B3A` (hue 15.6°) gives ΔE 18.91 / 21.0° vs
scarcity, AA 6.84:1 on warm white; the cooler alternative `#9F1239`
(ΔE 20.67, AA 7.42:1) is on the sheet if more margin is wanted.

**Ratify by eye:** `packages/liveries/mister/review/ramp-calibration-sheet.png`
row 2. On ratification (or a different hex): update the four `--error*`
values in the wings livery, remove the PROPOSED marker — call sites need
no change.

---

## D-4 · Favicon variant (deepened notches) — CLOSED

**CLOSED 2026-07-08 by founder ruling: no action — the refusal was
correct.** The favicon gate PASSED (`mister-m-solid.svg` reads at
16/32 px; only a worst-case 1-bit/low-DPI downsample closes the upper
counters), and agents were right not to attempt deepening notches on the
flattened master path. **If a favicon variant is ever needed, the legal
route is re-export from the original design file with separate blob
primitives — never editing the flattened path.**
**Artifacts:** `packages/liveries/mister/review/favicon-gate.md` +
`GATE-m-*.png`.
