# EL PASILLO — UI Component Analysis
### Reference teardown → component system · **v4, tile domain + catalogue pipeline**
*Companion to EL-PASILLO-MOBILE-SPEC.md · governs the record layer, the density axis, the variant tier, the state language, and catalogue ingest*

---

# 0 · METHOD & REVISION LOG

Five passes: **inventory → token extraction → axis comparison → rule isolation → translation.**

**Screen references**
- **REF-A** — Sui Overflow '25 (hard-stroke tabular system)
- **REF-B** — Podcast bento (opacity-ladder tiles)
- **REF-C** — Job board (colour-indexed rows, floating dock)

**Domain reference**
- **REF-D** — supplier tile catalogue (Colored Geometric / Massed Glaze / Flower Sea series)

**v2 → REF-B promoted** from refused to governing El Mosaico. Its bento geometry was only ever disqualified *in the lane*.

**v3 → domain correction: ceramic tile, not agricultural.** Three structural consequences, each of which invalidates something in v2:
1. A booth is a **series**, not a single product. Variant tier added (§3).
2. The UI accent goes **achromatic**. Every candidate hue exists in the product (§5).
3. The record ground goes **colour-neutral**. Warm paper misrepresents tile colour (§5).

**v4 → catalogue pipeline added (§9).** The component system is now blocked on data, not design: the facet rail, the variant tier, and the volume footer all require structured SKU data that does not yet exist. §9 specifies how it gets made.

**REF-D is the most important reference in this document.** The supplier catalogue is already REF-A: black spec bar with mono values, tile grid with code + finish + pattern beneath each, red accent for the attribute line. Buyers in this trade already read this document fluently. **The record layer should not invent a language — it should inherit this one and make it interactive.**

---

# 1 · TOKEN EXTRACTION

| Axis | REF-A | REF-B | REF-C | REF-D (catalogue) |
|---|---|---|---|---|
| Container radius | **0px** | 0px full-bleed | ~24px | **0px** |
| Stroke | 1px hard black | none | none | none — grid gap only |
| Fill logic | colour inside illustration only | colour = content identity | colour = brand identity | **colour = the product itself** |
| Hierarchy | numeric index + key/value rows | **opacity ladder** | scale + saturation | **spec bar → grid → caption stack** |
| Type | grotesque, mono numerals | one size, four opacities | display + humanist | grotesque + mono codes, red attribute line |
| Density | high — tabular | low | medium | **very high — 22 SKUs per screen** |
| Data display | **ruled key/value** | none | bulleted prose | inverted spec bar + 3-line caption |

## The four transferable rules

1. **REF-A — structure as decoration.** A ruled key/value row does a card's work for 32px and one hairline.
2. **REF-B — opacity as hierarchy.** One type size, four levels of importance. Free on a mobile GPU, and it is a *state* language, not a layout language.
3. **REF-C — colour as index.** Navigate by hue before reading. In this domain that is not a metaphor — hue *is* the primary product attribute.
4. **REF-D — the inverted spec bar.** Shared specs hoisted out of the grid into one black band above it: `Packing: 45 PCS/CTN · Weight: 17.5 KGS/CTN · 150×150×9MM`. Series-level truth stated once, never repeated per tile. This is the single most efficient component in the entire reference set and it becomes the spine of the booth header (§4.2).

---

# 2 · THE DENSITY AXIS

Three views, one content set, one collect gesture, one record. **Not three products — three zoom levels.**

```
        LANE                 MOSAICO               LISTA
   ┌───────────┐        ┌───┬───┬───┐        ├──────────────┤
   │           │        ├───┼───┼───┤        ├──────────────┤
   │  1 series │  ←→    ├───┼───┼───┤   ←→   ├──────────────┤
   │           │        ├───┼───┼───┤        ├──────────────┤
   └───────────┘        └───┴───┴───┘        ├──────────────┤
   1 per screen          9–15 per screen      ~10 per screen
   presence              recognition          comparison
   walk + swipe          scan + facet         read + bulk
   REF-B state           REF-B geom + REF-D   REF-A structure
```

Mosaico runs denser than v2 specified — tile products are square, self-similar, and legible small. REF-D proves 15–22 per screen stays readable. **3-up default, 2-up and 5-up on pinch.**

Switching preserves position: the series centred in the Lane is the block highlighted in Mosaico is the row scrolled-to in Lista. **Position is never lost across a density change.**

## Governing contract per view

| | Lane | Mosaico | Lista |
|---|---|---|---|
| Reorders? | **Never** | Yes — sort permitted | Yes — sort permitted |
| Filter behaviour | **Lights** (dim/warm in place) | Filters (removes non-matches) | Filters |
| Unit shown | series | **SKU** | SKU |
| Primary gesture | swipe collect / pass | tap collect | checkbox bulk |
| Facet rail | hidden | **visible** | visible |

**The rule: the Lane lights, the Mosaico sorts.** §3.5's guarantee — the aisle never reorders so spatial memory survives — is a property of the Lane only. Mosaico has no spatial memory to protect.

---

# 3 · THE VARIANT TIER (v3, structural)

The spec assumes booth = product. REF-D shows booth = **series containing 14–22 SKUs**. A 24-booth lane therefore holds ~400 SKUs. This changes the core loop.

## The two-tier data model

```
SERIES  (= booth)                     ← shared, stated once
  ├ format         150×150×9mm
  ├ packing        45 PCS/CTN
  ├ weight         17.5 KGS/CTN
  ├ coverage       1.01 m²/CTN
  ├ application    floor · wall
  └ technical      PEI III · R10 · <0.5% absorption

  SKU  (= variant)                    ← per tile, 14–22 of them
    ├ code         TF1500152
    ├ finish       massed glaze · glossy
    ├ pattern      1 pattern / 4 patterns
    ├ colourway    deep blue
    └ family       arabesque
```

## Collect granularity — the decision

