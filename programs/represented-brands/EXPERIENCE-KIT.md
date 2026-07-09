# RB Experience Kit — brand-agnostic assets, ready before brand #1

> Companion to `SPEC.md`. Everything here is **Phase-0-independent**: parametric,
> token-driven, buildable now, and reused identically by every brand. The kit
> exists to kill genericness — a brand shelf assembled from these pieces reads
> as *that brand's trade operation*, not a template with a logo swapped.
> Built assets live in `kit/`. Status legend: **BUILT** (file exists) ·
> **READY** (contract written, build on demand) · **NEEDS-APPROVAL** (touches
> frozen law).

The kit's one rule, inherited from the token contract (§2.5): a piece is only
admitted if it renders correctly for ANY brand by consuming `--rb-*` variables
and kit-manifest data — never by per-brand editing. The §2.7 swap test applies
to every asset here.

---

## 1 · Container Livery System — **BUILT** `kit/container/`

The signature move: **the brand's own container** as the shelf's hero object.
The product of this program *is* a container, so the strongest possible brand
image is the closed box wearing the brand's paint — no photography needed,
which also softens the launch photo-gate for brands with weak asset libraries.

- `container-40hc-side.svg` — closed 40HC side elevation, real proportions.
  Corrugation, rails, castings, fork pockets, vents. Tint architecture: all
  shading is white/black at low opacity over one base fill, so **any** brand
  color works. Slots: `#brand-zone` (logo safe-rect documented in-file),
  `#container-code` (binds to the TOWER container code `RB{nn}-40HC-{seq}`),
  optional `--rb-accent` livery stripe.
- `container-door-end.svg` — door elevation: leaves, lock rods, cam handles,
  CSC plate, stencil code. Same variables.
- Variables: `--rb-container` (body paint) · `--rb-accent` (stripe) ·
  `--rb-brand-ink` (logo/stencil ink). Fonts inherit at integration (Teko for
  stencils via `--font-mono`).

Uses: BrandHero alternate, `/marcas` brand tiles, buy-instrument header, OG
images, ad creative, empty states («su contenedor, su marca»). The kit
compiler (§3.1d) can render a brand's container preview the moment its kit
colors validate — *before* a single photo exists.

**Extension (READY):** door-open variant — doors swung to reveal a packed
cross-section, feeding the door-opening motion signature (§9) and the
FillMeter open-state.

## 2 · RB Seal — **BUILT** `kit/seal/rb-seal.svg`

The representation stamp: LaneStamp's sibling for brands. Double ring, mono
arcs («REPRESENTACIÓN OFICIAL / WINGS GLOBAL TRADE»), center `RB/nn` + year.
Slots `#seal-code` / `#seal-year` bind to the brand record. CSS-rotate ~-8°
for the stamped feel — rotation is never baked in. Uses: MandateSeal corner,
brand tiles, trade documents, OG images, colophon. On the white canvas the
seal is the *only* Wings-voiced mark inside the brand world besides the
mandate block — keep it that scarce.

## 3 · Container-corrugation texture — **BUILT · RATIFIED** `kit/textures/`

`container-corrugation.svg` — the corrugation from asset 1 as a standalone
tileable texture (24×12 tile, relief opacities baked in). **Ratified by Muaaz
2026-07-09 as a texture-library exemption**, scoped to represented-brand
shelves and kit assets; it enters the root-law texture library
(`blueprint-grid`, `linen-paper`, `kraft`, `document-grain`) formally at the
Phase-0 root-CLAUDE.md amendment. Usage law: 2–4% opacity as section bands on
the white canvas, never stronger.

**Kit legibility rule (learned 2026-07-09, applies to every asset):** stencil
or label text below 24px rendered size is never set on top of corrugation —
markings get a smooth band, exactly as real containers reserve the lower side
rail for them. Asset 1's marking line sits on the smooth lower-rail band; the
door-end code sits on a painted placard patch.

## 4 · Packing Diagram Generator — **READY** (highest de-generic value)

Contract: `(composition: RbContainerTemplate['composition'], kind) → SVG` —
an orthographic cutaway of the container packed with the brand's actual
cartons/pallets from its packing profiles, each package a rect with count
labels, CBM/kg totals in the margin, governing bound (CBM vs KG) annotated.
Pure function, server-rendered, cacheable per template.

