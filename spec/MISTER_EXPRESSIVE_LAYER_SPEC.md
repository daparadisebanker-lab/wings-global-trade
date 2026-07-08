# Mister — Expressive Layer Specification
**v1.1 · Governs all expressive/ambient visual behavior of the Mister
brand. Subordinate to `WINGS_VISUAL_THESIS.md` v2.0 and the INSTRUMENT
COLOR amendment (2026-07-08-B). The mark itself is governed by
`MISTER_LOGO_APPLICATION_STANDARD.md`.**

---

## THE THESIS

> **Mister's expressiveness runs on exactly two axes, and both are data.
> LUMINANCE encodes connection. TEMPERATURE encodes demand. Grain is the
> constant. Nothing glows, heats, or moves without a variable behind it.**

Form is constant (metaball geometry + stipple grain, inherited from the
mark). Color and light are what the instrument is currently reading. This
is how an AI advisor earns expressiveness inside a certified-document
brand: it behaves like a diagnostic device, not a decoration.

---

## AXIS 1 — LUMINANCE = CONNECTION (canon ref: four-circle junction study)

The white-hot cores live **only at junctions** — the seams where circles
merge. Circles are parties (buyer, group members, supplier, Wings); the
glow is the value created where they fuse. This is "Trae tu grupo" drawn
as physics.

Rules:
- Glow appears only at a junction, never at a blob's center, never as a
  general wash.
- Glow intensity maps to a connection variable: members joined, match
  confidence, group completion. `encodes:` field required in MANIFEST.
- Single hue: Mister azul `#1D83F2` field, luminance as the only variable.
  No second color on this axis.
- Idle state = flat grain, no glow. A glowing junction with no event
  behind it is a false reading (evidence law, color extension).

Event grammar (product surfaces):
| Event | Behavior |
|---|---|
| Member joins group | Junction pulse, 0.6s ease, settles to new steady luminance |
| Group completes | All junctions reach peak, single sustained state |
| Match/diagnosis delivered | One junction ignition at the relevant seam |

---

## AXIS 2 — TEMPERATURE = DEMAND (canon ref: thermal contour study)

The Mister thermal ramp (amendment 2026-07-08-B) rendered as stipple
fields or isotherm contour bands. Always bound to a demand variable.

### FillMeter thermal states (the flagship application)

| State | Fill | Ramp position | Copy (ES, no exclamation) | Behavior |
|---|---|---|---|---|
| **FRÍO** | 0–40% | navy → azul | "Contenedor abierto" | Slow grain drift, cold field |
| **TEMPLADO** | 40–70% | azul → warm white | "Llenándose" | Field brightens toward neutral |
| **CALIENTE** | 70–90% | warm white → gold | "Quedan pocos cupos" | Gold isotherms appear at the fill edge |
| **CRÍTICO** | 90–100% | gold → signal `#B93400` | "Quedan N cupos" | Hot band at the remaining-capacity edge; N is live |

Laws:
- State transitions are computed from the fill field — never set by hand.
  A CRÍTICO render on a FRÍO container is fabricated evidence.
- Heat concentrates at the *edge of remaining capacity* (where scarcity
  physically is), not across the whole component.
- Urgency is temperature, never punctuation — the copy law's exclamation
  refusal stands; the ramp does that job now.

Other permitted readings: corridor demand maps (lane heat by booking
density), slot-campaign countdown fields, group-formation progress.

---

## THE CONSTANT — GRAIN

All expressive surfaces render through the stipple grain (mark DNA):
- Dissolve is **directional**: dense core → particles escape outward.
  Random dissolve is off-language.
- Grain scale is consistent per surface class; document the noise
  parameters in `packages/liveries/mister/grain.ts` once frozen.
- Smooth airbrush gradients remain refused; grain and isotherm banding are
  the only two renderings of continuous value.

---

## MOTION

Inherits the parent animation law (ease only, no bounce) with one
extension: expressive motion is permitted **because it carries data** —
the parent refusal targets decorative motion, and these are readings.

| Motion | Spec |
|---|---|
| Junction pulse (event) | 0.4–0.6s ease-out, once per event |
| Thermal drift (ambient) | Slow field drift ≥8s cycle, amplitude subtle; communicates "live reading," carries the state variable |
| Orbital satellites (mark contexts) | Governed by the logo standard; period slow, never playful |
| Gooey merges | SVG filter (blur + contrast) on blob unions; reserved for connection events |

Refused: bounce, particles-as-ambiance without a variable, speed as
excitement, any motion faster than its data changes.

---

## IMPLEMENTATION LAW — procedural first

1. **Production surfaces are code.** Scalar field → ramp function →
   grain/isotherm render, via SVG (`feTurbulence` + `feComponentTransfer`
   /`feColorMatrix`) or shader (Three.js/R3F). The ramp function is the
   only color source — governance by architecture: the gradient cannot
   exist without data driving it.
2. **Recraft's role is exploration and campaign statics only.** V3
   `digital_illustration` + grain-language custom style (training spec in
   the logo standard) for social/campaign compositions. Every Recraft
   output still declares `encodes:` in its brief and MANIFEST.
3. Junction glow: additive luminance on the azul field, clamped before
   pure white — cores read hot, never blown to paper.

---

## REFUSED

- The ramp or glow as background, ambience, or "premium feel" — anywhere
- Any expressive render without a named variable (`encodes:` empty = kill)
- False states (hot on cold, glow without event)
- Multicolor on Wings core document surfaces
- Smooth gradients; random-direction dissolve; bounce

## GATES

- **E1 (machine):** MANIFEST `encodes:` field present and named.
- **E2 (machine):** all sampled colors on-ramp (ΔE ≤ 12 vs ramp function).
- **E3 (judged):** the reading is true — variable value matches rendered
  state.
- **E4 (judged):** grain directionality correct; junction-only glow.

## CHANGELOG

| Date | Ver | Change |
|---|---|---|
| 2026-07-08 | 1.0 | Created from the two canon studies (junction luminance; thermal contours). Two-axis law, FillMeter states, motion + implementation law. |
| 2026-07-08 | 1.1 | Signal hex `#C63A1E` → `#B93400` (founder calibration D-1, frozen — see thesis v2.2 changelog); ramp interpolation fixed as piecewise OKLab (D-2). |

*Maintained in: `spec/MISTER_EXPRESSIVE_LAYER_SPEC.md` · Tokens:
`packages/liveries/mister/` · Parent: INSTRUMENT COLOR amendment.*