Three options, and it must be resolved before build:

| Model | Behaviour | Verdict |
|---|---|---|
| Collect series | one item, refine SKUs later | Too coarse — a buyer wants *these six patterns*, not the series |
| Collect SKU only | swipe/tap per tile | Too slow — 400 SKUs, and swipe-per-tile is a feed |
| **Two-speed (recommended)** | **Lane swipe collects the series as a folder; Mosaico tap collects individual SKUs into it** | Matches how buyers actually shortlist: series first, patterns second |

**Recommended: two-speed.** Swipe right in the Lane adds the series to the muestrario as a **folder** with all SKUs pre-checked. Opening the folder — or working in Mosaico — lets the buyer uncheck down to the six they want. Collecting is broad and fast; refining is precise and deliberate. The gesture count for a fast pass stays at one, and §6's gate is preserved.

The muestrario therefore has two row types: **series rows** (expandable, showing `14 SKUs · 6 selected`) and **SKU rows** (leaf items). Sorting operates at both levels.

---

# 4 · COMPONENTS

## 4.1 The facet rail (v3) — REF-C's rule, three axes deep

Tiles are multi-attribute visual goods. One filter axis is not enough. The rail sits above the Mosaico grid, horizontally scrolling, three groups separated by a hairline:

**Colour** — 32px circles, dominant colours extracted at ingest. Suppliers already name them, so use their names: White Gray · Blue Green · Earthy Yellow · Deep Yellow · Zirconium Red · Dark Gray. Multi-select. Sort-by-colour arranges along the hue wheel.

**Pattern family** — 40px pattern thumbnails, not text chips. A buyer recognises *arabesque* faster than they read it:
`solid/plain · geometric · arabesque/moorish · floral · encaustic/cement · marble-look · wood-look · terrazzo`

**Finish** — text chips, because finish is tactile and cannot be shown at 40px: `matte · glossy · massed glaze · polished · satin · textured/anti-slip`

Secondary facets behind a `MÁS FILTROS` sheet: format (150×150 · 200×200 · 300×300 · 600×600), thickness, PEI rating, R slip rating, water absorption, rectified edge, application.

**All swatch and pattern chips render on the neutral ground, never on colour.** A facet chip that sits on a tinted surface lies about the colour it represents.

## 4.2 Booth header — REF-D's inverted spec bar

The single best component in the reference set, adopted almost unchanged:

```
┌─────────────────────────────────────┐
│ FLOWER SEA SERIES                   │  ← display 22/600
│ 300×300×8.8MM                       │  ← mono, --resting
├═════════════════════════════════════┤
│ 15 PCS/CTN · 25 KGS/CTN · 1.35 m²  │  ← INVERTED BAR: ink ground,
└═════════════════════════════════════┘     paper mono type, 32px
   22 DISEÑOS          ● DISPONIBLE
```

Series truth is stated once at the top and never repeated on a tile. Every SKU beneath inherits it. This is what lets Mosaico run at 15-per-screen — the tiles carry only what differs.

## 4.3 SKU tile — REF-B geometry, REF-D caption

```
┌──────────────┐
│              │
│  [tile face] │  ← full-bleed, square, no stroke, no radius
│              │
└──────────────┘
  TF1500152       ← mono 11px, --lit
  Massed glaze    ← 10px, --resting
  1 patrón        ← 10px, --dimmed
```

- **Square aspect, always.** The product is square; framing it otherwise misrepresents it.
- No stroke, no radius, no gap-fill — REF-B tile logic. The grid is the structure.
- Caption stack is REF-D exactly: code → finish → pattern count, three opacity levels, one type size.
- Long-press → collect. Haptic tick.
- **Collected state is achromatic** (§5): 2px inset double-stroke, paper-then-ink, plus a filled ink corner triangle carrying a paper ✓. Reads on white tiles, navy tiles, and pink tiles identically.

## 4.4 The repeat preview — the sheet's signature

**A single tile face does not tell a buyer what the floor looks like.** REF-D proves this: the supplier includes installed room renders because the tile alone is illegible at purchase-decision level. This is the most under-served moment in the whole flow and it belongs in the sheet.

Three states, toggled by a segmented control inside the sheet:

```
  [ 1× ]   [ 3×3 ]   [ AMBIENTE ]
  single    repeat     room render
```

- **1×** — the face, full width, for colour and detail judgement
- **3×3** — the tile tiled, revealing the joint, the motif alignment, and whether the pattern reads as a field or as noise. For multi-pattern SKUs (`4 patterns`) the repeat randomises faces exactly as installation would.
- **AMBIENTE** — supplier room render where available; a generic floor/wall composite where not

The 3×3 is the one the buyer will actually use, and it is cheap: one texture, CSS `repeat`, no 3D. It should be the default state, not 1×.

## 4.5 Sheet-dock — REF-C geometry, REF-A contents

Three detents via `vaul`: peek 35% · full 92% · dismissed.

- Top corners `--radius-chrome`, bottom square. 4px grabber, `--ink` @ 20%.
- **Peek** — repeat preview at 3×3, code, finish, collect. The buyer judges the field and collects without leaving the view.
- **Full** — preview toggle, then the REF-A ruled table:

```
Código              TF1500152
Serie               Massed Glaze
Formato             150×150×9 mm
Acabado             Massed glaze · Glossy
Patrones            1
Piezas/caja         45
Cobertura           1.01 m²/caja
Absorción           <0.5 %
PEI                 III
Antideslizante      R10
Aplicación          Piso · Pared
```

Ruled rows, `--rule-soft` between, label `--resting`, value `--lit`, mono where numeric. No chips, no icons.
- Below the table: **the sibling strip** — a horizontally scrolling row of the other SKUs in the series, so a buyer who likes this pattern sees its family without navigating away. Collect directly from the strip.
- Horizontal swipe → next SKU's sheet. Contents cross-fade 180ms, frame never moves.
- Scrim: `--lane-ground` @ 0.55, blur 8px max. **Cap it** — blur is the battery line item.

