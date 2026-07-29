// WGT/02 Interiores — la escala, drawn and drafted.
//
// The same argument the container table makes, made visually: a tile is bought
// by the square metre, packed by the carton and shipped against a weight limit,
// and those three scales are three different numbers that a buyer has to hold
// at once. A table states them. This draws them, at true proportion, generated
// from the catalogue rather than illustrated.
//
// NOTHING HERE IS ART DIRECTION. Every dimension on screen is a ratio of a
// printed figure: the fields are laid at the real format, the pile is the real
// pieces-per-carton, and the carga field contains exactly as many marks as
// there are cartons before the payload limit. If the pipeline re-runs and a
// packing changes, the drawing changes with it. That is the only way a diagram
// on a spec page stays true six months after it is drawn.
//
// It is also why there is no carton-volume drawing here, which is the obvious
// next panel and the one that would have been a lie: the supplier prints piece
// counts, weights and coverage, and does NOT print carton dimensions. A "half
// full container" render would have been derived from a packaging guess. A
// field with no printed source is not a field (src/pasillo/CLAUDE.md §4).
//
// ── MOTION ─────────────────────────────────────────────────────────────────
// Wrapped in TechDraw, the same drafting harness as the Áladín packing and
// container diagrams, so the whole family moves in one language.
//
// Every animation here is the PHYSICAL ACT the panel describes, not a reveal:
//   the paño LAYS, tile by tile in reading order
//   the pila PACKS, slab by slab from the floor of the carton up
//   the carga LOADS, filling left to right against the weight limit
// Motion that names the verb costs nothing extra and teaches the diagram.
//
// Weight comes free from the data. Both paños share one drafting timeline, so
// the 150×150 field lays in a run of thirty-six and the 300×300 follows in nine
// — the fine format visibly takes four times as long to place, which is exactly
// what it costs on site. Nobody tuned that; it falls out of the piece count.
//
// The carga band is a WIPE, not a stagger. At 1 611 marks a per-element
// stagger is 1 611 tweens for a single gesture; one masking rect is one tween
// whose cost does not grow with the count. See data-td-wipe in TechDraw.

import { TechDraw } from '@wings/trade-ui'
import { fmtInt, fmtM2 } from '@/pasillo/lib/packing'

// ── Deterministic tonal variation ──────────────────────────────────────────
// A real laid floor is not one flat colour: glaze varies piece to piece across
// a kiln, which is the single thing this trade argues about most. So the field
// varies — but from the tile's INDEX, never from Math.random(), because a
// random value produced during SSR and re-rolled on hydration is a React
// hydration mismatch, and because a drawing that changes on reload is not a
// drawing of anything.
function tone(i: number, span: number, floor: number): number {
  const h = Math.sin(i * 12.9898) * 43758.5453
  return floor + (h - Math.floor(h)) * span
}

const dec = (n: number, d = 1) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d })

/** "0,0900" → "0,09"; "1,0000" → "1". The second case is why the comma is
 *  stripped too — the naive trailing-zero strip leaves a dangling separator,
 *  which no format in the catalogue reaches today and a 600 mm one would. */
const trimZeros = (v: string) => v.replace(/0+$/, '').replace(/,$/, '')

/**
 * A square of wall laid in one format. Both panels are drawn at the SAME
 * physical size, so the coarse field and the fine field are the same paño —
 * which is the whole point: the format does not change the area, it changes
 * the piece count, and the piece count is what changes the carton count.
 */
