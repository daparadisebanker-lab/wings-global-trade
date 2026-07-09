# Collision report — `--ramp-hot` vs. error/danger red

Analysis only. No token, CSS, or component was changed as part of this report.
Requested by: semantic-collision check on `--ramp-hot` (task tracked against
`ramp.ts` line 33 — `FROZEN_PENDING_CALIBRATION`).

## 1. Error/danger token inventory

There is **no CSS custom property / design token for error state anywhere in
the repo.** Every error/danger surface hardcodes the same literal hex,
**`#DC2626`** (Tailwind's `red-600`), independently, in eight places across
two packages. This is itself a finding: it violates the repo's Prime
Directive 3 ("Components consume semantic tokens only. Never a raw hex...").
Whatever `--ramp-hot` is calibrated to, it is colliding with an
un-tokenized, copy-pasted literal, not a governed design decision.

Definition sites (all identical literal, no variable):

| File | Line | Usage |
|---|---|---|
| `packages/ui/src/primitives/Toast.tsx` | 26 | `error: 'border-l-[#DC2626]'` (toast left-border for error type) |
| `packages/ui/src/primitives/Input.tsx` | 23 | `hasError && 'border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'` |
| `packages/ui/src/primitives/Textarea.tsx` | 23 | same pattern as Input |
| `packages/ui/src/primitives/Select.tsx` | 25 | `hasError && 'border-[#DC2626]'` |
| `packages/ui/src/organs/RFQFlow.tsx` | 449 | `text-[#DC2626]` — the field-level error message text (this is the RFQ/quote form's error copy, e.g. required-field validation) |
| `apps/site/src/components/features/quotation/QuotationForm.tsx` | 267, 527, 544 | category-error label, field error message, error placeholder tint |
| `apps/site/src/components/features/shared/ContactForm.tsx` | 178, 194, 212 | same pattern as QuotationForm |

No dedicated "Error al calcular CIF" string exists in code yet (it appears
only as an illustrative example in `spec/WINGS_VISUAL_THESIS.md`); the CIF
hook (`apps/site/src/hooks/useCifEstimate.ts`) sets a plain error string with
no color logic of its own — it would render through one of the shared
primitives above (Toast/Input/Field), all of which resolve to `#DC2626`.

**Conclusion of inventory:** one error red exists, `#DC2626`, applied
consistently but never tokenized.

## 2. Metrics — `--ramp-hot` vs. `#DC2626`

Computed with `culori` (CIEDE2000 for perceptual ΔE, OKLCH for hue/lightness/chroma), scratch script at `C:\Users\Muaaz\AppData\Local\Temp\claude-collision-work\collision.mjs`.

| Pair | CIEDE2000 ΔE | OKLCH hue Δ | ΔL | ΔC |
|---|---|---|---|---|
| `--ramp-hot` `#C63A1E` (L=0.554, C=0.181, H=33.1°) vs. error-red `#DC2626` (L=0.577, C=0.215, H=27.3°) | **5.42** | **5.8°** | −0.024 | −0.034 |
| *context* `--ramp-hot` vs. `--ramp-warm` gold `#C4933F` (L=0.694, C=0.116, H=78.1°) | 30.93 | 45.0° | −0.141 | +0.065 |
| *context* error-red `#DC2626` vs. gold `#C4933F` | 34.24 | 50.8° | −0.117 | +0.099 |

## 3. Verdict: collision, confirmed

By the stated rule of thumb (ΔE < 20 **or** hue within ~15° at similar
lightness ⇒ collision risk), `--ramp-hot` and the error red fail on **both**
axes simultaneously, not just one:

- ΔE = 5.42 is deep inside "same color to most viewers" territory (JND is
  roughly ΔE ≈ 1–2; anything under ~10 reads as a shade of the same hue,
  not a different one).
- Hue separation is 5.8° — essentially the same hue angle in OKLCH.
- Lightness (ΔL −0.024) and chroma (ΔC −0.034) are both near-identical, so
  there's no compensating brightness or saturation cue either.

In practice: a user seeing a "last units on this container, act now" signal
in `--ramp-hot` and a "Error al calcular CIF" border in `#DC2626` would be
looking at the same red, differing only in a barely perceptible warmth
shift. This directly contradicts the thesis's own INSTRUMENT COLOR clause —
scarcity is meant to be a legended, truthful reading, and if it's
visually indistinguishable from "the form is broken," the reading is
corrupted at the color layer regardless of the legend text next to it.
`--ramp-hot` should **not** be frozen at `#C63A1E` as currently specified.

## 4. Proposed resolutions (founder calibration — not applied)

Both proposals hue-shift `--ramp-hot` toward orange, away from error-red's
27.3° and away from gold's 78.1°, while keeping lightness/chroma close
enough to the original that it still reads as "hot" rather than becoming a
second gold.

| Candidate | Hex | OKLCH (L / C / H) | ΔE vs. error-red `#DC2626` | Hue Δ vs. error-red | ΔE vs. gold `#C4933F` | Hue Δ vs. gold |
|---|---|---|---|---|---|---|
| **A — conservative shift** | `#C34200` | 0.554 / 0.181 / 45.0° | 18.06 | 17.7° | 24.90 | 33.1° |
| **B — recommended** | `#B93400` | 0.520 / 0.190 / 48.0° | **22.88** | **20.7°** | **27.91** | **30.1°** |

Candidate **A** is the minimal move that clears both thresholds (ΔE and hue
both just past the risk line — 18.06 / 17.7°) while staying visually closest
to the original `#C63A1E` signal. Candidate **B** is the safer margin: it
clears error-red by a comfortable buffer (ΔE 22.88, hue 20.7°) and actually
increases separation from gold too (ΔE 27.91 vs. the original ramp-hot's
30.93 — still very safe, gold was never the tight constraint). B reads as a
darker, more saturated burnt-orange/vermillion rather than a pure red,
which is consistent with "critical/last units" staying in the warm-hot
register without borrowing red's "broken/failure" connotation.

Recommend **B (`#B93400`)** unless the founder wants the signal to stay
closer to the original art-directed red, in which case **A (`#C34200`)** is
the floor — do not calibrate `--ramp-hot` any closer to `#DC2626` than
Candidate A without also tokenizing and possibly shifting the error red
itself (out of scope for this report; error red is currently unowned/raw
hex in 8 files, so it could itself move if the founder prefers to solve
this from the error side instead of the ramp side).

Script and full candidate sweep (including two rejected mid-hue options,
D/E/F/G naming from working notes) live at
`C:\Users\Muaaz\AppData\Local\Temp\claude-collision-work\collision.mjs` and
`candidates2.mjs` — scratch only, not part of the repo.