## 4.6 Swipe grammar — the fast pass

| Gesture | Result |
|---|---|
| **Swipe right** (Lane) | Collect series as folder, all SKUs pre-checked |
| **Swipe left** (Lane) | **Pass.** Series dims to 0.34, lane advances |
| **Tap** | Sheet-dock, peek detent |
| **Long-press** (Mosaico) | Collect single SKU |

**Pass is not reject.** The series stays in position, stays in the scrubber, stays reachable, re-lights on scroll-back or filter clear. Nothing flies off a deck. The lane is finite and revisiting is core, so a destructive skip would fight the edge scrubber directly.

Thresholds: 25% of card width or velocity >0.4 to commit; below that, spring back at damping 0.8. Rotation on drag capped at 4° — physical, not a dating app.

Passes **expire at session end.** A returning buyer gets a fully lit lane, because tile stock and series availability change and a remembered pass could permanently hide a supplier whose situation improved. Returning-visit intelligence belongs in what's-new lighting instead.

**No gamification.** No streaks, no scores, no progress rewards. This is procurement.

## 4.7 Muestrario — two row types

Series row (expandable):
```
┌──┬────┬──────────────────────────┬──────────┬───┐
│▣ │[im]│ Flower Sea Series        │ 22 SKUs  │ ▾ │
│  │    │ 300×300 · Matte          │ 6 elegidos│  │
└──┴────┴──────────────────────────┴──────────┴───┘
```
SKU row (leaf, indented 16px):
```
   ┌──┬────┬───────────────────────┬─────────┬───┐
   │▢ │[im]│ PM33708               │ 1.35 m² │ ● │
   │  │    │ Matte · encáustico    │  mono   │   │
   └──┴────┴───────────────────────┴─────────┴───┘
```

- 64px rows, `--rule-soft` between, zero radius, no card
- Tri-state checkbox on series rows: none / partial (`▣`) / all
- Checked items float above under a mono eyebrow: `SELECCIONADOS · 6`
- Bulk bar at ≥1 checked: annotate · remove · export · enviar a RFQ
- Long-press → drag → reorder. The buyer's logic outranks ours.
- Notes collapse to one mono line, `--resting`; voice notes show `0:14` + 24px play
- Empty state: **"El muestrario está vacío. Desliza a la derecha para guardar una serie."**

## 4.8 The volume footer (v3) — tile-specific, high value

Tiles are bought by area and shipped by container. A muestrario that totals items but not **m² and container fill** is not a procurement document. Persistent footer inside the ledger:

```
├─────────────────────────────────────┤
│ 6 SKUs · 42 cajas · 56.7 m²         │  ← mono
│ ████████████░░░░  0.8 × 20' FCL     │  ← fill bar
└─────────────────────────────────────┘
```

Tap to switch basis: m² ↔ cajas ↔ piezas ↔ 20′/40′ containers. Editable quantity per SKU recalculates live. This single component is likely the strongest reason a buyer keeps the app open instead of emailing a screenshot of the catalogue.

## 4.9 Edge scrubber (Lane only)

3px rail, right edge, full height, `--ink` @ 12%. Tick per series. **Collected series tick solid ink; passed series tick hollow.**

Signature element: *the buyer's collected series are visible as marks on the aisle itself.* The record and the walk become the same object seen two ways.

Drag: 44px invisible hit area, thumb-track blur, position always continuous. Doubles as progress bar.

## 4.10 Lane lighting

Filter applied → matches `--lit`, non-matches `--dimmed`. **Nothing moves, reorders, or unmounts.** 240ms ease. Clearing relights — no re-entry animation, no scroll-restoration bug, no layout shift.

In Mosaico the same filter *removes* non-matches with a 200ms stagger; there is no spatial memory to protect and density is the point.

## 4.11 Status lamp

8px dot + mono caps label. Green available · amber pre-order/made-to-order · hollow ring discontinued. **Lives only on the record ground and the series header — never on a tile face.** Label always accompanies the dot.

## 4.12 Trade Desk

Record layer, full REF-A. Ruled editable table: quantity per SKU (in m² or cajas), destination port, incoterm, target date. Each line carries its lamp and note. The volume footer carries over and drives a container-load line.

Two send actions, equal weight, `--radius-chrome`: **WhatsApp** and **Email**. Parity mandatory. Below, unadorned: *"Respuesta en 24h hábiles."* The sentence is the promise.

---

# 5 · COLOUR DOCTRINE (v3, replaces v2 palette)

**Principle: when the product is colour, the interface is achromatic.**

Every accent hue I could assign already exists in the catalogue. Massed Glaze is overwhelmingly cobalt. Flower Sea contains hot pink, sage, terracotta. Colored Geometric contains earthy yellow and zirconium red. A coloured "collected" mark would vanish on some tiles and clash on others. So collected state is communicated by **form and value**, never hue.

```
/* Ground — colour-neutral by requirement, not preference */
--surface:      #F0EFEE   /* record ground. neutral: no cast on tile colour */
--surface-2:    #E6E5E4   /* grid gap, inset wells */
--ink:          #141414   /* rules, type, spec bars, collected mark */
--lane-ground:  #0D0D0D   /* 3D lane, recedes */

/* No chromatic accent. Interactive state = value + form. */
--collected:    2px inset double-stroke (--surface then --ink)
                + filled ink corner triangle with paper ✓

/* Status only — 8px dots on neutral ground, never on a tile */
--lamp-avail:   #14A05A
--lamp-made:    #E08A00
--lamp-disc:    transparent + 1px --ink @ 30%

/* State ladder (REF-B) */
--lit:     1.00
--resting: 0.62
--dimmed:  0.34   /* filter non-match AND passed */

/* Geometry */
--radius-record: 0px   /* every record surface, every tile */
--radius-chrome: 24px  /* every surface the thumb touches */
--rule:          1px solid var(--ink)
--rule-soft:     1px solid rgba(20,20,20,0.14)

/* Type */
display: Archivo — tight tracking (-0.02em), 600
body:    Archivo — 400
data:    Geist Mono — SKU codes, formats, m², weights, PEI/R ratings
```

