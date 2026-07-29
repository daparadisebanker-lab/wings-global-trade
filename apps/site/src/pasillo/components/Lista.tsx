'use client'

// El Pasillo · §2 — Lista, the comparison density.
//
// Same content set, same collect gesture, same record — a third zoom level, not
// a third product. Where the Lane gives presence and never reorders, the Lista
// gives comparison and may sort freely: there is no spatial memory here to
// protect, so ordering is the buyer's tool rather than the aisle's promise.
//
// Filters REMOVE non-matches here. In the Lane the same filter only dims, in
// place, because the aisle's positions are a memory the buyer is using.
//
// This is also the accessibility floor: everything collectable in the Lane is
// collectable here, with checkboxes instead of gestures.

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Hint } from '@/pasillo/components/Hint'
import { LaneExit } from '@/pasillo/components/PasilloShell'
import { StatusLamp } from '@/pasillo/components/StatusLamp'
import {
  SERIES,
  SKUS,
  colourLabel,
  finishLabel,
  formatLabel,
  getSeries,
  patternLabel,
  seriesName,
  seriesOption,
} from '@/pasillo/lib/catalogue'
import { fmtInt, fmtKg, fmtM2 } from '@/pasillo/lib/packing'
import { PARAM_FORMAT, PARAM_SKU, PASILLO_ROUTES } from '@/pasillo/lib/routes'
import { haptic, useRecord } from '@/pasillo/lib/record'
import type { Finish, Sku } from '@/pasillo/types/catalogue'

type Sort = 'catalogue' | 'code' | 'series' | 'coverage'

/** Formats the catalogue actually carries, derived — never a typed list. */
const FORMATS = [...new Set(SERIES.map((s) => s.format_mm.join('×')))].sort()

const FINISHES: { id: Finish; label: string }[] = [
  { id: 'matte', label: 'Mate' },
  { id: 'glossy', label: 'Brillante' },
  { id: 'massed_glaze', label: 'Esmalte macizo' },
]

/** The series' Spanish name from a SKU's uid — resolved once per lookup. */
const seriesLabel = (uid: string): string => {
  const s = getSeries(uid)
  return s ? seriesName(s) : ''
}

