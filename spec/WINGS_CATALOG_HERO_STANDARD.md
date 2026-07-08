# Wings Global Trade — Catalog Hero Cutout Standard (C-HERO)
**v1.0 · Class standard, subordinate to `WINGS_IMAGE_GENERATION_THESIS.md`
v2.0. Governs every product-card and catalog hero image. Canon anchor:
the navy tractor cutout (founding canon, class B4-cutout / Register C
staging).**

---

## THE STANDARD IN ONE LINE

> **Any product, from any source context, is delivered as: the true
> machine, 3/4 front, on a seamless warm-white void, grounded by one soft
> navy-tinted contact shadow, at a fixed scale on a fixed grid.**

The catalog is a fleet in formation. Every card obeys the same geometry so
the *products* differ, never the photography.

---

## ANATOMY OF THE TARGET (decoded from canon)

| Element | Law |
|---|---|
| **Angle** | 3/4 front hero: front face + one full side visible, 30–45° off the frontal axis. Camera height 40–55% of product height. Long-lens look (≥50mm equivalent) — minimal perspective distortion, verticals near-vertical. |
| **Ground** | Seamless void. No horizon line, no floor edge, no reflection. The object sits *in* light, not *on* a surface. |
| **Light** | Soft, even, overhead-softbox register. Open shadows: dark products (navy machinery) stay fully legible — grilles, badges, panel gaps all read. No hard speculars, no blown whites on chrome. |
| **Shadow** | One diffuse contact shadow anchors the product. Without it the object floats (clipart); with a hard one it becomes theater. Spec below. |
| **Color** | The product's true color, untouched. Ground is warm white `#F8F6F0`. |
| **Content** | Product only. No props, no environment, no baked text, no people. |

---

## THE GRID (calibrate on first 10 assets, then freeze)

Master canvas **2000×1500 (4:3)**, transparent master + warm-white
composite. Derived crops: 1:1 (1500²) and 16:9 (2000×1125) from the same
placement.

- **Safe area:** product bounding box ≤ **78% canvas width** and ≤ **70%
  canvas height** — whichever binds first sets the scale.
- **Ground line:** wheel/track contact line at **84% canvas height**, every
  card, no exceptions. This is what makes the catalog read as one shoot.
- **Optical centering:** +4% extra margin on the facing side (the product
  "looks into" space, never out of frame).
- **Facing:** normalize direction *at the shoot/source-selection stage*
  where possible. **Mirror-flipping a real product is refused** — badges
  and lettering reverse, which is fabricated evidence. A wrong-facing
  source ships wrong-facing or gets a new source.

### Shadow spec (the signature)

Two layers, composited under the cutout, color **navy `#001E50`**
(navy is the hue of shadow — Palette Law):

1. **Contact ellipses** under each wheel group / footprint: opacity 20%,
   blur ≈40px at 2000px canvas width.
2. **Body ellipse**, one broad soft mass under the chassis: opacity 10%,
   blur ≈120px.

No other shadow. No drop-shadow offsets. No reflections.

---

## THE PIPELINE — any context in, C-HERO out

### Step 0 — Classify the source (this fork is law)

- **Real product photo** (supplier, dealer, field) → **Register C rules
  bind:** restore, never reinvent. Continue below.
- **Generated machine** (lane heroes, archetype imagery) → generate
  directly in cutout style via the B4-cutout prompt block (appendix), and
  it may never be presented as a specific SKU. Skip to Step 5.

### Step 1 — Pre-flight (kill early, kill cheap)

Reject or re-source if: resolution below ~1200px on the product's long
edge after crop; motion blur or heavy compression on the product; angle
outside the acceptance window (3/4 front preferred; straight side profile
is the permitted secondary standard; rear-quarter refused for heroes);
occlusions crossing the silhouette (people, fences, other machines).
**The pipeline cannot re-pose a product.** A bad angle is a sourcing
problem, not an editing problem — `image_to_image` on evidence is refused.

### Step 2 — Faithful enlargement

`crisp_upscale` on the original, **before** background removal — more
pixels means cleaner edges downstream. `creative_upscale` stays refused on
product surfaces: it invents detail, and invented detail on goods offered
wholesale is misrepresentation.