**Why neutral, specifically:** a warm ground shifts perceived hue. `HJ-F1551 White Gray` beside `HJ-F1552 Blue Green` on unbleached paper would read warmer and greener than the fired tile. Buyers reject shipments over colour variance. The ground is a measurement instrument, not a mood.

**Every SKU code is mono.** It is the thing the buyer types into a WhatsApp message at 11pm. It should look like a part number because it is one.

**The tension: soft chrome, hard record, achromatic interface, chromatic product.** The only colour on screen that matters is the tile's.

---

# 6 · WHAT TO REFUSE

| From | Refuse | Because |
|---|---|---|
| REF-A | dense illustration collages | texture budget — hi-res for current series ±1 only |
| REF-A | hard stroke on chrome | thumb targets must read soft against the record |
| REF-B | bento *in the Lane* | simultaneous objects contradict one-series-at-a-time |
| REF-B | translucency / blur stacks | battery gate: <8% per 10 min |
| REF-B | tinted tile grounds | falsifies product colour |
| REF-C | overlapping z-stacked cards | contradicts continuous lane + soft snap |
| REF-C | brand-colour-flooded cards | all colour belongs to the product |
| REF-D | 3-line caption on every tile in Lane view | series header carries it once |
| Tinder | destructive skip, card-off-deck | lane is finite; revisiting is core |
| Tinder | streaks, scores, rewards | procurement, not play |
| all | non-square tile crops | misrepresents the product |
| all | top-corner controls | nothing critical above the thumb zone except the view switch |

---

# 7 · GATE CHECK

- ✅ Collect ≤1 action + haptic — swipe-right takes a whole series
- ✅ Muestrario <200ms — persistent tab, IndexedDB-hydrated, no route transition
- ✅ One-handed 24-series walk — all interactive elements in bottom 60%; view switch is the sole exception
- ✅ RFQ ≤3 taps from open muestrario
- ⚠️ **Verify on device:**
  - Colour fidelity of tile thumbnails on OLED vs LCD at both brightness extremes — this is the domain's hardest visual requirement
  - Achromatic collected mark legibility on white, navy, and pink tiles
  - Mosaico at 15-per-screen: tap accuracy vs. thumb size
  - Swipe-collect vs. sheet-swipe collision
  - Position preservation across all six view transitions
  - 3×3 repeat render cost when scrolling a facet-filtered grid

**The surprising moment** is 4.4 — the 3×3 repeat as the default preview, so the buyer judges the *field* rather than the face. It is the difference between a catalogue and a sourcing tool, and it costs one CSS property.

---

# 8 · ROADMAP DELTA

- **P1** — Lane + two-speed collect + muestrario (series/SKU rows, tri-state) + sheet-dock with 3×3 repeat + volume footer + Trade Desk + Lista. The variant tier and the volume footer are **not** deferrable; without them the record is not a procurement document.
- **P2** — Mosaico + facet rail (colour, pattern, finish) + secondary technical facets + AMBIENTE renders + compare + voice notes + PDF/WhatsApp export + PWA offline. Depends on ingest-time colour extraction and pattern-family tagging — backend work that runs parallel to P1.
- **P3** — multiple lanes (one per session), what's-new lighting, remembered position.
- **Not now** — the atrium, junctions, tours, any second simultaneous category.

**Ingest dependency (blocking for P2):** every SKU needs dominant-colour extraction (k-means, 3 values, server-side — never on device) and a pattern-family tag. Pattern family cannot be derived reliably by colour clustering; it needs either a vision-model pass at ingest or supplier-side classification. Decide which before P2 scoping.

---

*Three densities, two tiers, one record. The Lane lights, the Mosaico sorts, the interface stays out of the colour's way.*

---

# 9 · THE CATALOGUE PIPELINE (v4)

*Every component in §4 is blocked on structured SKU data. This section specifies how supplier PDFs become that data, and where a human belongs in the loop.*

## 9.1 Evaluation of the proposed flow

**Proposed:** author a variant-signed catalogue in Excel → use the finished Excel as the database → upload → bind images in the system.

**What is right, and should not be changed:**
- **Excel as the authoring and correction surface.** Classification work — normalising finish, tagging pattern family, entering commercial terms — is tabular, repetitive, and human-judgement-dependent. A spreadsheet is the correct instrument, and it requires no training for a supplier or an assistant to use.
- **A single deliberate authoring step before anything reaches the product.** Catalogue data that enters the system unreviewed will surface as broken facets on a buyer's phone. A gate is right.
- **Excel as the interchange format with suppliers.** They will send corrections in Excel regardless. Fighting this is wasted effort.

**Three inversions:**

**Inversion 1 — extraction-first, not authoring-first.** The proposed order implies a human builds the sheet and images are attached afterward. The expensive work is not the rows; it is cropping ~400 tile faces from PDF pages and binding each to its printed code. Automate that first and emit a **pre-populated workbook with image paths already filled**. The human then corrects rather than transcribes. Order-of-magnitude difference in cost per catalogue.

**Inversion 2 — Excel is the source of truth for authoring, never the runtime store.** It must be imported into a real database (Supabase/Postgres) behind a validating, idempotent importer. Excel is never read by the app. Re-importing a corrected sheet must update, never duplicate.

**Inversion 3 — images are their own table, not a column.** `4 Patterns` SKUs carry four distinct faces; series carry ambience renders; some SKUs have a supplier lifestyle shot. One-image-per-row cannot express this.