Why it matters most: it is *derived from the brand's real logistics math* —
impossible to mistake for a template. Uses: product pages («así viaja su
pedido»), PackingCascade backdrop, quotation PDFs, Mister surface (the
`ContainerOfferCard` can embed it). Numbers exhibited, not hidden — Prime
Directive 5 as an image.

## 5 · Route Arc Map — **READY**

Contract: `(origin_port, dest_port, waypoints?) → SVG` — mono-line world
fragment, great-circle arc, port markers with UN/LOCODE labels (`CNTAO →
PECLL`), transit-days annotation. Accent tints from `--rb-accent`. Uses:
container cards, tracking workspace, closing-date campaign creative. One
component; every brand's routes are just data.

## 6 · Stencil Type Treatment — **READY**

A CSS/SVG mask recipe (not a font): Teko caps run through a stencil-bridge
mask + slight grain, for cargo-style watermarks («LOTE 01 · QINGDAO»,
section numerals, marquee accents). Contract: a `StencilLabel` component
`(text, size, ink)`. Keeps brand shelves' display type = brand logo only;
the stencil voice is the *container's*, shared by all brands — a unifying
thread across shelves that is logistics-flavored, never SaaS-flavored.

## 7 · Logistics Icon Set — **READY**

12 glyphs, Tier-1 drawing style (2px stroke, 0 radius, 24-grid): container,
cupo/slot, caja, bulto, pallet, precinto (seal), grúa, buque, ruta, aduana,
báscula (weight), certificado. Brand shelves never pull a generic icon
library; brand icons remain content (kit §3.1b law), these remain chrome.

## 8 · OG-Image Generator — **READY**

Contract: satori/`next/og` template `(brand manifest, page type) → 1200×630`:
white canvas, brand logo, container side elevation (asset 1) in brand paint,
RB seal, route line for container pages. Every brand page ships branded
social cards automatically the moment the kit validates — SEO/AEO surface
(§8.6) with zero per-brand design work.

## 9 · Motion Signatures — **READY** (binds to the Odd Ritual grammar port, §2.6)

Three named, reusable moments — the only three; restraint is the brand:
1. **Door-opening reveal** — entering `/marcas/{brand}/contenedor`: the
   door-end SVG's leaves swing (perspective transform, `--ease-gantry`,
   ~700ms) revealing the configurator. Reduced-motion: crossfade.
2. **Arrival settle** — brand tiles / container cards enter with a short
   translate + `--ease-settle`, like a container set down by a crane; the
   ground-shadow ellipse compresses 2px. Subtle, physical, never bouncy.
3. **Curtain flood** — already spec'd (§2.6): route transitions inside the
   brand world flood in `--rb-accent`.

## 10 · Deliberately deferred

- **Sound** (port ambience, container-door thunk): high gimmick risk on a
  wholesale conversion surface; revisit only after brand #3, with the
  audio-design standard (inhabited, not soundtracked).
- **3D/WebGL container**: the SVG system covers hero + OG + diagram needs at
  a fraction of the budget; a WebGL box would fight LCP < 2s. Reconsider only
  for a flagship campaign, as a lazy-loaded island.

---

## Integration map

| Asset | Feeds | When it activates |
|---|---|---|
| Container SVGs (1) | BrandHero, tiles, OG (8), motion (9), FillMeter open-state | Phase 2 |
| RB Seal (2) | MandateSeal, tiles, docs, OG | Phase 2 |
| Packing diagram (4) | Product pages, PackingCascade, Mister `ContainerOfferCard`, PDFs | Phase 3 (needs template data; fixtures until then) |
| Route map (5) | Container cards, workspace, campaigns | Phase 3 |
| Stencil + icons (6, 7) | All shelf chrome | Phase 2 |
| OG generator (8) | Every `/marcas` page | Phase 2 |

Demo: an interactive proof (three fictitious brands re-skinning the container,
seal, and cascade live) is published as a claude.ai Artifact — the same swap
demonstration the §2.7 mockup gate formalizes on claude.ai/design.
