# RB/01 — Áladín · Kit intake

> **Status: STAGED intake — pre-TOWER.** Code `RB/01` is provisional until the
> TOWER `represented_brands` row exists (the DB `unique` constraint is the real
> guard, per SPEC §3.1d). Compiled 2026-07-10 from
> `~/projects/aladin/assets/Aladin-assets-2026/` (source zip:
> `Aladin-assets-2026-20260710T172105Z-2-001.zip`, Drive export).
> Classification ratified 2026-07-10: **coexist** — the /marcas shelf is
> Áladín's first live commercial channel; the standalone origin-house plan
> (`~/projects/aladin/aladin-standalone-stack.md`) stands as the endgame.

## Category — RESOLVED (Muaaz, 2026-07-10)

**Áladín's RB record is a consumer hygiene brand**: Aladín · aladin.pe ·
«¡Cuida tu salud!» — 100% virgin bamboo-fiber toilet paper + facial line
(brandboard p2/p4; catálogo covers `higienico`, `facial`, `venta`).
`categories = ['higiene', 'papel-ecologico']` direction. The July standalone
doc's agri origin-house framing does not describe this RB record; the
standalone plan remains the endgame vehicle, but the shelf sells hygiene
paper. Regulatory screen (§8.3) proceeds on the hygiene basis.

## Mandate + capital model — own brand (Muaaz, 2026-07-10)

Áladín is **our own brand** — the signed mandate is not a blocker. Two
consequences recorded:
- **§8.1 / G7 resolved for RB/01:** capital model is purchase/own-inventory
  by definition — no consignment question, working capital is internal.
  §8.2's `BRAND_REVIEW` approval loop is trivial (same house signs off).
- **Formality still owed:** the MandateSeal component publicly displays a
  verifiable representation document (`mandate.document_refs`). Produce a
  simple Wings×Áladín representation letter before `LIVE` so the trust
  artifact links to something real — a formality, not a negotiation.

## Kit checklist (SPEC §3.1b)