**Two gaps in the proposal:**
- **No commercial layer.** The catalogue contains no price, MOQ, lead time, or incoterm — those come from separate negotiation. They need their own block, editable independently of technical specs, on a different revision cycle.
- **No controlled vocabulary.** The supplier writes `Flat、Matte Surface` and `Massed glaze、Glossy` (note the ideographic comma — Chinese-origin templates). Free text in these columns produces a facet rail with fourteen near-duplicate "matte" entries.

## 9.2 The seven stages

```
① INTAKE        supplier PDF/PPT → page images @300dpi, page manifest
② DETECT        grid detection per page → tile bounding boxes
③ CROP          seam-exact square crops → /raw/{page}_{index}.png
④ OCR           caption block per crop → code · finish · pattern count
                spec bar per page → format · pcs/ctn · kgs/ctn · series name
⑤ PROPOSE       vision pass → pattern_family + colourway proposals w/ confidence
                colour extraction → 3 dominant hex per face
⑥ WORKBOOK      emit .xlsx, pre-populated, flagged where confidence < threshold
                ── HUMAN CORRECTION LOOP ──
⑦ IMPORT        validate → stage → upsert to Postgres → generate derivatives → publish
```

Stages ①–⑥ are automated and re-runnable. Stage ⑥→⑦ is the only human gate. Stage ⑦ is idempotent on `sku_uid`.

**Where this connects to existing work:** stages ①–④ overlap substantially with WINGS_INGESTA_PIPELINE.md. Extend that pipeline with a *grid-catalogue* mode rather than building a parallel one — the difference is that a tile catalogue page is a lattice of products, not a single technical datasheet.

## 9.3 The workbook model

**Three data sheets plus two vocabulary sheets.** Not one flat sheet — flattening repeats series specs 22 times and someone will typo one of them. This is the same error REF-D's spec bar avoids visually; avoid it in the data for the same reason.

**Sheet `SERIES`** — one row per booth
```
series_uid          WGT-HUAJIA-FLOWERSEA          ← generated, locked
supplier_id         HUAJIA
series_name_raw     Flower Sea Series
series_name_es      Serie Flower Sea
format_mm           300x300x8.8
width_mm            300          ← numeric, feeds coverage
height_mm           300
thickness_mm        8.8
pcs_per_ctn         15
kgs_per_ctn         25
m2_per_ctn          1.35         ← COMPUTED
application         floor|wall   ← enum, multi
pei_rating          III          ← enum
slip_r_rating       R10          ← enum
water_absorption    <0.5%
rectified           no
sku_count           22           ← COMPUTED
status              available|made_to_order|discontinued
ambience_images     fs_room_01.jpg; fs_room_02.jpg
notes_internal
```

**Sheet `SKU`** — one row per variant, joined on `series_uid`
```
sku_uid             WGT-HUAJIA-FLOWERSEA-PM33708  ← generated, locked
series_uid          WGT-HUAJIA-FLOWERSEA          ← FK, dropdown-validated
code_supplier       PM33708                        ← as printed
code_format         PM                             ← COMPUTED prefix class
finish_raw          Flat、Matte Surface            ← preserved verbatim, audit
finish              matte                          ← enum, dropdown
pattern_count       1
pattern_family      encaustic                      ← enum, dropdown
pattern_confidence  0.82                           ← from ⑤, flags review
colour_primary      #C9A27A                        ← extracted
colour_secondary    #3F4A52
colour_name         Earthy Yellow                  ← supplier's own name if given
face_count          1                              ← COMPUTED from IMAGES
seam_qa             pass|fail|unchecked
review_flag         TRUE/FALSE                     ← COMPUTED from confidences
status              inherit|override
```

**Sheet `IMAGES`** — one row per file, many per SKU
```
image_uid           WGT-HUAJIA-FLOWERSEA-PM33708-F1
sku_uid             ← FK, blank if series-level
series_uid          ← FK
role                face|ambience|detail|packaging
face_index          1..4
source_file         raw/p07_i12.png
crop_bleed_ok       TRUE/FALSE
seam_check          pass|fail
```

**Sheet `COMMERCIAL`** — separate revision cycle, keyed on `sku_uid` or `series_uid`
```
fob_price_usd_m2 · moq_m2 · moq_ctn · lead_time_days ·
incoterm_base · port_of_loading · price_valid_until · currency · notes
```

**Vocabulary sheets `VOCAB_FINISH`, `VOCAB_PATTERN`** — the enum source for every dropdown, plus a `raw → canonical` mapping table so supplier strings resolve automatically on re-import.

## 9.4 Computed, never typed

| Field | Formula | Why |
|---|---|---|
| `m2_per_ctn` | `pcs_per_ctn × (width_mm/1000) × (height_mm/1000)` | verified: 45×0.15²=1.0125 · 15×0.30²=1.35 |
| `sku_count` | `COUNTIF(SKU!series_uid, series_uid)` | catches orphaned or missing SKUs |
| `face_count` | `COUNTIFS(IMAGES!sku_uid, sku_uid, role,"face")` | must equal `pattern_count` or the row is wrong |
| `sku_uid` | concat of supplier + series + code | never hand-edited |
| `review_flag` | `pattern_confidence<0.75 OR seam_qa<>"pass" OR face_count<>pattern_count` | the human's worklist |

`face_count ≠ pattern_count` is the single highest-value validation in the workbook: it catches a `4 Patterns` SKU that only got one crop, which would otherwise ship a broken 3×3 repeat to a buyer.

## 9.5 Controlled vocabularies

```
finish          matte · glossy · massed_glaze · polished · satin ·
                textured_antislip · lappato · rustic
pattern_family  solid · geometric · arabesque_moorish · floral ·
                encaustic_cement · marble_look · wood_look · terrazzo ·
                stone_look · concrete_look
application     floor · wall · exterior · wet_area · commercial
status          available · made_to_order · discontinued
```

