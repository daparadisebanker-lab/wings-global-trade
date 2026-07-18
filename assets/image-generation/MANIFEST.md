# Generated-asset manifest (append-only)

Every accepted asset gets a row before it ships. Custom V3 style ids are
registered in the second table. Never edit or delete rows — supersede with a
new row and mark the old destination `RETIRED`.

## Assets

| File (library/…) | Class | Lane | Model | Seed | Prompt (verbatim) | style_id | Date | Destination |
|---|---|---|---|---|---|---|---|---|

## Custom styles (V3 `create_style`)

| style_id | Class | Lane | Source assets | Date |
|---|---|---|---|---|
| `7573af00-c9df-4309-81ff-5701dd00332d` | Esquema poster register (flat editorial poster; supersedes Drawn Register for esquema visuals per Muaaz 2026-07-09) | house (all lanes) | Muaaz-supplied reference screenshots: `~/Pictures/Screenshots/Screenshot 2026-07-08 143736.png` + `…143724.png` (farm-poster set: yellow/cobalt/black/white/pink + blue/teal/red) · base `digital_illustration` | 2026-07-09 |

## Registered mark derivations (Mister) — appended 2026-07-08

Not generated assets: cut/rendered from the registered masters per
`spec/MISTER_LOGO_APPLICATION_STANDARD.md` ("any new render gets a MANIFEST
row"). Geometry verbatim in all cuts; unit **b = 271.389** master units
(satellite method — see `packages/liveries/mister/logo/geometry.json`).

| File (packages/liveries/mister/…) | Derivation | Method | Date |
|---|---|---|---|
| `logo/mister-mark-solid.svg` | Cut from `mister-lockup-solid.svg`: deleted wordmark (polygon + 5 glyphs) + `fil2` rect; M path + 12 satellites verbatim; fill `#1D83F2` | viewBox = mark_bbox + 1b = `1518.57 2783.08 2729.05 2707.18` (satellite extents analytic) | 2026-07-08 |
| `logo/mister-m-solid.svg` | Cut from master: metaball-M path only, verbatim; fill `#1D83F2` | viewBox = m_bbox + 1b = `2142.55 3479.44 1480.81 1275.54` (alpha-bbox @resvg 9000px) | 2026-07-08 |
| `logo/mister-wordmark-solid.svg` | Cut from master: wordmark polygon + 5 glyph paths verbatim; fill `#1D83F2` | viewBox = wordmark_bbox + 1b = `4240.77 3216.99 5934.51 1860.18` (alpha-bbox) | 2026-07-08 |
| `logo/geometry.json` | Programmatic derivation record: unit b + element bboxes | b: M-bbox/3 = 312.68 vs largest-satellite Ø = 271.39, 13.2% disagreement → satellite method per standard | 2026-07-08 |
| `review/variant-contact-sheet.png` | Verification render: 3 variants × 16/32/64/128/512 px | @resvg true-px renders, labeled composite | 2026-07-08 |
| `review/GATE-m-{16,32}{,-x20,-1bit50}.png` + `favicon-gate.md` | Favicon legibility gate evidence | Verdict PASS — m-solid ships for favicon use; no 4th variant (see `spec/DEFERRED.md` D-4) | 2026-07-08 |
| `review/ramp-calibration-sheet.png` | Founder calibration render: shipped OKLCH ramp vs OKLab comparison vs scarcity/failure/gold context | culori + @resvg from `ramp.ts` stops; supports `spec/DEFERRED.md` D-1/D-2 | 2026-07-08 |
| `review/ramp-calibration-sheet.png` (v2, supersedes 2026-07-08 v1) | Re-render after D-1/D-2 ratification: shipped OKLab ramp (v1.1, hot frozen `#B93400`) + semantic-reds row presenting the D-3 `--error` proposal with AA/ΔE annotations | culori + @resvg from `ramp.ts` v1.1 stops | 2026-07-08 |
| `review/variant-contact-sheet.png` (v2, supersedes 2026-07-08 v1) | Re-render for shipped-state parity (geometry unchanged); true-px crisp renders instead of upscaled cells | @resvg true-px, dynamic layout | 2026-07-08 |
| `review/ramp-calibration-sheet.png` (v3, supersedes v2) | Re-render after D-3 ratification: `--error #A61B3A` now law; all row-2 reds are shipped values | culori + @resvg | 2026-07-08 |

## INGESTA Case 001 — ficha técnica visuals (appended 2026-07-08)

Palette-enforcement note (thesis compatibility clause): the `recraft` MCP
exposes `recraftv3`/`recraftv2` only — no `controls.colors`, no seed. Palette
was enforced prompt-side + post-generation gate checks; seeds unavailable.

| File | Class | Register | Lane | Model | Seed | Prompt/ops | style_id | Date | Destination |
|---|---|---|---|---|---|---|---|---|---|
| `data/products/WGT01-ISUZU-CHASIS-4HK1/images/generated/gen-01-chasis-cutout-registroB-r1.png` | B4 studio cutout | B | WGT/01 | recraftv3 realistic_image | n/a (MCP exposes none) | B4 cutout house architecture (base+grade blocks, no branding) → `remove_background` → PIL composite on `#F8F6F0` 3072×1000 (raw source: `raw/099…`→cutout `raw/b6e57819`) | — | 2026-07-08 | Ficha técnica r1 `img:producto` (Figma `hmIA7gzNQbNZ677kVo2p6x` node `4:2`) — **CONDICIONAL: J4 defect (rueda trasera asimétrica: dual lado lejano, simple lado cercano); M1 luma 0.84 (cutout case, umbral no calibrado); captioned "representación ilustrativa, no evidencia" (J2). Fallo del fundador pendiente — NO entra a library/ hasta pasar gates.** |
| Figma-native vectors, node `8:2` ("esquema-Q-DIM-canvas") | Q-DIM esquema | A (Drawn Register / ESQUEMA) | WGT/01 | none — constructed from Figma primitives after 3 failed vector batches | n/a | Ghost/ink/gold tiers per ESQUEMA v1.0; values from spec.es.json only (WB 4 175/4 475/5 200 mm); DM Mono labels set in file; "Esquema ilustrativo" disclaimer per law 6 | — | 2026-07-08 | Ficha técnica r1 `img:esquema:dim` (node `6:68`). Ficha: PREGUNTA "¿Qué distancia entre ejes tiene cada variante?" · RESPUESTA "Tres: 4 175, 4 475 y 5 200 mm, cada una sin cabina o con semicabina" · ORO la cota WB con sus tres valores · TINTA perfil del chasis rodante · FANTASMA semicabina + volumen de carrocería posible |

## C-HERO catalog heroes (Register C — supplier restoration) — appended 2026-07-08

KAMA intake wave 1 (fetch-and-stage pipeline). Full operation logs with values
live in `outputs/<sku>/manifest-row.md`; this table is the shipping record.
Rights registry: `packages/catalog/manufacturer-domains.json` v2 (ratified
2026-07-08). Staging: `scripts/stage-hero.ts` Route 1, all G1–G7 gates passed.

| File (outputs/…) | SKU | Register | Source (domain · rights) | Ops summary | Date | Destination |
|---|---|---|---|---|---|---|
| kama-serie-m6/kama-serie-m6_hero_{master.png,4x3.webp,1x1.webp,16x9.webp} | kama-serie-m6 | C | kamaqc.en.made-in-china.com "M67" listing · supplier_provided | crisp_upscale 2524×1734→4096×2814 · remove_background · alpha trim · no corrections · Route 1 facing left, ground 84.01% | 2026-07-08 | apps/site catalog hero (serving copy = downstream step) |
| kama-serie-s/kama-serie-s_hero_{master.png,4x3.webp,1x1.webp,16x9.webp} | kama-serie-s | C | kamaauto.cn S6 product page · manufacturer_kit | crop from marketing poster (vehicle only) · crisp_upscale 790×545→3160×2180 · remove_background · no corrections · Route 1 facing left, ground 84.00% | 2026-07-08 | apps/site catalog hero |
| kama-serie-es-esp/kama-serie-es-esp_hero_{master.png,4x3.webp,1x1.webp,16x9.webp} | kama-serie-es-esp | C | cnkama.en.made-in-china.com ES6 listing · supplier_provided — **PROVISIONAL: Autohome-origin watermark in source background; founder rights call pending** | crop (excl. watermark) · crisp_upscale 1185×800→4096×2765 · remove_background (re-extraction, native mask) · keep-largest · no corrections · Route 1 facing left, ground 83.97% | 2026-07-08 | apps/site catalog hero — HELD pending founder call |
| kama-serie-ew-ev/kama-serie-ew-ev_hero_{master.png,4x3.webp,1x1.webp,16x9.webp} | kama-serie-ew-ev | C | kamaauto.cn EV-mini-truck page · manufacturer_kit | crop · no upscale (native 2500px) · remove_background · keep-largest · no corrections · Route 1 facing left (side profile, permitted secondary), ground 83.98% | 2026-07-08 | apps/site catalog hero |