| Slot | Status | Detail |
|---|---|---|
| **Logos** | ✅ with 1 gap | 6 variants, all with SVG: `isologo` (full-color: greens #779843/#90A13E + gold-gradient genie mark), `isologo_tagline`, `positivo` (single-color green — the one-color variant), `isotipo` (mark alone → square-icon candidate), `sello` (circular seal), `trademark`. **Gap:** no true monochrome (black/white) variant — flag to brand. Light-ground legibility: pass (green on white). |
| **Colors** | ✅ validated | Extracted from brandboard p5 + palette SVGs — never sampled from the site. Validator results below. |
| **Imagery** | ⚠ partial | `catalogo/` (facial · higienico · venta slides, 11 files), `carrusel 1/` (4), `carrusel 2/` (9 + social copys docx). These are catalog/social graphics → `products` classification. **Hero-set gap:** no ≥3 standalone brand photography set (brandboard p7 product shots exist only inside the PDF). **Source tags UNCONFIRMED** — human attestation required per §8.7 before anything renders; brandboard mockups (site, polo, tote) are mockups, not evidence. |
| **Icons** | ✅ | `isotipo` mark + 8-icon line set (brandboard p6: roll, recycle, planet, facial, bamboo, leaf, hand, cart). Content only — never replaces Wings chrome iconography. |
| **Docs** | ✅ with 1 formality | Brandboards 1+2 (usage-manual proxy) ✅. Mandate: **own brand — not a blocker** (see section above); representation letter to be produced before `LIVE` for the MandateSeal document link. Contact on record: Muhammad Nawaz, CEO Fundador · +51 987 255848 · hola@aladin.pe · aladin.pe. |

## Proposed token contract (§2.5) — pending ratification

```css
[data-brand="aladin"] {
  --rb-accent:       #5E8A16;  /* principal green — 4.10:1 on white, FAILS 4.5:1 */
  --rb-accent-ink:   #4C7012;  /* derived darkening — 5.78:1 ✓ (required pair) */
  --rb-accent-2:     #C77029;  /* copper — 3.63:1, large-type/decor only */
  --rb-ink:          #44650F;  /* brand-tinted near-black direction — 6.74:1 ✓ */
  --rb-surface-tint: #FCFCF7;  /* ~3% tint from brand cream #F6F6EA (≤4% rule) */
}
```

Full brand palette for reference: greens #5E8A16 · #90A13E · #B9CC76 ·
creams #F1ECE0 · #F6F6EA · yellows/ambers #FCCF40 · #F9AF35 · copper #C77029.
Yellows fail all text contrast (≤1.9:1) — decorative only.

**Typography received but NOT used on the shelf:** Value Serif Pro (principal)
+ Mabry Pro (secundaria), TTFs in the kit. Per §2.5 brands do not get
typefaces inside Wings — reference/document use only. License status of both
faces unverified.

## Regulatory screen (§8.3) — required before ONBOARDING passes

Hygiene + facial paper products: DIGESA sanitary registration, Spanish
consumer labeling law, HS codes per product (48.18 family for toilet/facial
paper — confirm per SKU), importer-of-record obligations. None of this is in
the kit; it belongs to the Phase-0 brand interview.

## Registry line (NOT yet appended — pending G1 ratification)

```
RB/01 · aladin · Áladín · accent #5E8A16 (+ink #4C7012) · hygiene/bamboo-paper
```

Hue-adjacency vs lane accents to be eyeballed in
`packages/liveries/registry.md` when the `## Represented brands` section is
created at registration.

## Packing data (received from Muaaz, 2026-07-10)

Stated facts — papel higiénico line, 40 ft container:

| Fact | Value |
|---|---|
| Boxes per 40 ft container | **1.000** |
| Packets per box | 6 |
| Rolls per packet | 10 → **60 rolls/box** |
| Box weight | 10 kg |
| Boxes per traditional pallet | up to 15 |

**Derived (display-only — server math recomputes per SPEC §2.7③):**
- Full container: 1.000 cajas = 6.000 paquetes = **60.000 rollos** = 10.000 kg.
- 10.000 kg ≪ ~28.500 kg payload → **`governing_bound = CBM`** ✓ (paper
  cubes out before it weighs out).
- Implied box volume ≈ 0,057–0,065 m³ (67–76 CBM × 0,85 utilization ÷ 1.000)
  — **actual box dimensions still needed** for `package_cbm`.

**⚠ Load-mode flag:** 1.000 ÷ 15 ≈ 67 pallets, but a 40 ft has ~20–25 pallet
floor positions (~40–50 pallets at 2-high ≈ 600–750 boxes). The 1.000-box
figure therefore assumes **floor-loaded** cargo; palletized capacity is
materially lower. The designation worksheet must carry both modes — pallet
math applies to destination-side handling, not container capacity.

**Draft `rb_packing_profiles` row (papel higiénico · caja):**
`package_kind='box' · units_per_package=60 (rolls) · package_kg=10.00 ·
package_cbm=TBD (dims pending) · stackable=true`

**Container template — RATIFIED v2 (Muaaz, 2026-07-10: «40HC is the way»):**

```
kind              = '40HC'  (interior 12.032×2.352×2.698 mm · 76,4 m³ · ~28.500 kg payload)
composition       = [papel higiénico (caja 330×440×535) × 940] · floor-loaded
capacity_basis    = 945 computed (grid 27×7×5, 96,1 % vol) → 940 commercial + 5 holgura ops
governing_bound   = 'CBM'   (9.167 kg ≪ payload — paper cubes out)
total_slots       = 10
packages_per_slot = 94 cajas
units_per_slot    = 5.640 rollos  (564 paquetes · ~912 kg per cupo)
```

Cascade the instrument renders:
`1 cupo = 94 cajas = 564 paquetes = 5.640 rollos = 912 kg` ·
`Contenedor: 10 cupos = 940 cajas (+5 de holgura)`.
**v1 (40GP × 1.000) superseded** — 1.000 never fit a 40GP (max 770 computed);
full packing study in [`PRODUCTS.md`](./PRODUCTS.md) + display artifact.
Facial on 40HC packs 1.188 (33×4×9) → draft rate 10 × 118 = 1.180 if/when
facial gets its own template (not yet ratified).

**Product spec data (added 2026-07-10):** full PIM seed for both products —
GTINs, dims, master-box math, pallet data, regulatory status — extracted
from the SPSA (Plaza Vea/Vivanda) codification workbooks into
[`PRODUCTS.md`](./PRODUCTS.md). Highlights: box CBM measured **0,0777 m³**
(higienico) / **0,0590 m³** (facial); both products **«No requiere» registro
sanitario** (SPSA validation 2020 — DIGESA screen effectively answered,
re-verify only if rules changed); origin China/importado confirms the import
direction; the SPSA codification itself is commercial proof for the shelf's
trust layer.

**Capacity conflict RESOLVED (Muaaz, 2026-07-10):** the stated 1.000 was a
40HC figure (945 computed at 96 % vol; mixed stuffing ≈970). Template moved
to 40HC and re-rated 10 × 94 = 940 — see ratified v2 block above. Residual
caveat: box dims are Dec-2020 — confirm current production dims before the
template goes `PUBLISHED`.

**Still needed for §3.2:** current-production box dims (2020 values are the
working basis), facial-line container template if facial goes on the shelf
(profile now exists).

## Still open (Phase-0 gate, SPEC §7)

- G1 ALLOCATION archetype ratification + root CLAUDE.md §5-bis (bundled).
- Confirm current-production box dims against the 2020 codification before
  template `PUBLISHED` (template already re-rated to 40HC · 10 × 94).
- Representation letter (formality — see mandate section).
- G3 price display at launch · hero photography set · monochrome logo
  variant · source-tag attestations.
- ~~DIGESA screen~~ answered for both SKUs («No requiere», SPSA 2020) —
  re-verify only if regulation changed since.