Every enum is a dropdown with data validation. `finish_raw` is always preserved alongside the canonical value — when a supplier disputes a spec, the original string is the evidence.

**Pattern family cannot be derived from colour clustering.** It needs a vision-model pass at ingest (proposing with a confidence score) or supplier-side classification. If you go supplier-side, add the column to the request template in the intake pipeline now — it costs nothing at request time and is expensive to retrofit.

## 9.6 The image contract

- **Crop:** square, tight to the tile bleed. No white margin, no drop shadow, no catalogue page background. Off-by-two-pixels produces a visible seam in the 3×3.
- **Seam QA:** automated — tile the crop 2×2, sample a 4px band across each internal joint, flag if luminance or hue discontinuity exceeds threshold. Cheap to run, and it protects §4.4.
- **Naming:** `{sku_uid}-F{face_index}.{ext}` after import. Raw filenames stay in `source_file` for traceability back to the PDF page.
- **Derivatives generated at import:** `thumb` 320px (Mosaico grid) · `face` 1024px (sheet 1× and 3×3 repeat) · `full` 2048px (pinch-zoom) · AVIF + WebP. Never resize on device.
- **Colour management:** convert to sRGB at import and strip embedded profiles. A tile crop carrying AdobeRGB will render visibly off on mobile, and colour fidelity is this domain's hardest visual requirement (§7).

## 9.7 The import contract

1. **Validate** — schema, enums, FK integrity, computed-column agreement, `face_count = pattern_count`, seam QA pass. Reject the whole file on hard failure; report row-and-column.
2. **Stage** — write to staging tables, produce a diff report: `+18 new SKUs · 4 changed · 1 discontinued`.
3. **Confirm** — human approves the diff. This is the second and last gate.
4. **Upsert** — keyed on `sku_uid`. Never insert-only. A corrected sheet re-imported must update in place.
5. **Derive** — generate image derivatives, extract colours if missing, build facet indexes.
6. **Publish** — flip series `visible=true`. Nothing is buyer-visible until this step.

**Soft-delete only.** A discontinued SKU sets status and drops out of the Lane, but must still resolve — a booth permalink in a buyer's muestrario from three weeks ago cannot 404. This is required by the spec's booth-permalink guarantee and by the muestrario's 7-day persistence gate.

## 9.8 What Excel must never do

| Never | Instead |
|---|---|
| Serve as the runtime read layer | Postgres, imported |
| Store image binaries | object storage + `IMAGES` sheet references |
| Hold hand-typed `sku_uid` or coverage | computed columns, locked |
| Hold free-text finish or pattern | dropdown enums + raw column |
| Be edited by two people at once | one owner per catalogue, versioned filename |
| Carry pricing to the buyer-facing system unreviewed | `COMMERCIAL` sheet, separate approval |

## 9.9 Throughput and ownership

| Stage | Owner | Est. per 22-SKU page |
|---|---|---|
| ①–⑤ automated | pipeline | seconds |
| ⑥ correction loop | catalogue assistant | ~5 min — corrections only, flagged rows first |
| Commercial block | trade lead | separate pass, per negotiation |
| ⑦ diff approval | trade lead | ~2 min |

Fully manual transcription of the same page runs closer to 40 minutes and carries a much higher error rate on codes — which are the exact strings a buyer pastes into WhatsApp. The correction-loop model is roughly an order of magnitude cheaper, and the errors it does produce are caught by the computed-column validations rather than by a buyer.

Decisions that gate this section are carried in **§10 · Open Decisions** rather than resolved here.

---

*Extraction proposes, a human corrects, the importer enforces, the database serves. Excel is where judgement happens — never where the app reads.*

---

# 10 · OPEN DECISIONS — HANDOFF

*Unresolved by design. Each entry states the fork, the recommendation, the constraints that hold either way, and what it blocks. Resolve in Claude Code, then record the outcome back into this file as a dated line under the chosen option — this document stays the source of truth, so a decision made and not written here is a decision that will be re-litigated.*

---

### D-01 · `sku_uid` namespace scheme
**Fork.** `WGT-{supplier}-{series}-{code}` versus a shorter opaque key with the supplier code as an indexed attribute.
**Recommendation.** The verbose namespaced form. It is human-readable in a spreadsheet, debuggable in a URL, and collision-proof across suppliers.
**Holds either way.** Generated, never hand-typed. Case-normalised. Safe for filenames and URL paths. Stable for the life of the SKU.
**Blocks.** All of §9 — no row may be entered before this is fixed. It is the only field that cannot change later without re-keying every image file and every saved muestrario.
**Note.** Five code formats appear in a single supplier catalogue (`HJ-F1551`, `1500084`, `TF1500148`, `PM33309`, `T3589`), almost certainly distinct factory or OEM lines. Whatever scheme is chosen must survive that, and must survive a second supplier shipping a colliding `T3589`.

**RESOLVED 2026-07-28 — verbose namespaced form, with the format in the key.**
`WGT-{SUPPLIER}-{SERIESSLUG}-{WIDTH}` for a series, `…-{CODE}` for a SKU.
The width is part of the key because this supplier ships *Massed Glaze* at
150×150 (45 pcs/ctn) and *Massed Glaze Series* at 300×300 (11 pcs/ctn) — keying
on the name alone silently merges two series with different packing and corrupts
every carton figure downstream. Eleven code classes were found, not five
(`HJ-F`, `HJ-J`, `HJ-M`, `HJ-D`, `HJ`, `PM`, `XPM`, `TF`, `T`, `G`, bare
numeric); the prefix is stored as `code_class` rather than parsed at read time.
Generated in `build_catalog.py`, never hand-typed.

---

