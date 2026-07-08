# Wings Global Trade — Illustration Standard: THE DRAWN REGISTER
**v1.0 · Class standard, subordinate to `WINGS_VISUAL_THESIS.md` v2.0 and
`WINGS_IMAGE_GENERATION_THESIS.md` v2.1. Expands Register A class A5 into
the full illustration language and serves Register B class B8 (editorial
illustration). Sibling standard to WORKING DAYLIGHT (photography) —
same constitution, different medium.**

---

## THE THESIS

> **Photography shows the world as it is; illustration shows the world as
> understood. Wings draws the way an engineer explains: flat construction,
> navy ink, warm-white paper, one gold accent. Nothing cute, nothing
> approximate — a drawing is a claim about how something works.**

---

## THE SHARED CONSTITUTION (inherited from Working Daylight, verbatim)

The two visual media are siblings under the same law. These transfer
without modification:

1. **One saturated mass per frame** — in illustration, gold `#C4933F` is
   the single accent: a marked component, a route line, a load arrow, the
   one element the drawing is *about*. Target ≤10% of inked area.
2. **Mineral restraint** — no color exists that isn't a token.
3. **Daylight logic** — no starry-night whimsy, no mood scenes. The dark
   variant is BLUEPRINT MODE (semantic), never "night" (atmospheric).
4. **Tension clause (J6)** — exactly one deliberate tension device: a
   ≥5:1 scale contrast, the gold mass off-center, or an off-axis cutaway.
