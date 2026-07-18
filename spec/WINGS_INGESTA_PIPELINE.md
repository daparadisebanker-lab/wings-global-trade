# Wings Global Trade — INGESTA: Supplier Document Intake Pipeline
**v1.0 · The workflow that converts incoming supplier PDFs (spec sheets,
catalogs, technical documents) into: structured Spanish spec records,
classified evidence imagery, and a Wings-branded ficha técnica PDF.
Governed by `WINGS_VISUAL_THESIS.md` v2.0, image thesis v2.1 Register C,
C-HERO, ESQUEMA (Q-DIM), Cotizador template law. Case 001 (ISUZU bus
chassis) is the founding run and the model for every sequence after.**

---

## THE LAW IN ONE LINE

> **The supplier's data is evidence: extracted verbatim, translated by
> glossary, stored with provenance — never paraphrased, never guessed.
> The supplier's design is discarded: Wings recomposes the content under
> its own law. Ambiguity is filed and asked, not resolved by invention.**

---

## PART I — THE PIPELINE

### Stage 0 — Intake & rights
File the original untouched at `data/products/<PRODUCT_ID>/source/`.
Record: supplier (name, contact, from the document itself), reception
date, catalog date/version if printed, and `rights: supplier_provided`
(a catalog sent by a supplier for representation is the standard case;
anything else routes through the fetch-and-stage rights gate). The
original is the audit anchor — every downstream value points back here.

### Stage 1 — Diagnose the PDF (the branch that decides everything)
`pdfinfo` + `pdffonts` + `pdfimages -list`:
- **Text layer present** → Branch T: `pdfplumber` for tables,
  `pdftotext -layout` for prose; rasterize only diagram pages.
- **Flattened/scanned** (no fonts; pages are full-page rasters — the
  common case for Chinese supplier catalogs) → Branch V: render every
  page at 300 DPI (`pdftoppm -r 300`) and extract by vision.
Record the branch in the manifest.

### Stage 2 — Data extraction (verbatim, source language)
Produce `spec.source.json` — every value exactly as printed, in the
source language, including the supplier's errors (they are part of the
evidence). Rules:
- **Variant logic first.** Identify the variant axes (wheelbase, cabin,
  capacity...) and model as parent product + `variantes[]`; shared
  values live at parent level, per-variant values in the variant.
- **Every number byte-faithful.** No unit conversion, no rounding, no
  "obviously meant." A value that cannot be read with certainty goes to
  AMBIGÜEDADES, not into the record.
- **Ambiguity protocol:** cells with multiple unassigned values (e.g.
  "4.1/5.375"), unlabeled ranges, or variant-unmapped rows are filed in
  `AMBIGUEDADES.md` as concrete supplier questions, addressed to the
  contact from Stage 0. The record marks those fields
  `"pendiente_proveedor"`. Wings sells certainty; a guessed axle ratio
  is a fabricated claim.

### Stage 3 — Translation (by glossary, not by vibe)
Produce `spec.es.json`: Spanish keys and values, technical register.
- **The glossary is law:** `data/GLOSARIO.md` maps every technical term
  once (EN→ES, with the frozen Wings term). New terms are *proposed* by
  the agent and *ratified* by the founder on first appearance; after
  ratification they are frozen — the same term never translates two
  ways across two fichas.
- **Supplier-English is corrected, not preserved,** in the ES record
  ("commom-rail" → riel común; "turb charging" → turboalimentado). The
  verbatim errors stay in `spec.source.json`; corrections are
  terminology only — values are never "corrected."
- Diacritics verified character-by-character. Units unchanged.

### Stage 4 — Storage
```
data/products/<PRODUCT_ID>/
  source/            ← original PDF, untouched
  spec.source.json   ← verbatim extraction
  spec.es.json       ← translated record (feeds Cotizador, catalog, esquemas)
  images/evidence/   ← usable product photography (Register C)
  images/reference/  ← marketing composites, diagrams (never republished)
  AMBIGUEDADES.md    ← open supplier questions
  MANIFEST.md rows   ← per asset + per record
```
`PRODUCT_ID` convention: `<LANE>-<MARCA>-<MODELO>` (variants as child
IDs). The `spec.es.json` is now the single source the Cotizador's
values-are-evidence law resolves against.