function Pano({
  side,
  tileMm,
  label,
}: {
  /** wall square, mm */
  side: number
  /** tile edge, mm */
  tileMm: number
  label: string
}) {
  const n = Math.round(side / tileMm)
  const S = 240 // px — both panos render at one size, at any format
  const t = S / n
  const PAD = 22 // room above and left for the dimension lines
  const pieces: React.ReactNode[] = []
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      pieces.push(
        <rect
          key={`${x}-${y}`}
          // Reading order, so the field lays the way a tiler lays it.
          data-td-pop
          x={(PAD + x * t).toFixed(2)}
          y={(PAD + y * t).toFixed(2)}
          width={(t - 1).toFixed(2)}
          height={(t - 1).toFixed(2)}
          fill="var(--accent)"
          // fill-opacity, NOT opacity: data-td-pop animates autoAlpha, which
          // writes `opacity` and would land every tile on 1 — flattening the
          // whole field to one oxblood the moment the animation finished.
          fillOpacity={tone(y * n + x, 0.18, 0.14).toFixed(3)}
        />,
      )
    }
  }

  const m2Piece = (tileMm / 1000) ** 2

  return (
    // Side by side at every width, including 390px: two squares of the same
    // paño only make their argument when the eye can hold both at once.
    // The cap grows at lg, where the two fields had been drawn at 260px inside a
    // 1280px section — a thumbnail of the comparison the section is built on,
    // with 700px of empty ground beside it.
    <figure className="min-w-0 flex-1 basis-[136px] sm:max-w-[260px] lg:max-w-[320px]">
      <svg
        viewBox={`0 0 ${S + PAD} ${S + PAD}`}
        className="w-full"
        role="img"
        aria-label={`Un paño de ${side / 1000} por ${side / 1000} metros en formato ${tileMm}×${tileMm}: ${n * n} piezas`}
      >
        <rect
          data-td-fade
          x={PAD}
          y={PAD}
          width={S}
          height={S}
          fill="var(--surface-1)"
        />
        {pieces}
        <rect
          data-td-late
          x={PAD}
          y={PAD}
          width={S}
          height={S}
          fill="none"
          stroke="var(--ink-primary)"
          strokeWidth="1"
        />

        {/* DIMENSIONS. The panel used to be a swatch with a caption; a buyer
            could see that one grid was finer than the other and had no way to
            read what either measured. Top: the paño. Left: one piece. */}
        <g
          data-td-late
          stroke="var(--ink-decoration)"
          strokeWidth="0.75"
          fill="var(--ink-secondary)"
          fontFamily="var(--font-mono), monospace"
          fontSize="11"
        >
          <path d={`M${PAD} ${PAD - 8} H${PAD + S}`} />
          <path d={`M${PAD} ${PAD - 11} v6 M${PAD + S} ${PAD - 11} v6`} />
          <text x={PAD + S / 2} y={PAD - 12} textAnchor="middle">
            {fmtInt(side)} mm
          </text>

          <path d={`M${PAD - 8} ${PAD} V${PAD + t}`} />
          <path d={`M${PAD - 11} ${PAD} h6 M${PAD - 11} ${PAD + t} h6`} />
          <text
            x={PAD - 12}
            y={PAD + t / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${PAD - 12} ${PAD + t / 2})`}
          >
            {tileMm}
          </text>
        </g>
      </svg>

      <figcaption className="mt-3">
        <span className="block font-mono text-mono-sm [font-variant-numeric:var(--numeric-variant)]">
          {label}
        </span>
        <span className="mt-1 block text-[length:var(--lane-type-stamp)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)]">
          {fmtInt(n * n)} piezas · {trimZeros(dec(m2Piece, 4))} m² c/u
        </span>
      </figcaption>
    </figure>
  )
}

/**
 * The carton, seen edge-on: tiles ship stacked face to face, so a carton is a
 * pile of exactly `pcs` slabs and its height is a real consequence of the piece
 * count and the thickness.
 *
 * EVERY PILE ON THE PAGE IS DRAWN AT ONE SCALE — mm to px, fixed — and every
 * frame is the same box, bottom-aligned. That is the entire value of the
 * drawing: a 300×300 pile is genuinely twice as wide and visibly shorter than
 * a 150×150 pile of three times the piece count, and the eye can compare them
 * without reading a number. Scaling each pile to fit its own frame, which is
 * what a naive fit does, would have drawn the 300 carton five times wider than
 * the 150 — a false claim about a physical object, produced by a layout
 * convenience.
 */
const MM_PX = 0.42 // one scale for every pile on the page
const PILE_GAP = 0.5
const PILE_PAD = 26 // room at the right for the height dimension

const pileHeight = (pcs: number, thickMm: number) => pcs * (thickMm * MM_PX + PILE_GAP)

function Pila({
  pcs,
  tileMm,
  thickMm,
  frame,
}: {
  pcs: number
  tileMm: number
  thickMm: number
  /** shared drawing box, px — the widest tile and the tallest pile on the page */
  frame: { w: number; h: number }
}) {
  const w = tileMm * MM_PX
  const h = thickMm * MM_PX
  const x = (frame.w - w) / 2
  const top = frame.h - pileHeight(pcs, thickMm)
  // Arithmetic on two printed figures, so it is a real number and not a guess.
  // "Pila", never "caja": the carton is taller than the tiles inside it and the
  // supplier does not print by how much.
  const stackMm = pcs * thickMm

  return (
    <svg
      viewBox={`0 0 ${(frame.w + PILE_PAD).toFixed(1)} ${frame.h.toFixed(1)}`}
      width={(frame.w + PILE_PAD).toFixed(1)}
      height={frame.h.toFixed(1)}
      className="shrink-0"
      role="img"
      aria-label={`Una caja de ${tileMm}×${tileMm}: ${pcs} piezas apiladas, ${stackMm} mm de pila`}
    >
      {/* Rendered bottom slab first, so the stagger packs the carton from its
          floor upward. Position is absolute either way — only the order of
          arrival changes, and the order is the point. */}
      {Array.from({ length: pcs }, (_, i) => {
        const fromBottom = pcs - 1 - i
        return (
          <rect
            key={fromBottom}
            data-td-pop
            x={x.toFixed(2)}
            y={(top + fromBottom * (h + PILE_GAP)).toFixed(2)}
            width={w.toFixed(2)}
            height={Math.max(h, 0.8).toFixed(2)}
            fill="var(--accent)"
            fillOpacity={tone(fromBottom, 0.22, 0.28).toFixed(3)}
          />
        )
      })}

      {/* Stack height — the figure that explains why the heavier carton is the
          shorter one, and the only reason the two piles read as comparable
          objects rather than two bar charts. */}
      <g
        data-td-late
        stroke="var(--ink-decoration)"
        strokeWidth="0.75"
        fill="var(--ink-secondary)"
        fontFamily="var(--font-mono), monospace"
        fontSize="11"
      >
        <path d={`M${(x + w + 8).toFixed(1)} ${top.toFixed(1)} V${frame.h.toFixed(1)}`} />
        <path
          d={`M${(x + w + 5).toFixed(1)} ${top.toFixed(1)} h6 M${(x + w + 5).toFixed(1)} ${frame.h.toFixed(1)} h6`}
        />
        <text
          x={(x + w + 12).toFixed(1)}
          y={(top + (frame.h - top) / 2).toFixed(1)}
          textAnchor="middle"
          transform={`rotate(-90 ${(x + w + 12).toFixed(1)} ${(top + (frame.h - top) / 2).toFixed(1)})`}
        >
          {fmtInt(stackMm)} mm
        </text>
      </g>
    </svg>
  )
}

/**
 * The carga field: one mark per carton, and there are exactly as many marks as
 * there are cartons before {payload} kg. It is a count you can look at rather
 * than read — 1 611 small cartons and 1 128 large ones are the same tonnage and
 * visibly not the same quantity to handle.
 */
function Carga({ cartons, payloadKg, id }: { cartons: number; payloadKg: number; id: string }) {
  // Columns are derived from the count, not fixed, so every field lands at
  // roughly 8:1 whatever the packing. Fixed at 64 the 1 611-carton field drew
  // 26 rows — a 400px slab that took the row over and made four packings
  // impossible to compare at a glance. The band is the unit of comparison
  // here; it has to stay a band.
  const COLS = Math.ceil(Math.sqrt(cartons * 8))
  const rows = Math.ceil(cartons / COLS)
  const p = 4 // pitch
  const W = COLS * p
  const H = rows * p
  const marks: React.ReactNode[] = []
  for (let i = 0; i < cartons; i++) {
    marks.push(
      <rect
        key={i}
        x={((i % COLS) * p).toFixed(1)}
        y={(Math.floor(i / COLS) * p).toFixed(1)}
        width="2.6"
        height="2.6"
        fill="var(--accent)"
        fillOpacity={tone(i, 0.34, 0.34).toFixed(3)}
      />,
    )
  }

  const clip = `carga-${id}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 16}`}
      // The cap is what stops the band spanning a whole desktop while it is the
      // second of two stacked cells. Once it is a column of its own at lg the
      // column governs the width, and the marks get to be big enough to count.
      className="w-full max-w-[34rem] lg:max-w-none"
      role="img"
      aria-label={`${cartons} cajas hasta ${payloadKg} kilos`}
    >
      <defs>
        {/* The wipe is a CLIP, not an opacity fade: cartons are either loaded
            or they are not, and a field that fades in says the whole load
            arrived at once. */}
        <clipPath id={clip}>
          <rect data-td-wipe x="0" y="0" width={W} height={H} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>{marks}</g>

      {/* The weight rule. Without it the band is a texture; with it the band is
          a load, and the buyer can see that the limit is what stopped it. */}
      <g
        data-td-late
        stroke="var(--ink-decoration)"
        strokeWidth="0.75"
        fill="var(--ink-secondary)"
        fontFamily="var(--font-mono), monospace"
        fontSize="9"
      >
        <path d={`M0 ${H + 5} H${W}`} />
        <path d={`M0 ${H + 3} v4 M${W} ${H + 3} v4`} />
        <text x="0" y={H + 15}>
          0 kg
        </text>
        <text x={W} y={H + 15} textAnchor="end">
          {fmtInt(payloadKg)} kg
        </text>
      </g>
    </svg>
  )
}

export interface EscalaRow {
  format: string
  tileMm: number
  thickMm: number
  pcs: number
  m2PerCtn: number
  kgPerCtn: number
  cartons: number
  m2: number
}

export function Escala({ rows, payloadKg }: { rows: EscalaRow[]; payloadKg: number }) {
  // One box for every pile, sized to the widest tile and the tallest stack in
  // the catalogue. Computed, so a new packing resizes the frame rather than
  // overflowing it.
  const frame = {
    w: Math.max(...rows.map((r) => r.tileMm)) * MM_PX,
    h: Math.max(...rows.map((r) => pileHeight(r.pcs, r.thickMm))),
  }

  // The two formats, drawn on the same square of wall. 900 mm divides evenly by
  // both, so neither field is cut off mid-piece — a partial tile at the edge
  // would be a drawing artefact reading as a cutting instruction.
  const PANO_MM = 900

  return (
    <div className="mt-12">
      {/* ── One paño, two formats ─────────────────────────────────────────
          THE CAPTION SITS BESIDE THE DRAWING, NOT UNDER IT.
          Stacked, this block spent a desktop's whole width on two 260px squares
          and then a paragraph starting back at the left margin 400px lower —
          the reader had to leave the diagram to be told what it showed. At lg
          the prose becomes what it is: the legend, at the drawing's own height,
          in the ground the drawing was not using. */}
      <div className="lg:grid lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
        <TechDraw>
          <div className="flex flex-wrap gap-8 sm:gap-12">
            <Pano side={PANO_MM} tileMm={150} label="150×150 mm" />
            <Pano side={PANO_MM} tileMm={300} label="300×300 mm" />
          </div>
        </TechDraw>
        <p className="mt-6 max-w-[58ch] text-[length:var(--type-0)] leading-[1.5] text-[color:var(--ink-secondary)] lg:mt-0 lg:max-w-[46ch]">
          El mismo paño de {dec(PANO_MM / 1000)} × {dec(PANO_MM / 1000)} m —{' '}
          {fmtM2((PANO_MM / 1000) ** 2)} m² — en los dos formatos del catálogo. El formato no
          cambia el área: cambia cuántas piezas hay que colocar, y por lo tanto cuántas cajas
          se embarcan.
        </p>
      </div>

      {/* ── Piece → carton → payload, per packing ───────────────────────── */}
      <ul className="mt-12 space-y-px border-t border-[color:var(--ink-primary)]">
        {rows.map((r) => (
          // Each row drafts on its own scroll trigger, so a buyer scrolling
          // through four packings sees four cartons pack and four containers
          // load — rather than all sixteen figures arriving while row four is
          // still off screen.
          <li
            key={`${r.format}-${r.pcs}-${r.kgPerCtn}`}
            className="border-b border-[color:var(--ink-decoration)]"
          >
            {/* TechDraw renders a <div>, so it lives INSIDE the <li> — between
                <ul> and <li> it is invalid markup and costs the list its
                semantics, which is the one thing telling a screen reader there
                are four packings here. */}
            <TechDraw>
              {/* FOUR PACKINGS BECOME A TABLE WHEN THERE IS ROOM FOR ONE.
                  Below lg this is two cells stacked into a card, which is the
                  only readable shape on a phone. At lg the two wrappers go
                  display:contents and their children become four real columns —
                  pila · una caja · la carga · el tope — so the four packings
                  line up down each column and the section's argument (the fine
                  format covers more m² per container, in far more cartons) is
                  legible by scanning rather than by remembering four cards.
                  It also gives back ~400px of scroll per row.

                  items-start, so every pile frame begins at the same y and the
                  four cartons share one ground line down the page. Stretched,
                  the left cell took the row's full height and the short 300×300
                  pile sank below its own carga band. */}
              <div className="grid items-start gap-6 py-8 md:grid-cols-[auto_1fr] md:gap-10 lg:grid-cols-[auto_auto_1fr_auto]">
                {/* items-start, so the carton's figures begin on the same line as
                    "Cajas hasta …" opposite them. The pile still stands on the
                    frame's floor — that ground line lives inside the SVG, which is
                    what lets the text align without lifting the carton off it. */}
                <div className="flex items-start gap-5 lg:contents">
                  <Pila pcs={r.pcs} tileMm={r.tileMm} thickMm={r.thickMm} frame={frame} />
                  <div>
                    <p className="font-mono text-mono-sm [font-variant-numeric:var(--numeric-variant)]">
                      {r.format} mm
                    </p>
                    <p className="mt-1 text-[length:var(--lane-type-stamp)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)]">
                      una caja
                    </p>
                    {/* Per-carton coverage keeps its decimals: 0,99 against 1,01
                        is the difference the carton count turns on. Weight does
                        not — 17,5 kg, never 17,50. */}
                    <p className="mt-3 font-mono text-mono-sm [font-variant-numeric:var(--numeric-variant)] text-[color:var(--ink-secondary)]">
                      {fmtInt(r.pcs)} piezas
                      <br />
                      {fmtM2(r.m2PerCtn)} m²
                      <br />
                      {r.kgPerCtn.toLocaleString('es-ES')} kg
                    </p>
                  </div>
                </div>

                <div className="min-w-0 lg:contents">
                  <div className="min-w-0">
                    <p className="text-[length:var(--lane-type-stamp)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)]">
                      Cajas hasta {fmtInt(payloadKg)} kg
                    </p>
                    <div className="mt-3">
                      <Carga
                        cartons={r.cartons}
                        payloadKg={payloadKg}
                        id={`${r.tileMm}-${r.pcs}-${String(r.kgPerCtn).replace('.', '')}`}
                      />
                    </div>
                  </div>

                  {/* The row's conclusion, and at lg its own column, so the four
                      totals read as the comparison they are. */}
                  <div className="mt-3 lg:mt-0 lg:text-right">
                    <p className="hidden text-[length:var(--lane-type-stamp)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)] lg:block">
                      Al tope de peso
                    </p>
                    {/* Whole m² for a container load. Two decimals here would be
                        1 631,14 — a centimetre-square claim on a figure the cutting
                        plan will move by tens. The per-carton figure above carries
                        the precision that actually decides a carton count. */}
                    <p className="whitespace-nowrap font-mono text-mono-sm [font-variant-numeric:var(--numeric-variant)] lg:mt-3">
                      {fmtInt(r.cartons)} cajas
                      <span className="mx-2 text-[color:var(--ink-decoration)]">·</span>
                      <span className="text-[color:var(--accent-ink)]">
                        {fmtInt(Math.round(r.m2))} m²
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </TechDraw>
          </li>
        ))}
      </ul>
    </div>
  )
}