### D-02 · Pattern-family classification source
**Fork.** Vision-model pass at ingest (proposes with confidence, human confirms) versus supplier-side classification requested in the intake template.
**Recommendation.** Both, in that order of priority — supplier-side where obtainable, vision model as the fallback and as a cross-check. Colour clustering cannot produce this field; that is settled.
**Holds either way.** `pattern_family` is a closed enum (§9.5). `pattern_confidence` persists so `review_flag` can surface low-confidence rows. `finish_raw` and any supplier-supplied classification are preserved verbatim for audit.
**Blocks.** The Mosaico facet rail (§4.1), therefore all of P2.
**Time-sensitivity.** If supplier-side, the column must be added to the intake request template *now* — free at request time, expensive to retrofit across a catalogue already received.

**PARTIALLY RESOLVED 2026-07-28 — colour extraction shipped, pattern family deferred.**
Dominant colours are extracted at build time (k-means, 3 values, deterministic
seeding so a rebuild never reshuffles a facet) and carried on every SKU.
`pattern_family` is NOT populated and is not guessed: colour clustering cannot
produce it, and a facet rail that mislabels a tile is worse than one that omits
the axis. This is what keeps the Mosaico + facet rail in P2. The recommendation
stands: request the column from the supplier now.

---

### D-03 · `COMMERCIAL` sheet placement
**Fork.** Same workbook as `SERIES`/`SKU`, or a separate file.
**Recommendation.** Separate. Different audience, different revision cadence, different confidentiality — a catalogue assistant correcting crops should not have FOB pricing open in the next tab.
**Holds either way.** Keyed on `sku_uid` or `series_uid`. Approved on its own pass, never published by the same action that publishes technical data. The buyer-facing system must render missing price gracefully as *precio a consultar* rather than as an empty cell.
**Blocks.** Trade Desk pricing lines (§4.12); not P1-blocking if the RFQ ships quote-on-request.

**RESOLVED 2026-07-28 — separate, and absent from P1.** The Trade Desk ships
quote-on-request: no price, no MOQ, no lead time anywhere in the build, because
none of it exists in the supplier catalogues and the tool states quantities so
the supplier can state the price. No `COMMERCIAL` sheet was created.

---

### D-04 · Collect granularity
**Fork.** Series-level, SKU-level, or two-speed.
**Recommendation.** Two-speed (§3): Lane swipe takes the series as a folder with SKUs pre-checked; Mosaico and the folder view refine down to individual patterns.
**Holds either way.** Collect stays ≤1 action with haptic (§7 gate). The muestrario supports both row types with tri-state parent checkboxes. Whatever is chosen, a fast full-lane pass must not require per-SKU interaction across ~400 SKUs.
**Blocks.** Muestrario row model (§4.7), swipe grammar (§4.6), volume-footer aggregation logic (§4.8). P1-blocking.

**RESOLVED 2026-07-28 — two-speed, as recommended.** A Lane swipe-right collects the
series as a folder with all SKUs pre-checked; the folder view and the Lista
refine down to individual patterns. The muestrario carries both row types with a
tri-state parent checkbox. A full-lane pass is 10 gestures, not 236.

---

### D-05 · Sheet-swipe gesture collision
**Fork.** Keep horizontal swipe as next-SKU inside the sheet, or move sheet navigation to a top-edge segmented pager.
**Recommendation.** Ship the swipe, instrument it, decide on device. The sheet fully occludes the card so the collision is likely theoretical — but "likely" is not a finding.
**Holds either way.** Collect must never fire from inside an open sheet by gesture alone. Sheet frame never moves during navigation; contents cross-fade only.
**Blocks.** Nothing structurally. Resolve during on-device testing (§7).

**DEFERRED 2026-07-28 — shipped as specified, still unverified on device.** Horizontal
swipe inside the sheet is NOT implemented in P1; the sibling strip covers moving
between SKUs in a series, which removes the collision surface entirely for now.
Revisit if the strip proves insufficient in use.

---

### D-06 · Reduced-motion / no-WebGL default view
**Fork.** Mosaico (v3 position) or Lista (v2 position).
**Recommendation.** Mosaico — cheaper than the lane, more useful than a text list, and for a visual product the grid is the honest fallback.
**Holds either way.** Lista remains the accessibility floor and stays one tap away. Full collect, check, sort and RFQ capability exists in every view; no view is degraded in function.
**Blocks.** View-switch defaults (§4.5). Low risk, easily reversed.

**RESOLVED 2026-07-28 — Lista, because Mosaico is P2.** The recommendation assumed
Mosaico exists; it does not yet (blocked on D-02). Lista is therefore both the
reduced-motion fallback and the accessibility floor, and it carries full collect,
check, sort and filter capability. Revisit when Mosaico ships.

---

### Decisions already closed — do not reopen without cause

| | Decision | Rationale |
|---|---|---|
| C-01 | Interface is achromatic; all colour belongs to the product | every candidate accent hue exists in the catalogue (§5) |
| C-02 | Record ground is colour-neutral | warm ground falsifies perceived tile hue; buyers reject on colour variance |
| C-03 | Lane lights, Mosaico sorts | protects the aisle's spatial memory without blocking sort where it is useful (§2) |
| C-04 | Pass is non-destructive and expires at session end | lane is finite, revisiting is core, stock changes between visits |
| C-05 | No gamification of the collect loop | procurement, not play |
| C-06 | 3×3 repeat is the default sheet preview | a single face cannot express a field; costs one CSS property (§4.4) |
| C-07 | Excel authors, Postgres serves | Excel is never a runtime read layer (§9.8) |
| C-08 | Extraction proposes, human corrects | inverts the cost curve of catalogue ingest (§9.1) |
| C-09 | Soft-delete only for discontinued SKUs | booth permalinks and 7-day muestrario persistence cannot 404 |

---

*Six open, nine closed. Resolve D-01 first — everything in §9 waits on it.*


---

# 11 · BUILD LOG — 2026-07-28

**Built (P1, per §8):** the two-tier catalogue pipeline (§9 stages 1-3, 5-6),
the Lane with its swipe grammar and edge scrubber, the booth header's inverted
spec bar, the sheet-dock with the 3×3 repeat defaulted on, the muestrario's two
row types with tri-state, the volume footer, the Trade Desk with WhatsApp/email
parity, and the Lista.