### Stage 5 — Image recovery & classification
- Branch T: `pdfimages -all` recovers embedded originals.
- Branch V: photos are **regions inside page rasters** — identify each
  region by vision, crop from the 300 DPI render, save individually.
Classify every recovered image:

| Class | Definition | Destination |
|---|---|---|
| **Evidence** | Clean photo of the product/components (product's own badges are fine) | `images/evidence/` → Register C pipeline; C-HERO staging when it becomes a catalog hero |
| **Reference** | Supplier marketing composites, layouts, promotional graphics | `images/reference/` — study only, never republished |
| **Diagram** | Dimension drawings, line art | `images/reference/` — raw material for Wings Q-DIM esquemas (redrawn under ESQUEMA law, values from the spec record) |

Each evidence crop is measured against the C-HERO pre-flight floor
(~1200 px long edge). Passes → available (with `crisp_upscale` in its
lane). **Fails → the request-originals list:** a supplier email draft
asking for the original photography, appended to AMBIGUEDADES.md.
Low-res crops are never upscale-tortured into the catalog.

### Stage 6 — Compose the Wings ficha técnica (Figma)
The `FICHA TÉCNICA — Master` template (sibling of the Cotizador master;
same session law: `/mcp` auth, one batched `use_figma` script). Named
slots: `t:producto` `t:marca` `t:origen`, the variant table (columns
cloned per variant, DM Mono values from `spec.es.json`), `img:producto`
(staged evidence), `img:esquema:dim` (the Wings-drawn Q-DIM esquema),
`mark:stamp` `t:fuente` ("Datos del fabricante · catálogo <fecha>" —
the provenance line printed on the document). Supplier branding does
not appear; the manufacturer's *name* does — Wings represents brands,
it does not impersonate documents. Export per Cotizador Stage 4
(pdf per page → merge → archive).

### Stage 7 — Gates
**Machine:** I1 every `spec.es.json` value traces to `spec.source.json`;
I2 no field both filled and `pendiente_proveedor`; I3 glossary
compliance (no unratified terms); I4 diacritics byte-compare; I5 every
image classified + manifest row. **Judged:** I6 extraction spot-audit
against the page renders (all numeric values, not a sample); I7 THE
TEST on the composed ficha; I8 ambiguities are questions, not guesses.

---

## PART II — CASE 001: ISUZU BUS CHASSIS (the founding run — paste-ready)

```
TASK: Run INGESTA on data/inbox/ISUZU_Bus_Chassis_Catalog.pdf per
spec/WINGS_INGESTA_PIPELINE.md. This is Case 001 — Branch V is already
diagnosed; the findings below are verified, build on them.

STAGE 0: PRODUCT_ID = WGT01-ISUZU-CHASIS-4HK1.
Supplier: GP Motors Technology (Chongqing) Co., Ltd — Rm. 27-04, YugaoZhibo
Center, No.68 Kecheng Road, Jiulongpo District, Chongqing; tel +86
13594129198; LuckyXia@gobestgroup.com; isuzukd.com. rights:
supplier_provided. Catalog PDF creation date 2025-04-29.

STAGE 1 (verified): flattened PDF — 2 pages, no text layer, each page
one 2480×3508 JPEG. Render both pages at 300 DPI and work by vision.

STAGE 2: extract the THREE TYPE CHASSIS SPECIFICATION as parent +
6 variants: wheelbases 4175 / 4475 / 5200 mm, each in No Cabin and Cut
Cabin. Known per-variant values: curb weight (2600/3005, 2795/3025,
2980/3445 kg). Known shared: 4x2; GVW 10500 kg; axle loads 3500/7050 kg;
engine 4HK1-TCG61 (4 cyl inline, common-rail diesel, turbo, intercooled,
Euro VI, 5.139 L, 139 kW @ 2600 rpm, 507 N·m @ 1600–2600 rpm);
transmission Manual MLD 6+1R, ratios 6.720/4.244/2.580/1.540/1.000/
0.763/R 6.823; drum brakes F+R, air brake, air cut parking valve; fuel
100 L carbon steel; angles 17/15 and 20/19; max 110 km/h; frame width
850 mm; tires 235/75R17.5. Extract everything verbatim into
spec.source.json — re-verify each value against the renders yourself.

FILE THESE AMBIGUITIES (pre-identified — supplier questions, do not
resolve): (a) "Reax Axle Ratio 4.1/5.375" — which ratio maps to which
variant, or is it an option? (b) "Suspension qty 8/10+6" — leaf
configuration per variant unmapped. (c) Approach/departure "17/15,
20/19" — which pair belongs to which wheelbase. (d) RHD/LHD availability
per variant not stated. (e) Cabin-status column alignment on the
5200 mm variant — confirm against render. Draft the supplier email in
AMBIGUEDADES.md addressed to the Stage 0 contact.

STAGE 3: translate to spec.es.json. Seed GLOSARIO.md with PROPOSED
terms for my ratification, including: Wheelbase→distancia entre ejes ·
GVW→peso bruto vehicular (PBV) · Curb Weight→peso en vacío · Cut
Cabin→semicabina · No Cabin→sin cabina · common rail→riel común ·
turbocharged/intercooled→turboalimentado con intercooler · drum
brake→freno de tambor · air brake→freno neumático · leaf
spring→ballesta · approach/departure angle→ángulo de ataque/salida ·
rear axle ratio→relación del eje trasero. Correct supplier-English in
ES only; keep source verbatim.

STAGE 5: from the 300 DPI renders, crop and classify: EVIDENCE — bare
chassis 3/4 (p1 center strip), engine+gearbox pair, suspension/anti-roll
detail, tire/axle detail, chassis side profile. REFERENCE — the
ghost-bus highway hero composite (supplier marketing; never republish)
and both page layouts. DIAGRAM — the three dimension line drawings
(FOH/WB/ROH/OAL/EH · AW · OW/OH/HH/CW/BW) — reference for the Wings
Q-DIM esquema "¿Entra este chasis en mi proyecto de carrocería?"
(ESQ-MAQ-005 pattern; draw under ESQUEMA law, values from spec.es.json,
dimension letters resolved or filed as ambiguity). Measure every
evidence crop against the 1200 px floor; failures go on the
request-originals list in the supplier email.

STAGE 6: if FICHA TÉCNICA — Master does not exist in Figma, STOP after
Stage 5, report complete, and list what the template needs (variant
table with 6 columns + parent rows; slots per the pipeline spec). Do
not improvise a layout — the template is a founder design task. If it
exists (key in spec/COTIZADOR.env), compose and export
WGT-FT-WGT01-ISUZU-CHASIS-4HK1-r1.pdf.

STAGE 7: run all gates; I6 means every number re-read from the render
and diffed against spec.source.json. Present: the spec records, the
image inventory with classifications and measurements, AMBIGUEDADES.md
with the draft supplier email, glossary proposals for ratification,
and (if Stage 6 ran) the ficha PDF + manifest rows.
```

---

## PART III — GOVERNANCE

Every future supplier PDF runs this pipeline by referencing this file:
`/ingesta <pdf> <lane>` → the agent reads this spec, diagnoses the
branch, and executes Stages 0–7, using Case 001 as the worked example
of depth expected. New document types (price lists, certificates,
manuals) extend this spec by amendment, not improvisation. Glossary
grows monotonically — ratified terms never re-translate. The INDEX of
ingested products lives at `data/products/INDEX.md`.

## CHANGELOG

| Date | Ver | Change |
|---|---|---|
| 2026-07-08 | 1.0 | Created from Case 001 (ISUZU 4HK1 bus chassis, GP Motors). Branch T/V diagnosis; verbatim + glossary translation law; ambiguity protocol; crop-and-classify recovery; request-originals rule; ficha composition contract. |

*Maintained in: `spec/WINGS_INGESTA_PIPELINE.md` · Data:
`data/products/` · Glossary: `data/GLOSARIO.md` · Siblings: Cotizador
(consumes spec.es.json) · C-HERO (stages evidence) · ESQUEMA (redraws
diagrams).*