export function Lista({ onOpenSku }: { onOpenSku: (sku: Sku) => void }) {
  const rec = useRecord()
  const [sort, setSort] = useState<Sort>('catalogue')
  const [finishes, setFinishes] = useState<Set<Finish>>(() => new Set())
  const [seriesFilter, setSeriesFilter] = useState<string>('')
  const [formats, setFormats] = useState<Set<string>>(() => new Set())
  const [query, setQuery] = useState('')
  const params = useSearchParams()

  /** A shared link lands here with its code already in the box, and a buyer
   *  arriving from "¿Qué formato?" lands with that format already applied —
   *  the comparison hands off INTO the catalogue, not at its door. */
  useEffect(() => {
    const code = params.get(PARAM_SKU)
    if (code) setQuery(code)
    const fmt = params.get(PARAM_FORMAT)
    if (fmt && FORMATS.includes(fmt)) setFormats(new Set([fmt]))
  }, [params])

  const rows = useMemo(() => {
    // 236 rows in memory need a filter box, not a search engine — and it matches
    // only fields the supplier actually printed: the code, the series name, and
    // the colour name where one exists. Nothing inferred, nothing fuzzy.
    //
    // BOTH names are searchable, Spanish and printed. The aisle shows "Mar de
    // Flores"; the supplier's PDF says "Flower Sea Series", and a buyer with
    // that PDF open must not come up empty.
    const q = query.trim().toLowerCase()
    let out = SKUS.filter(
      (s) =>
        (finishes.size === 0 || finishes.has(s.finish)) &&
        (!seriesFilter || s.series_uid === seriesFilter) &&
        (formats.size === 0 ||
          formats.has(getSeries(s.series_uid)?.format_mm.join('×') ?? '')) &&
        (!q ||
          s.code.toLowerCase().includes(q) ||
          seriesLabel(s.series_uid).toLowerCase().includes(q) ||
          (getSeries(s.series_uid)?.name_raw ?? '').toLowerCase().includes(q) ||
          (colourLabel(s) ?? '').toLowerCase().includes(q) ||
          (s.colour_name ?? '').toLowerCase().includes(q)),
    )
    if (sort === 'code') out = [...out].sort((a, b) => a.code.localeCompare(b.code))
    else if (sort === 'series')
      out = [...out].sort(
        (a, b) =>
          seriesLabel(a.series_uid).localeCompare(
            seriesLabel(b.series_uid),
          ) || a.code.localeCompare(b.code),
      )
    else if (sort === 'coverage')
      out = [...out].sort(
        (a, b) =>
          (getSeries(b.series_uid)?.m2_per_ctn ?? 0) - (getSeries(a.series_uid)?.m2_per_ctn ?? 0),
      )
    return out
  }, [finishes, formats, query, seriesFilter, sort])

  const toggleFinish = (f: Finish) =>
    setFinishes((s) => {
      const n = new Set(s)
      if (n.has(f)) n.delete(f)
      else n.add(f)
      return n
    })

  const toggleFormat = (f: string) =>
    setFormats((s) => {
      const n = new Set(s)
      if (n.has(f)) n.delete(f)
      else n.add(f)
      return n
    })

  /** Availability is the default; only an exception earns a lamp per row. */
  const allAvailable = rows.every((r) => getSeries(r.series_uid)?.status === 'available')

  return (
    <div className="min-h-dvh bg-pas-surface pb-24">
      <header className="sticky top-0 z-20 border-b pas-rule bg-pas-surface px-4 py-3">
        <div className="pas-measure">
          {/* The eyebrow IS the way out. The old right-hand pill duplicated the
              density switch's Recorrido target and sat directly beneath it —
              100% occluded at 390px, invisible and untappable. And it read "Al
              catálogo", which collides with the machinery Catálogo in the global
              nav: the same word naming two different trees. */}
          {/* The fixed density switch owns the top-right band. Nothing else
              may sit in it: the availability note used to, and truncated
              mid-word under the pill. pr reserves the switch's width so the
              exit stamp and the count can never slide beneath it either. */}
          <div className="flex flex-col gap-1 pr-[11.5rem]">
            <LaneExit />
            <h1 className="font-pas-display text-pas-t2 font-semibold tracking-pas-display">
              {rows.length} {rows.length === 1 ? 'referencia' : 'referencias'}
            </h1>
          </div>

          {allAvailable && rows.length > 0 && (
            // Stated once, so 236 identical green lamps stop being noise and a
            // real exception can pop. It describes the rows, so it sits with
            // them rather than in the chrome band.
            <p className="pas-stamp mt-2 opacity-pas-resting">Disponibles salvo indicación</p>
          )}

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Código o serie"
            aria-label="Buscar por código, serie o color"
            // Full width is right on a phone and wrong at 1280, where a search
            // box the width of the page states that a very long query is
            // expected — the longest thing typed here is an eight-character SKU.
            className="pas-mono mt-3 w-full rounded-pas-chrome border border-pas-ink/25 bg-pas-surface
                       px-3 py-2 text-pas-dense placeholder:opacity-pas-dimmed sm:max-w-sm"
          />

          {/* ONE SCROLLING RAIL, NOT FOUR WRAPPING ROWS.
              flex-wrap put finish, format and the two selects on four stacked
              lines: ~450px of controls before the first row of the thing the
              buyer came to compare, which on a 844px phone is two visible rows.
              A single rail that scrolls sideways holds every filter, costs one
              line, and gives back four rows above the fold. The rail keeps its
              own overflow so the sticky header never grows.
              finish is a text chip, never a swatch: finish is tactile and
              cannot be shown at 40px without lying about it. */}
          <div
            className="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1
                       [mask-image:linear-gradient(90deg,#000_calc(100%-20px),transparent)]
                       sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0
                       sm:[mask-image:none]"
          >
            {FINISHES.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={finishes.has(f.id)}
                onClick={() => toggleFinish(f.id)}
                className={`pas-stamp shrink-0 whitespace-nowrap rounded-pas-chrome border px-3 py-2 ${
                  finishes.has(f.id) ? 'border-pas-ink bg-pas-ink text-pas-surface' : 'border-pas-ink/25'
                }`}
              >
                {f.label}
              </button>
            ))}
            {/* Format is on every series and was the one honest axis missing.
                It is NOT the facet rail: that needs pattern_family, which colour
                clustering cannot produce, and a rail that mislabels a tile is
                worse than one that omits the axis. */}
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={formats.has(f)}
                onClick={() => toggleFormat(f)}
                className={`pas-stamp shrink-0 whitespace-nowrap rounded-pas-chrome border px-3 py-2 ${
                  formats.has(f) ? 'border-pas-ink bg-pas-ink text-pas-surface' : 'border-pas-ink/25'
                }`}
              >
                {f}
              </button>
            ))}
            <span aria-hidden className="mx-1 h-pas-5 w-px shrink-0 bg-pas-ink/15" />
            <select
              value={seriesFilter}
              onChange={(e) => setSeriesFilter(e.target.value)}
              aria-label="Serie"
              className="pas-stamp shrink-0 rounded-pas-chrome border border-pas-ink/25 bg-pas-surface px-2 py-2"
            >
              <option value="">Todas las series</option>
              {SERIES.map((s) => (
                <option key={s.series_uid} value={s.series_uid}>
                  {seriesOption(s)}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Ordenar"
              className="pas-stamp shrink-0 rounded-pas-chrome border border-pas-ink/25 bg-pas-surface px-2 py-2"
            >
              <option value="catalogue">Orden del catálogo</option>
              <option value="code">Código</option>
              <option value="series">Serie</option>
              <option value="coverage">m² por caja</option>
            </select>
          </div>

          {/* Teaching at the moment of the decision. It links to the
              comparison rather than explaining it: "which format" is a
              question about cartons and pieces, not about this control.
              Retires the moment a format is applied — the buyer has just
              demonstrated they know what the chips do. */}
          <div className="mt-2">
            <Hint id="formato" retireWhen={formats.size > 0}>
              ¿150×150 o 300×300?{' '}
              <Link href={PASILLO_ROUTES.formatos} className="underline underline-offset-4">
                Mira lo que cambia
              </Link>{' '}
              en piezas, cajas y contenedor.
            </Hint>
          </div>
        </div>
      </header>

      <main className="pas-measure px-4">
        {rows.map((sku) => {
          const series = getSeries(sku.series_uid)
          if (!series) return null
          const selected = rec.isSkuSelected(sku.series_uid, sku.sku_uid)
          return (
            <div key={sku.sku_uid} className="flex h-pas-row items-center gap-3 border-b pas-rule">
              <button
                type="button"
                role="checkbox"
                aria-checked={selected}
                aria-label={`Seleccionar ${sku.code}`}
                onClick={() => {
                  haptic('check')
                  if (selected) rec.toggleSku(sku.series_uid, sku.sku_uid)
                  else rec.collectSku(sku.series_uid, sku.sku_uid)
                }}
                // 32px visual, 44px target. The lane's own law calls 44 the
                // touch floor; this control was 32 and butted against a much
                // larger button, so a miss opened the sheet instead of
                // selecting. The inset keeps the density and buys the finger.
                className="relative grid h-pas-6 w-pas-6 shrink-0 place-items-center border
                           border-pas-ink/40 before:absolute before:-inset-1.5 before:content-['']"
              >
                {selected && (
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6.4 L4.8 9.2 L10 3" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenSku(sku)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sku.thumb}
                  alt=""
                  className="h-11 w-11 shrink-0 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {/* A STACK ON A PHONE, COLUMNS ON A DESKTOP.
                    The same three facts, laid out for the width they have. At
                    390px they stack and the lower two elide, because that is the
                    only honest thing to do with 200px. At lg they become three
                    aligned columns — which is what turns this from a tall phone
                    list into the comparison surface it is named for: acabado and
                    formato now line up down the page, so a buyer scans a column
                    instead of re-reading every row. It also reclaims the ~350px
                    of empty ground that sat between the elided text and the
                    coverage figure at 1440. */}
                <span
                  className="min-w-0 flex-1 lg:grid lg:grid-cols-[11ch_26ch_1fr] lg:items-baseline
                             lg:gap-pas-5"
                >
                  {/* Never truncate a code: it is the string a buyer pastes
                      into WhatsApp. The lines beneath it may elide. */}
                  <span className="pas-mono block whitespace-nowrap text-pas-dense">{sku.code}</span>
                  <span className="block truncate text-pas-label opacity-pas-resting">
                    {seriesName(series)} · {finishLabel(sku)}
                  </span>
                  {/* THE FORMAT BELONGS ON A COMPARISON ROW.
                      Two series are both "Esmalte Macizo", one at 150 and one
                      at 300, so without it two rows here read identically for
                      products a buyer would never confuse in person. It is also
                      the axis they compare on first — tile size decides the
                      room before pattern does. */}
                  <span className="block truncate text-pas-label opacity-pas-dimmed">
                    {formatLabel(series)} · {patternLabel(sku)}
                  </span>
                </span>
              </button>

              {/* The coverage figure was hidden below sm — on the device this
                  tool was designed for — while a lamp reading DISPONIBLE
                  repeated 236 times took the space. Swapped: the number that
                  differentiates always shows; the lamp appears only when the
                  status is an exception, and never without its label. */}
              {/* THE DESKTOP GETS THE WHOLE CARTON, NOT A THIRD OF IT.
                  m²/caja alone left ~350px of empty ground on this row at 1440
                  while the two figures that decide the rest of a quote — how many
                  pieces a tiler places and what the carton weighs against a
                  payload limit — sat two screens away in the Trade Desk. All
                  three are printed by the supplier and all three are already on
                  the series, so this is not new data, it is data that had no room.
                  Below lg only coverage survives, because 390px has room for one
                  figure and coverage is the one that differentiates. */}
              <span className="pas-mono hidden shrink-0 text-right text-pas-micro opacity-pas-dimmed lg:block lg:w-24">
                {fmtInt(series.pcs_per_ctn)} pzas/caja
              </span>
              <span className="pas-mono hidden shrink-0 text-right text-pas-micro opacity-pas-dimmed lg:block lg:w-24">
                {fmtKg(series.kgs_per_ctn)} kg/caja
              </span>
              <span className="pas-mono shrink-0 text-right text-pas-micro opacity-pas-resting lg:w-24">
                {fmtM2(series.m2_per_ctn)} m²/caja
              </span>
              {series.status !== 'available' && <StatusLamp status={series.status} />}
            </div>
          )
        })}
        {rows.length === 0 && (
          <p className="py-16 text-center text-pas-t1 opacity-pas-resting">
            Ninguna referencia coincide con estos filtros.
          </p>
        )}
      </main>
    </div>
  )
}