### Step 3 — Extraction

`remove_background` → transparent subject. Then the **thin-structure
audit at 200%**: mirrors, mirror arms, antennas, hydraulic lines, forks,
railings — exactly where extraction fails. Halos, fringing, or amputated
structures → manual mask touch-up or re-extraction. A truck with melted
mirror arms fails Gate J4 regardless of everything else.

### Step 4 — Restoration-grade correction (logged, bounded)

Permitted: **global** white-balance to neutralize the source lighting
cast (returning the product to its true color is restoration), global
exposure lift to the open-shadow register, dust/sensor-spot removal on
the *ground*, not the product. Refused: any selective color edit, any
geometry/badge/condition change, any panel "cleanup" on the product
itself. Every correction is one manifest line.

### Step 5 — Staging (deterministic by default)

**Route 1 — programmatic composite (default).** A script places the
cutout on the grid, renders the two-layer navy shadow, and exports the
transparent master + warm-white composite + crops. Deterministic staging
is what keeps 200 cards identical; generative grounds drift.
Implementation: sharp/canvas or Pillow inside the Claude Code pipeline —
parameters exactly as specified in THE GRID.

**Route 2 — generative ground (fallback only).** When a flat composite
reads dead for a given product class, `replace_background` with the
staging prompt (appendix). Output must still hit the grid and shadow spec
— generative results get re-placed through Route 1's geometry check, not
trusted raw.

### Step 6 — Export + provenance

- `SKU_hero_master.png` (transparent, full canvas)
- `SKU_hero_4x3.webp`, `SKU_hero_1x1.webp`, `SKU_hero_16x9.webp`
  (warm-white composites)
- MANIFEST row: source file, supplier, every operation applied (upscale,
  extraction, corrections with values, staging route), date, destination.
  Restoration provenance is the audit trail if a buyer ever asks.

---

## ACCEPTANCE GATES (all pass or the card dies)

| Gate | Test |
|---|---|
| G1 Grid | Ground line at 84% ±1; width/height within safe area; facing margin correct. Machine-checkable. |
| G2 Edges | 200% zoom: no halos, no fringe, thin structures intact. |
| G3 Shadow | Two layers only, navy hue, spec opacities; product does not float and does not sit in theater. |
| G4 Fidelity | Side-by-side vs source: color, geometry, badges, condition identical. Any drift = fabricated evidence = kill. |
| G5 Legibility | Dark products remain fully legible — grille, panel gaps, markings read (open-shadow check). |
| G6 Ground | Composite ground is `#F8F6F0` exactly; no gradient, no horizon, no pure white. |
| G7 No-flip | Lettering/badges read correctly. Mirrored asset = kill, no exceptions. |

---

## REFUSED — this class, categorical

- Mirror-flipping real products
- `creative_upscale` or `image_to_image` on evidence
- Selective color, geometry, badge, or condition edits
- Reflections, floor lines, environments, props, baked text
- Pure white grounds; hard or offset drop shadows
- Presenting a generated machine as a specific SKU

---

## APPENDIX — prompt blocks

**B4-cutout generation (generated machines only):**
```
"[MACHINE], studio product photograph, three-quarter front view, camera
at mid-body height, 85mm lens, seamless warm off-white sweep with no
horizon line, soft even overhead studio light, open shadows, single soft
contact shadow under the machine, true color, no props, no text."
+ NEGATIVE: "environment, floor edge, reflection, dramatic light, dark,
dusk, people, text, watermark"
```

**Route 2 staging (`replace_background` on extracted evidence):**
```
"Seamless warm off-white studio sweep, no horizon line, soft even light,
single diffuse contact shadow beneath the vehicle, nothing else in frame."
```

---

## CHANGELOG

| Date | Ver | Change |
|---|---|---|
| 2026-07-08 | 1.0 | Created from canon decode (navy tractor cutout). Grid, shadow spec, two-route staging, gates. |

*Maintained in: `spec/WINGS_CATALOG_HERO_STANDARD.md` · Parent:
`WINGS_IMAGE_GENERATION_THESIS.md` v2.0 · Ops:
`assets/image-generation/CLAUDE.md`*
