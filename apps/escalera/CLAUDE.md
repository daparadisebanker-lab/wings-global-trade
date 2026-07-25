# apps/escalera — La Escalera (tiles & floor planning)

The tile catalog as a **deck of cards**, not a PDF. Extends the root `CLAUDE.md`
(ecosystem law); this file is the app-specific law and never restates it.

Source spec: `LA ESCALERA — Tiles & Floor Planning Catalog`, a five-rung ladder.
The doctrine, verbatim: **"Everything El Pasillo describes is levels 4 and 5.
Everything that makes money is 2 and 3."**

## 0 · Which rungs exist (read before adding anything)

| Rung | What it is | Status |
|---|---|---|
| **1 · The Deck** | one card full bleed · swipe right = add · swipe left = next · counter · tap to flip · 4s undo · deck end → WhatsApp | **BUILT** |
| **2 · The Muestrario** | the pile becomes a record: rows, notes, drag-reorder, checkbox section, local-first IndexedDB, seen memory | **BUILT** |
| **3 · The Arithmetic** | m² + waste per line → cartons (ceil) · kg · pallets · container fill bar · PDF + WhatsApp export with the math | **BUILT** |
| **4 · The Aisle** | booth numbers, edge scrubber, filters that dim instead of reshuffling, persisted position | **NOT BUILT — gated** |
| **5 · The Pasillo** | 3D receding aisle, Trade Desk, the Lay-Up Board | **NOT BUILT — gated** |

**The gates are law, not preference.** A rung is not built until the one below it
has real usage:

- **→ Rung 4** requires: quotes sent weekly at a number the supplier feels, **and
  the supplier confirms quotes are priceable without follow-up questions.** That
  second half is the only gate that matters.
- **→ Rung 5** requires: return visits that *use* the scrubber to go back.

Rungs 1–3 contain zero WebGL and 100% of the revenue. **Stopping here is a
success state, not an unfinished one.** Do not add booth numbers, a scrubber, a
lane, a 3D view, or a Lay-Up Board to this app without the gate above being met
and said out loud.

## 1 · The One Thing

It lives at Rung 2: **the buyer leaves with a record.** Every feature at every
rung is judged by whether it feeds that record or distracts from it. Anything
that pulls attention from the record is cut, whatever it demos like.

## 2 · The money math (`src/lib/packing.ts`)

One wrong carton count in front of a buyer ends the tool's credibility, so:

- **All arithmetic runs through `decimal.js`.** `number` appears only at the
  boundary. A naive `Math.ceil(47.52 / 0.99)` returns **49** cartons where the
  answer is **48** — that exact case is a unit test.
- **Cartons always round UP.** You cannot buy 11.4 cartons.
- **Pallets are summed per line, not recomputed on total cartons** — in the tile
  trade a pallet carries one SKU.
- **The container meter measures WEIGHT, not volume.** Tiles fill a container by
  weight before volume; that note prints beside every fill bar and in every
  export. Payloads come from `@wings/trade-ui` `CONTAINER_KINDS` — this app never
  keeps its own copy.
- `PACKING_CONSTANTS_VERSION` is stamped on every export. Bump it when any
  constant or rule changes.
- `pnpm test` must stay green. It is the only thing standing between a buyer and
  a wrong number.

## 3 · Provenance is a feature

Every packing constant carries a `provenance`:

- `catalog` — printed on the supplier's own series banner (pcs/carton, kg/carton)
- `derived` — computed exactly from catalog values (m²/carton = format area × pcs)
- `assumed` — **not published by the supplier** (cartons/pallet, built to a
  1 200 kg pallet)

Assumed values are surfaced on the card, in the totals, in the PDF and in the
WhatsApp message. **Never silently promote an assumption to a fact.** Collecting
the real per-SKU packing data is Rung 3 work the spec deliberately forces — when
it arrives, set the provenance to `catalog` and the markers disappear on their own.

Fields the catalogs do not state (material, PEI, slip rating, water absorption,
shade variation) are `undefined` and render as "pendiente". Do not fill them in
from a photograph.

## 4 · Data

- `src/data/tiles.ts` is **generated** — never hand-edit.
- Rebuild: `python infrastructure/escalera/build_catalog.py --data-only` (regenerates
  the dataset from the checked-in transcription; no PDFs needed). Pass `--pdf-a`
  / `--pdf-b` to re-extract the swatch images too.
- Tile faces are cropped from the catalog sheets by a recursive XY-cut and served
  from `public/tiles/` (card) and `public/tiles/thumb/` (row).

## 5 · Stack & conventions

Next.js 15 App Router · TypeScript · Tailwind reading CSS custom properties ·
framer-motion (gesture springs) · `decimal.js` · `idb` · `@react-pdf/renderer`
(**dynamically imported** — it must never enter the deck's bundle) · `wa.me`
composer. **Zero WebGL, zero backend, no accounts.**

- Absolute imports via `@/` (resolves within `apps/escalera/src`).
- Tokens: Tier-1 `@wings/trade-ui` `tokens/skeleton.css` (frozen) + this app's
  Tier-2 layer in `globals.css`. Palette tokens are sRGB channel triplets so
  Tailwind's `<alpha-value>` works — components never write a raw `rgba()`.
- Copy is **Spanish**, technical and direct, no exclamation marks.
- **Wholesale only**: this tool quotes *quantities* so the supplier can quote the
  price. There is no price, no cart, no checkout anywhere in it — and there must
  never be. The primary action is always "send the request".
