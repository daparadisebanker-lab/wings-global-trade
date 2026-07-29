# src/pasillo — Azulejos (the tile catalogue, as an aisle)

The supplier's tile catalogue as an **aisle you walk**, not a PDF you pinch.
Mounted inside the live site as the first catalogue of **WGT/02 Interiores**,
at `/interiores/azulejos`. Extends the root `CLAUDE.md` (ecosystem law) and
`apps/site/CLAUDE.md` (site law); this file is the catalogue-specific law and
never restates either.

**Governing spec: `EL-PASILLO-UI.md`, in this directory.** It is the source of
truth, it carries the resolved decision log (§10), and a decision made and not
written back into it is a decision that will be re-litigated.

## The name, and it matters
**"Azulejos" is the product and the only name in navigation.** "El Pasillo" is
the *interaction* — the aisle you walk — and it lives in this spec, in the code
and in the build log. A buyer looking for tiles does not scan a menu for a
corridor. The two view labels are `Recorrido` and `Lista`; the header counts
`Serie 01 / 10`.

## Where it sits in the site
- Routes come from `lib/routes.ts` — `PASILLO_BASE` is stated once and every
  link derives. **No component may write a route literal.**
- The layout at `app/(lanes)/interiores/azulejos/layout.tsx` stamps
  `data-app="pasillo"`, which is the single hook every token here hangs off, and
  it suppresses its own lane's oxblood accent (see §1).
- It is the only subtree on the site that drops site chrome. The gate reads
  `isAislePath()` from `lib/routes.ts` — never re-derive that predicate.
- Tailwind keys are namespaced `pas-*` and the CSS tokens `--pas-*`, because this
  runs inside a production site whose own tokens must not shift by one pixel.
  The Tier-1 spacing scale diverges from Tailwind's default at 5 and above
  (24/32/48/64 vs 20/24/28/32), so `p-pas-5` is not `p-5` and the distinction is
  load-bearing.

## 0 · What exists

