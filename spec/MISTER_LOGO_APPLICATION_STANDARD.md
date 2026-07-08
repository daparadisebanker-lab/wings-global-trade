# Mister — Logo Application Standard
**v1.0 · Governs every use of the Mister mark. Subordinate to
`WINGS_VISUAL_THESIS.md` v2.0. Companion:
`MISTER_EXPRESSIVE_LAYER_SPEC.md`.**

---

## THE LAW IN ONE LINE

> **The mark is never generated, never traced, never redrawn. Agents load
> the registered files below, recolor solids via CSS fill only, and
> composite the grain master. Everything else is a violation.**

---

## ASSET REGISTRY — source of truth (Claude: reference these files)

Canonical home: `packages/liveries/mister/logo/`. Registered masters
(verified anatomy, 2026-07-08):

| Canonical file | Origin file | Anatomy (verified) | Role |
|---|---|---|---|
| `mister-lockup-solid.svg` | `Mister-logo_001__1_.svg` | 1 metaball-M path + 12 satellite circles + "Mister" wordmark (1 polygon + 5 glyph paths), single-color fills, viewBox 11692.91 × 8267.72 | **Geometry master.** All solid variants derive from this file by layer deletion + CSS `fill` recolor |
| `mister-lockup-reversed.svg` | `Mister-logo_002.svg` | Same geometry in white on a `#65AFFF` rect band (1224.56, 2589.07, 9243.39 × 3095.2) | Reversed lockup; the band defines MISTER CIELO usage |
| `mister-constellation-grain@master.png` | `Mister-logo_004.png` | 3506 × 2479, **RGBA** | **Grain master.** The only compositing asset for grain applications — alpha channel is why |
| `mister-constellation-grain@1x.png` | `Mister-logo_003.png` | 1375 × 972, RGB | Screen-weight grain render |

**Agent instructions (binding):**
1. Load by path. Never regenerate the mark with any model, never
   `vectorize_image` the grain PNGs, never auto-trace, never redraw
   "close enough" geometry.
2. Solid recolors: edit CSS classes in the SVG (`fill:`) only — geometry
   untouched. Permitted fills: `#1D83F2`, `#001E50`, `#F8F6F0`, white.
3. Derived variants are cut from `mister-lockup-solid.svg` by deleting
   layers, and committed back to the registry (see VARIANTS). No variant
   exists until it exists as a file.
4. Grain is raster-only by architecture: the SVGs are solid geometry, the
   grain lives exclusively in the PNG renders. Do not attempt to rebuild
   grain in vector.
5. Any new render (recolor, resize, variant) gets a MANIFEST row.

---

## VARIANTS (to cut from the geometry master)

| Variant | Derivation | Use |
|---|---|---|
| `mister-mark-solid.svg` | Delete wordmark glyphs + band; keep metaball M + 12 satellites | Small/medium solid use |
| `mister-m-solid.svg` | Metaball M only | Favicon, app icon, avatar, stamps |
| `mister-wordmark-solid.svg` | Wordmark glyphs only | Editorial lockups |
| Grain crops | Crop from `@master.png` only | Partial-constellation compositions |

---

## COLOR LAW

| Token | Hex | Use |
|---|---|---|
| **MISTER AZUL** (ink) | `#1D83F2` | Solid mark fills; dense grain core (sampled from master: core `#1D83F2–#2286F1`, dissolving to `#8DBDEF`) |
| **MISTER CIELO** | `#65AFFF` | Band/container grounds for the reversed lockup only — never as mark fill |
| Wings navy | `#001E50` | Solid mark on parent-brand surfaces; reversed grounds |
| Warm white | `#F8F6F0` | Default ground; reversed mark fill |

Rules: one hue per instance. Grain renders keep their sampled tonal range
— never flattened to one hex. On photography: solid ground or band first,
never the mark loose on an image. Never on gradients (the mark does not
sit on instrument-color fields; it sits beside them).

---

## SIZE & THE GRAIN→SOLID SWITCHOVER

The switchover is native to the asset architecture: grain = raster layer,
solid = vector layer. Sizes assign jurisdiction:

| Rendered size (mark height) | Asset |
|---|---|
| ≥ 64 px | Grain permitted (`@master.png`, downscaled — export at 2× target before placement to protect stipple) |
| < 64 px | **Solid SVG only** — grain reads as compression noise below this line |
| Favicon / app icon (16–48 px) | `mister-m-solid.svg` only |
| Full lockup with wordmark | Grain ≥ 120 px lockup height; solid below |
| Print | `@master.png` holds 300 DPI up to ≈ 29.7 cm wide (3506 px); beyond that, solid SVG or re-render grain at size — never upscale the raster |

## CLEARSPACE

Unit **b** = the diameter of one core blob of the metaball M (measure once
from the geometry master, record the value in `livery.css`).

- Constellation (with satellites): clearspace = **1b** beyond the
  outermost satellites. The orbit is part of the mark — nothing enters it.
- Mark-only / M-only: clearspace = **1b** on all sides.
- The wordmark baseline relationship in the lockup master is frozen —
  never retypeset "Mister" next to the mark.

---

## MOCKUP PIPELINE

**Route 1 — Recraft Mockup flow (exploratory, web canvas):** generate or
convert a mockup base (blank signage, card, device, apparel), then place
the **real** `@master.png` — the tool wraps the artwork to the surface.
The base obeys Working Daylight rules; prompt substrates blank.

**Route 2 — MCP/programmatic (production):** `recraftv4_1` generates the
blank substrate → Claude Code composites the registered asset with
perspective transform. Light surfaces: multiply or normal blend, grain
master. Dark surfaces: `mister-lockup-reversed.svg` render or white-fill
solid. Gates: geometry undistorted (uniform scale only), clearspace held,
no baked regeneration of the mark by the model — if the model drew the
logo, the frame dies.

---

## V3 GRAIN STYLE — training spec (ambient assets only)

Purpose: an infinite supply of on-language ambient material (dot fields,
dissolve compositions, junction studies) — **never the mark itself**.

1. `create_style`, base style `digital_illustration`.
2. Five PNG references, exported from registered assets: 2 crops of
   `@master.png` (dense core + dissolve edge), the four-circle junction
   study, one satellite-field crop, one approved dissolve composition.
   All references preserve **directional dissolve** (dense core →
   outward) — this is what the style must learn.
3. Record `style_id` + the five reference filenames in MANIFEST; the
   style is bound to V3 — reuse with the same model only.
4. Outputs are Mister-azul monochrome fields; thermal-ramp ambient work
   additionally obeys the INSTRUMENT COLOR amendment (`encodes:` field).
5. Validation before adoption: three test generations judged against the
   junction/dissolve canon; random-direction dissolve = retrain with
   stronger directional references.

---

## REFUSED — categorical

- Generating, tracing, vectorizing, or redrawing the mark by any model
- Mirror, skew, rotation, or non-uniform scale of any registered asset
- Grain below 64 px; raster upscales beyond master resolution
- Second hues, outlines, shadows, glows on the mark (junction luminance
  belongs to the expressive layer, not the logo)
- The mark on gradients, photography without a ground, or instrument-color
  fields
- Retypesetting the wordmark; breaking the lockup geometry

## CHANGELOG

| Date | Ver | Change |
|---|---|---|
| 2026-07-08 | 1.0 | Created. Asset anatomy verified (solid SVG masters + RGBA grain master); registry, switchover, clearspace, mockup routes, V3 style spec. |

*Maintained in: `spec/MISTER_LOGO_APPLICATION_STANDARD.md` · Assets:
`packages/liveries/mister/logo/` · Tokens: `packages/liveries/mister/livery.css`*
