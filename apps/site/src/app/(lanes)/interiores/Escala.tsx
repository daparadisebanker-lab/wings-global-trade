// WGT/02 Interiores — la escala, drawn.
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
// Static SVG on purpose — no canvas, no rAF, no animation library. This is a
// Server Component on a spec page; the drawing is deterministic, so it renders
// identically on the server and the client and costs nothing after paint.

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

/**
 * A square of wall laid in one format. Both panels below are drawn at the SAME
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
  const pieces: React.ReactNode[] = []
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      pieces.push(
        <rect
          key={`${x}-${y}`}
          x={(x * t).toFixed(2)}
          y={(y * t).toFixed(2)}
          width={(t - 1).toFixed(2)}
          height={(t - 1).toFixed(2)}
          fill="var(--accent)"
          opacity={tone(y * n + x, 0.18, 0.14).toFixed(3)}
        />,
      )
    }
  }

  return (
    // Side by side at every width, including 390px: two squares of the same
    // paño only make their argument when the eye can hold both at once.
    <figure className="min-w-0 flex-1 basis-[136px] sm:max-w-[240px]">
      <svg
        viewBox={`0 0 ${S} ${S}`}
        className="w-full"
        role="img"
        aria-label={`Un paño de ${side / 1000} por ${side / 1000} metros en formato ${tileMm}×${tileMm}: ${n * n} piezas`}
      >
        <rect width={S} height={S} fill="var(--surface-1)" />
        {pieces}
        <rect
          width={S}
          height={S}
          fill="none"
          stroke="var(--ink-primary)"
          strokeWidth="1"
        />
      </svg>
      <figcaption className="mt-3">
        <span className="block font-mono text-mono-sm [font-variant-numeric:var(--numeric-variant)]">
          {label}
        </span>
        <span className="mt-1 block text-[length:var(--lane-type-stamp)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)]">
          {fmtInt(n * n)} piezas
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

  return (
    <svg
      viewBox={`0 0 ${frame.w.toFixed(1)} ${frame.h.toFixed(1)}`}
      width={frame.w.toFixed(1)}
      height={frame.h.toFixed(1)}
      className="shrink-0"
      role="img"
      aria-label={`Una caja de ${tileMm}×${tileMm}: ${pcs} piezas apiladas`}
    >
      {Array.from({ length: pcs }, (_, i) => (
        <rect
          key={i}
          x={x.toFixed(2)}
          y={(top + i * (h + PILE_GAP)).toFixed(2)}
          width={w.toFixed(2)}
          height={Math.max(h, 0.8).toFixed(2)}
          fill="var(--accent)"
          opacity={tone(i, 0.22, 0.28).toFixed(3)}
        />
      ))}
    </svg>
  )
}

/**
 * The carga field: one mark per carton, and there are exactly as many marks as
 * there are cartons before {payload} kg. It is a count you can look at rather
 * than read — 1 611 small cartons and 1 128 large ones are the same tonnage and
 * visibly not the same quantity to handle.
 */
function Carga({ cartons }: { cartons: number }) {
  // Columns are derived from the count, not fixed, so every field lands at
  // roughly 8:1 whatever the packing. Fixed at 64 the 1 611-carton field drew
  // 26 rows — a 400px slab that took the row over and made four packings
  // impossible to compare at a glance. The band is the unit of comparison
  // here; it has to stay a band.
  const COLS = Math.ceil(Math.sqrt(cartons * 8))
  const rows = Math.ceil(cartons / COLS)
  const p = 4 // pitch
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
        opacity={tone(i, 0.34, 0.34).toFixed(3)}
      />,
    )
  }
  return (
    <svg
      viewBox={`0 0 ${COLS * p} ${rows * p}`}
      className="w-full max-w-[34rem]"
      role="img"
      aria-label={`${cartons} cajas`}
    >
      {marks}
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
      {/* ── One paño, two formats ───────────────────────────────────────── */}
      {/* Side by side and close, at every width. The comparison IS the panel;
          spread across a 1440px grid the two squares stop being one image. */}
      <div className="flex flex-wrap gap-8 sm:gap-12">
        <Pano side={PANO_MM} tileMm={150} label="150×150 mm" />
        <Pano side={PANO_MM} tileMm={300} label="300×300 mm" />
      </div>
      <p className="mt-6 max-w-[58ch] text-[length:var(--type-0)] leading-[1.5] text-[color:var(--ink-secondary)]">
        El mismo paño de {(PANO_MM / 1000).toFixed(1).replace('.', ',')} × {(PANO_MM / 1000).toFixed(1).replace('.', ',')} m
        — {fmtM2((PANO_MM / 1000) ** 2)} m² — en los dos formatos del catálogo. El formato no
        cambia el área: cambia cuántas piezas hay que colocar, y por lo tanto cuántas cajas
        se embarcan.
      </p>

      {/* ── Piece → carton → payload, per packing ───────────────────────── */}
      <ul className="mt-12 space-y-px border-t border-[color:var(--ink-primary)]">
        {rows.map((r) => (
          <li
            key={`${r.format}-${r.pcs}-${r.kgPerCtn}`}
            // items-start, so every pile frame begins at the same y and the
            // four cartons share one ground line down the page. Stretched, the
            // left cell took the row's full height and the short 300×300 pile
            // sank below its own carga band.
            className="grid items-start gap-6 border-b border-[color:var(--ink-decoration)] py-8 md:grid-cols-[auto_1fr] md:gap-10"
          >
            {/* items-start, so the carton's figures begin on the same line as
                "Cajas hasta …" opposite them. The pile still stands on the
                frame's floor — that ground line lives inside the SVG, which is
                what lets the text align without lifting the carton off it. */}
            <div className="flex items-start gap-5">
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

            <div className="min-w-0">
              <p className="text-[length:var(--lane-type-stamp)] uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--ink-secondary)]">
                Cajas hasta {fmtInt(payloadKg)} kg
              </p>
              <div className="mt-3">
                <Carga cartons={r.cartons} />
              </div>
              {/* Whole m² for a container load. Two decimals here would be
                  1 631,14 — a centimetre-square claim on a figure the cutting
                  plan will move by tens. The per-carton figure above carries
                  the precision that actually decides a carton count. */}
              <p className="mt-3 font-mono text-mono-sm [font-variant-numeric:var(--numeric-variant)]">
                {fmtInt(r.cartons)} cajas
                <span className="mx-2 text-[color:var(--ink-decoration)]">·</span>
                <span className="text-[color:var(--accent-ink)]">
                  {fmtInt(Math.round(r.m2))} m²
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