| | Built | Notes |
|---|---|---|
| **Lane** (§4.6, §4.9, §4.10) | ✅ | one series per screen, swipe grammar, edge scrubber |
| **Booth header** (§4.2) | ✅ | the inverted spec bar |
| **Sheet-dock** (§4.5) | ✅ | `vaul`, ruled table, sibling strip |
| **3×3 repeat** (§4.4) | ✅ | **default state**, not 1× |
| **Muestrario** (§4.7) | ✅ | series + SKU rows, tri-state |
| **Volume footer** (§4.8) | ✅ | m² · cajas · piezas · FCL |
| **Trade Desk** (§4.12) | ✅ | WhatsApp + email at equal weight |
| **Lista** (§2) | ✅ | comparison density, accessibility floor |
| **Mosaico + facet rail** (§4.1) | ❌ **P2** | blocked on D-02 pattern-family tagging |
| **AMBIENTE renders** (§4.4) | ❌ P2 | no supplier room renders bound to series yet |
| P3 (multi-lane, what's-new lighting) | ❌ | not now |

**Mosaico is absent, not half-built.** Its facet rail needs `pattern_family`,
which colour clustering provably cannot produce (§9.5). A rail that mislabels a
tile is worse than one that omits the axis. Do not ship a guessed pattern family.

## 1 · The doctrine that governs every visual choice

**When the product is colour, the interface is achromatic.** Every accent hue
available already exists in this catalogue — Massed Glaze is overwhelmingly
cobalt, Flower Sea carries hot pink, sage and terracotta. A coloured "collected"
mark would vanish on some tiles and clash with others.

- Collected state is **form and value, never hue**: a 2px inset double-stroke,
  paper then ink, plus a filled ink corner triangle with a paper check.
- The record ground is **colour-neutral (#F0EFEE)**, and this is a measurement
  decision, not a mood — a warm ground shifts perceived hue and buyers reject
  shipments over colour variance. The ecosystem already carries this precedent:
  the `(brands)` route group takes a neutral ground so partner palettes are not
  tinted (root `CLAUDE.md` §5-bis).
- Status lamps live **only on the record ground and the series header** — never
  on a tile face, and the label always accompanies the dot.
- **Hard record, soft chrome.** `--radius-record: 0`, `--radius-chrome: 20px`.
- Every SKU code is **mono**. It is the string a buyer pastes into WhatsApp at
  11pm; it should look like the part number it is.

## 2 · The rules that are not preferences

- **The Lane lights; the Mosaico and Lista sort.** A filter in the Lane dims
  non-matches *in place* — nothing moves, reorders or unmounts, because the
  buyer is using the aisle's positions as memory. In the dense views the same
  filter removes non-matches; there is no spatial memory there to protect.
- **Pass is not reject.** A passed series dims, stays in position, stays on the
  scrubber and re-lights on return. **Nothing flies off a deck** — the lane is
  finite and revisiting is the core behaviour. Rotation on drag is capped at 4°:
  physical, not a dating app.
- **Passes expire with the session.** They live in React state and are never
  persisted, because stock changes and a remembered pass could permanently hide
  a supplier whose situation improved.
- **Two-speed collect** (D-04): a Lane swipe takes the whole series as a folder
  with SKUs pre-checked; the folder and the Lista refine down. A full-lane pass
  must never require per-SKU interaction.
- **No gamification.** No streaks, no scores, no rewards. This is procurement.
- **The 3×3 repeat is the default sheet preview.** A single face cannot express
  a field. It costs one CSS property and it is the difference between a
  catalogue and a sourcing tool.

## 3 · The money math (`src/lib/packing.ts`)

- **All arithmetic runs through `decimal.js`.** `Math.ceil(47.52 / 0.99)` returns
  **49** where the answer is **48** — on a real carton from this catalogue. That
  exact case is a unit test.
- **Cartons always round up**, and every basis (m² / cajas / piezas) resolves to
  whole cartons *first*; the other figures follow from that, never the reverse.
- **Series truth is never copied onto a SKU.** A SKU carrying its own coverage
  would eventually disagree with its series, and the disagreement reaches a buyer
  as a wrong carton count.
- **The container meter measures WEIGHT.** Tiles hit the payload limit long
  before the volume limit; a 40' box carries the same payload as a 20' in a
  longer room. Payloads come from `@wings/trade-ui/containers` — the subpath, not
  the barrel, which re-exports organs that drag in an animation library.
- `pnpm test` must stay green. It is the only thing between a buyer and a wrong
  number.

## 4 · Data

- `src/data/catalogue.ts` is **generated** — never hand-edit.
- Rebuild: `python infrastructure/escalera/build_catalog.py --data-only` (from the repo root; it emits into `data/catalogue.ts` here).
  Add `--pdf-a/--pdf-b` to re-extract faces from the source PDFs.
- `infrastructure/escalera/transcription.json` is the human gate (stage 4). Every
  other stage is automated, deterministic and re-runnable.
- **Nothing is invented.** PEI, slip rating, water absorption, application,
  rectified edge and every commercial term are absent from these catalogues, so
  they are `null` and the sheet renders them *pendiente*. A field with no printed
  source is not a field.
- `face_count` vs `pattern_count` is the highest-value validation and it resolves
  to one of four honest states: `single`, `multi` (repeat may randomise across
  real faces), `composite` (one printed photo already showing N variants — tile
  it, never fake a rotation), `review` (they disagree; the UI says so).
  One SKU is currently flagged: `PM3001`.

## 4-ter · Two languages, and which one goes where

The supplier prints everything in English — ten series names, six colour names,
every finish string. **The buyer reads Spanish; the factory reads its own
catalogue back.** Both are true at once, so both are carried.

- The Spanish vocabulary lives in `lib/catalogue.ts` (`SERIES_ES`, `COLOUR_ES`),
  **never in `data/catalogue.ts`** — that file is generated, and a name written
  into it is lost on the next pipeline run.
- `seriesName()` is what every buyer-facing surface renders. `seriesNameRaw()`
  is the printed name, shown beside it wherever a buyer might quote the series
  back to us, and carried into the RFQ so ops can order without translating
  under time pressure.
- The Lista searches **both** names. A buyer with the supplier's PDF open types
  "Flower Sea" and must not come up empty.
- `finish_raw` stays English everywhere it reaches a supplier: it is the
  evidence when a spec is disputed, and a translated finish would have to be
  translated back.
- Two series are both "Esmalte Macizo" (150 and 300). That is deliberate — every
  surface showing a name also shows the format, except the Lista's series
  filter, which is exactly why `seriesOption()` exists. `catalogue.test.ts`
  holds this, including the rule that every series is renamed at all: a uid the
  pipeline adds and nobody translates falls back to English **silently**, and
  that test is what catches it.

## 4-bis · The token lint, and what legitimately fails it

Zero raw values means zero LAYOUT values. **Everything below is the complete
allowlist** — if the lint flags something not on this list, it is a bug, and if
you add a value here you owe it the same one-line argument the others carry.
"It looked right" is not one.

**44px — the accessibility constant**, and everything measured against it. Not a
spacing step: rounding it up to 48 to please a lint is the wrong direction and
rounding it down to 32 is a regression.

- `w-11` — the scrubber's invisible grab band (the rail it wraps is 3px).
- `h-11` — the qty inputs in the Trade Desk and the muestrario. They were 30px.
- `pl-11` — the indent that hangs a SKU's detail under its own checkbox.
- `right-11` — the scrubber label, cleared past the grab band.
- `h-11 w-11` — the series-cover thumbnails, sized to the row's touch rhythm so
  the image and the target it sits in are one rectangle.

**Component-intrinsic dimensions** — sized to the thing they are inside, not to
the page grid, so the grid has no opinion about them:

- `w-3.5 h-3.5` (14px) — the checkmark glyph, sized to its 32px (`pas-6`) box.
- `-inset-1.5` (6px) — the invisible expansion that buys that 32px checkbox its
  44px target without costing the Lista its density.
- `h-1.5` (6px) — the fill bar's stroke weight.
- `w-10 h-10` (40px) — the SKU-row thumbnail, deliberately under the 44px series
  cover above it (leaf vs folder), and the sheet-dock drag handle.
- `w-[11px] h-[11px]` + `bottom-[3px] left-[3px]` — the collected corner's check,
  positioned inside a triangle drawn in CSS. It is bound to that triangle's
  geometry; changing it to a scale step puts the check outside the mark.
- `h-[3px]` / `w-[3px]` — the partial-state bar and the scrubber rail. A hairline
  reads as a border and 4px reads as a block; 3px is the only width that reads as
  a rail. The rail's HIT area is `w-11` above, which is the part that matters.

**Reserved space** — a measured minimum that stops a specific collapse, each one
the fix for a bug that shipped:

- `min-h-[1.25rem]` — the Lane's control row, which is empty at the first booth.
  Without it the header jumps 20px on the first swipe.
- `pr-[11.5rem]` — the Lista header's reserve for the fixed density switch. The
  availability note used to truncate mid-word beneath it.
- `min-w-[640px]` — the Trade Desk table's floor before it scrolls horizontally.
  Eight columns of figures below this stop being comparable.
- `h-[92dvh]` — the sheet-dock's height, leaving the 8% that tells a buyer there
  is a page behind it.

Everything else in this directory is on the frozen scale or is a declared
`--pas-*` token.

## 5 · Stack

Next.js 15 App Router · TypeScript · Tailwind over CSS custom properties ·
`@use-gesture/react` + this app's own spring integrator (`lib/spring.ts`) ·
`vaul` sheets · `decimal.js` · `idb`. Self-hosted Archivo + Geist Mono, no CDN.
**Zero WebGL, zero backend, no accounts.**

Absent on purpose: any animation library on the Lane (the integrator is 120
lines and keeps React out of the drag loop), and any chromatic accent token.