**Not built, deliberately:** Mosaico and the facet rail (P2 — blocked on D-02's
pattern-family tagging); AMBIENTE renders (no supplier room renders are bound to
series yet); voice notes, compare, PDF export, PWA offline (P2); everything in
P3.

**Two data defects the §9.4 validation caught, both real:**
1. Sheet B13 was under-extracted — three SKUs (`PM3538`, `PM3557`, `XPM3003`)
   whose lower edges are near-white blended into the page ground, so the XY-cut
   truncated their blocks and the square test dropped them. Grid recovery now
   snaps a truncated block to the row its neighbours define; the sheet is
   exhaustive at 21 and the catalogue at 278 faces.
2. `PM3001` prints "(1 Patterns)" beside 21 visually distinct swatches. Recorded
   as printed and flagged `review_flag`; the sheet says so rather than guessing.
   It is the only flagged row in the catalogue.

**Where the spec was not followed exactly, and why:**
- `--radius-chrome` is 20px, not 24px. The ecosystem's Tier-1 radius scale
  (root `CLAUDE.md` §2) tops out at dock 20px and is frozen. The principle —
  soft chrome over a hard record — is unchanged; the value stays inside the
  scale rather than 4px outside it.
- Waste percentage (10% straight / 15% diagonal) is absent. It is not in this
  spec, and quantity here is what the buyer wants *supplied*. Worth adding: a
  buyer ordering exact coverage will be short after cuts.

**Counts:** 10 series · 236 SKUs · 278 faces · 8.9 MB of WebP derivatives
(thumb 320px, face 512px). First load 134-156 kB gz per route.

---

## 12 · MOUNT LOG — 2026-07-28/29

The catalogue moved out of its standalone shell (`apps/escalera`, now deleted)
and into the live Wings site as the first catalogue of **WGT/02 Interiores**.
It ships on the existing `wings-global-trade` Vercel project — the project that
serves `wingsglobaltrade.com` — so the root directory could not be repointed and
mounting inside `apps/site` was the only route that did not risk production.

**Route.** `/interiores/azulejos` (+ `/lista`, `/muestrario`, `/mesa`). Stated
once in `lib/routes.ts`; no component holds a route literal.

**Name.** Buyer-facing it is **Azulejos**. "El Pasillo" is the interaction and
stays in this spec, the code and this log. The density switch reads
`Recorrido / Lista`; the header counts `Serie NN / 10`.

**Isolation, since this now runs inside production.**
- Tokens `--pas-*`, all under `[data-app='pasillo']` (`pasillo.css`).
- Tailwind keys `pas-*`. The Tier-1 spacing scale diverges from Tailwind's
  default at 5 and above (24/32/48/64 vs 20/24/28/32), so every 5–8 spacing
  utility was renamed rather than overriding the site's scale — overriding it
  would have silently re-spaced ~70 existing routes.
- The three sub-14px density steps became declared Tier-2 tokens
  (`--pas-type-label/micro/dense`) instead of literals, satisfying the token
  lint without pretending a comparison table can live on the 14px floor.

**Chrome.** `components/features/shared/SiteFrame.tsx` gates SiteNav, Footer,
CompareBar, MultiInquiryPanel, the Mister launcher, Lenis smooth scroll and
PageTransition off this subtree only. A client gate rather than parallel root
layouts: the App Router way would mean relocating ~70 routes to suppress a
header on four, and the repo has made this call before (DECISIONS.md, "Legacy
chrome gated, not removed").

**One real defect found by driving the browser:** the lane layout carried
`pt-16` for the fixed site header. The aisle is `h-dvh`, so a header-sized pad
pushed it a full header below the fold and dropped the muestrario tab on top of
the collect button. The pad moved to the lane *page*; the lane *layout* now sets
`data-lane` and nothing else. A layout that assumes every child is a scrolling
page breaks the one child that is a viewport.

**Shared-organ fix (§QA-6).** `FillMeter` hardcoded `--color-gold` on every
fill, so a lane could not theme it and would have had to fork it — exactly what
root §1.1 forbids. It now reads `var(--cargo, var(--color-gold))`. Existing
pages define no `--cargo` and render byte-identically (verified: still
`rgb(196,147,63)` on `/marcas/aladin/contenedor`).

**QA gates, measured not asserted.**

| Gate | Result |
|------|--------|
| 1 · Tension per view | the swipe verdict wash and the 3×3 repeat on the aisle; the payload table on the lane page |
| 2 · Token lint | zero raw hex, zero raw px in lane code — the sub-14px steps are declared tokens |
| 3 · Wholesale lint | no retail vocabulary, no currency literal; every "precio" either requests a quote or states its absence |
| 4 · Performance | LCP on emulated 4G: lane page 1444 ms · aisle 1024 ms · lista 456 ms (all < 2 s) |
| 5 · Reduced motion + keyboard | full parity — `→` collects, `←` passes, `↑↓` scrub; reduced-motion run raised zero errors |
| 6 · Swap test | lane page rendered under the house navy/gold livery: structural fingerprint **identical** (h1 box, section count, row count, document height, no overflow) |

`pnpm test` — 41 passing, including the float trap (`Math.ceil(47.52/0.99)`
returns 49 where the answer is 48, on a real carton from this catalogue).

**Still open, unchanged by the mount:** §4.7's SELECCIONADOS float section, bulk
bar and note UI; drag-reorder untested; position preservation across
Lane ↔ Lista; `SkuTile` unwired (Mosaico is P2); §9.3–9.8 workbook, validating
importer, Postgres and soft-delete; waste percentage; the §7 on-device checks
(colour fidelity OLED vs LCD, achromatic mark on white/navy/pink, tap accuracy,
3×3 render cost).