5. **Humans as workers** — faceless pictogram figures, mid-task, at
   working distance, never the subject. (Illustration analogue of
   photography's Law 5; faces are never drawn.)

---

## THE TWO GROUNDS

| Mode | Ground | Ink | Accent | Use |
|---|---|---|---|---|
| **PAPER** | warm white `#F8F6F0` | navy `#001E50` | gold `#C4933F` | Default. Plates, diagrams, catalog and document surfaces |
| **BLUEPRINT** | navy `#001E50` | warm white `#F8F6F0` | gold `#C4933F` | Reversed technical register: lane maps, system overviews, deck section breaks |

Three tokens total, both modes. Pure black and pure white stay refused.
Mister-scoped illustration substitutes Mister azul per its own livery and
may carry grain; **Wings illustration is hard-edged — grain belongs to
Mister**, and the boundary is absolute.

---

## CONSTRUCTION LAWS

1. **Flat fills only.** No gradients, no blends, no soft shadows.
   Continuous tone does not exist in this register.
2. **Navy is ink.** Structure, outline, silhouette, and shadow are all
   the ink color. Shadow is rendered as a **flat shape at a fixed 45°
   light logic**, consistent across every asset — the drawn analogue of
   the photographic contact shadow.
3. **Geometry first.** Machines, buildings, terrain, and containers are
   assembled from primitives — rectangles, circles, trusses, bands. If a
   form can't be constructed, it isn't understood yet; understand it,
   then draw it.
4. **Line grammar.** Two stroke weights only: structural (heavy) and
   detail (light), at a fixed ratio (freeze 3:1 after calibration).
   Detail lines carry the technical truth — slats, treads, rungs, ribs,
   hatch patterns. Line always in the ink color of the mode.
5. **Accuracy is the register.** Proportions and mechanical logic must
   survive an operator's glance: correct wheel counts, plausible
   hydraulics, real container ratios. A charming wrong drawing fails
   harder here than anywhere — this brand's reader reads spec tables.
6. **Sky and ground are bands**, flat fields of the ground color or a
   screened tint of the ink (one screen value permitted, e.g. navy at a
   fixed 12% — freeze after calibration). No clouds-as-decoration; a
   cloud may exist only if weather is the subject.
7. **Type in drawings is drawn law:** labels in DM Mono grammar, Spanish
   first, verified character-by-character (ñ á é í ó ú). Callout lines
   in the light stroke weight, gold permitted for the annotation tick.

---

## THE CLASSES

| # | Class | What it is | Serves |
|---|---|---|---|
| I1 | **Machine plates** | Flat constructed portraits of machinery classes; optional cutaway | Register A (lane pages, decks) |
| I2 | **Scene plates** | Corridors, ports, Andean terrain, container yards as constructed scenes | Register A/B8 |
| I3 | **System diagrams** | Process flows, trade-lane logic, how-it-works — the A5 idiom, now governed here | Register A |
| I4 | **Pictogram set** | Reduced single-concept marks in the same grammar (one weight, one accent rule) | UI, documents, wayfinding |
| I5 | **Editorial illustration** | Campaign creative that reads as illustration (thesis class B8) | Register B surfaces, Meta/social |

Explicitly refused as a class: **empty-state and UI-comfort illustration**
— the parent thesis refuses friendly illustrations; empty states remain
"Sin datos disponibles."

---

## PROMPT ARCHITECTURE

Assemble every generation as **[SUBJECT] + [CLASS BLOCK] + [BASE BLOCK]**,
strict `controls.colors` (all three tokens — Register A palette policy).

```
BASE BLOCK (mandatory, verbatim — swap ground/ink for BLUEPRINT mode):
"Flat vector technical illustration, geometric construction, hard edges,
no gradients, no texture. Deep navy ink on warm off-white paper, one
gold accent element only. Two stroke weights. Flat shadow shapes at a
consistent 45-degree light. Precise mechanical proportions, engineering
drawing sensibility, industrial trade subject matter."

NEGATIVE BLOCK:
"gradient, soft shading, 3D render, texture, grain, cute, playful,
cartoon faces, stars, moon, pastel colors, pink, teal, rounded blobby
shapes, decorative clouds"

CLASS BLOCKS:
I1 "Constructed side or three-quarter plate of [machine], correct
    component count, optional cutaway revealing [system], gold marking
    the [subject component]."
I2 "Constructed scene of [corridor/port/terrain], layered flat bands,
    infrastructure as geometry, gold marking the [route/active element]."
I3 "Process diagram of [system], stations connected left to right,
    flat symbol grammar, gold on the [critical step]."
I4 "Single pictogram of [concept], one heavy stroke weight, minimal
    geometry, reads at 24px."
I5 "Editorial composition on [campaign theme], one scale tension,
    gold on the [focal element]."
```

## RECRAFT ROUTING + CONSISTENCY

- **Explore:** `recraftv4_1_vector` (I1–I3, I5); `recraftv4_1_utility_vector`
  for I4 pictograms (predictability over flair). `n` 3–6.
- **Post:** SVG output → path cleanup in Figma/Illustrator; raster
  detours get `vectorize_image`, then the same cleanup. Stroke-weight
  ratio and token hexes corrected manually — the grammar is enforced in
  the file, not hoped for in the generation.
- **Consistency (thesis mechanism, verbatim):** canon-first. At ≥5
  accepted assets of a class, file to CANON (`CANON/drawn/<class>/`),
  freeze the class block, and optionally distill a V3 custom style —
  base `vector_illustration` (I1–I3, I5) or `icon` (I4) — five best
  exports as references, filenames in MANIFEST. Validation clause
  applies: the V3 style must beat or tie the V4.1 frozen-block baseline
  in a three-subject side-by-side or the class stays on V4.1.

## GATES

Inherits the thesis gate framework. Machine: M2 vocabulary (negative-list
terms banned from prompts), M5 palette strict (three tokens, ΔE ≤ 12,
screen-tint value exempted once frozen), flatness scan (no gradient
pixels). Judged: J1 register (could it be tipped into a certified
dossier?), J3 canon match (construction laws), J4 accuracy audit — an
operator-eye check on mechanical logic (wheel counts, hydraulics,
ratios), J6 tension. Provenance: MANIFEST row per accepted asset,
REJECTED row per kill, per the thesis.

## REFUSED — categorical

- Gradients, soft shading, texture, or grain on Wings illustration
- Any hue beyond the three tokens (+ frozen screen tint)
- Whimsy register: cute animals, stars/moons, decorative weather, faces
- Empty-state / UI-comfort illustration
- Mechanically false drawings shipped for charm
- Mixing modes in one asset (paper and blueprint never share a frame)

## CHANGELOG

| Date | Ver | Change |
|---|---|---|
| 2026-07-08 | 1.0 | Created. Reference DNA (flat construction, ink discipline, shadow-as-shape) translated into the token system; two grounds; five classes; A5 expanded and governed here; B8 served. |

*Maintained in: `spec/WINGS_ILLUSTRATION_STANDARD.md` · Canon:
`assets/image-generation/CANON/drawn/` · Siblings: WORKING DAYLIGHT
(photography), C-HERO (catalog), Mister expressive layer (grain register).*
