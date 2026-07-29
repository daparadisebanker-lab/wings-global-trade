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
import { useSearchParams } from 'next/navigation'
import { LaneExit } from '@/pasillo/components/PasilloShell'
import { StatusLamp } from '@/pasillo/components/StatusLamp'
import { SERIES, SKUS, finishLabel, getSeries, patternLabel } from '@/pasillo/lib/catalogue'
import { fmtM2 } from '@/pasillo/lib/packing'
import { PARAM_SKU } from '@/pasillo/lib/routes'
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

export function Lista({ onOpenSku }: { onOpenSku: (sku: Sku) => void }) {
  const rec = useRecord()
  const [sort, setSort] = useState<Sort>('catalogue')
  const [finishes, setFinishes] = useState<Set<Finish>>(() => new Set())
  const [seriesFilter, setSeriesFilter] = useState<string>('')
  const [formats, setFormats] = useState<Set<string>>(() => new Set())
  const [query, setQuery] = useState('')
  const params = useSearchParams()

  /** A shared link lands here with its code already in the box. */
  useEffect(() => {
    const code = params.get(PARAM_SKU)
    if (code) setQuery(code)
  }, [params])

  const rows = useMemo(() => {
    // 236 rows in memory need a filter box, not a search engine — and it matches
    // only fields the supplier actually printed: the code, the series name, and
    // the colour name where one exists. Nothing inferred, nothing fuzzy.
    const q = query.trim().toLowerCase()
    let out = SKUS.filter(
      (s) =>
        (finishes.size === 0 || finishes.has(s.finish)) &&
        (!seriesFilter || s.series_uid === seriesFilter) &&
        (formats.size === 0 ||
          formats.has(getSeries(s.series_uid)?.format_mm.join('×') ?? '')) &&
        (!q ||
          s.code.toLowerCase().includes(q) ||
          (getSeries(s.series_uid)?.name_raw ?? '').toLowerCase().includes(q) ||
          (s.colour_name ?? '').toLowerCase().includes(q)),
    )
    if (sort === 'code') out = [...out].sort((a, b) => a.code.localeCompare(b.code))
    else if (sort === 'series')
      out = [...out].sort(
        (a, b) =>
          (getSeries(a.series_uid)?.name_raw ?? '').localeCompare(
            getSeries(b.series_uid)?.name_raw ?? '',
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
        <div className="mx-auto max-w-4xl">
          {/* The eyebrow IS the way out. The old right-hand pill duplicated the
              density switch's Recorrido target and sat directly beneath it —
              100% occluded at 390px, invisible and untappable. And it read "Al
              catálogo", which collides with the machinery Catálogo in the global
              nav: the same word naming two different trees. */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <div>
              <LaneExit />
              <h1 className="font-pas-display text-pas-t2 font-semibold tracking-pas-display">
                {rows.length} {rows.length === 1 ? 'referencia' : 'referencias'}
              </h1>
            </div>
            {allAvailable && rows.length > 0 && (
              // Stated once, so 236 identical green lamps stop being noise and an
              // exception can actually pop.
              <p className="pas-stamp opacity-pas-resting">Disponibles salvo indicación</p>
            )}
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Código o serie"
            aria-label="Buscar por código, serie o color"
            className="pas-mono mt-3 w-full rounded-pas-chrome border border-pas-ink/25 bg-pas-surface
                       px-3 py-2 text-pas-dense placeholder:opacity-pas-dimmed"
          />

          {/* finish is a text chip, never a swatch: finish is tactile and cannot
              be shown at 40px without lying about it */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {FINISHES.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={finishes.has(f.id)}
                onClick={() => toggleFinish(f.id)}
                className={`pas-stamp rounded-pas-chrome border px-3 py-2 ${
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
                className={`pas-stamp rounded-pas-chrome border px-3 py-2 ${
                  formats.has(f) ? 'border-pas-ink bg-pas-ink text-pas-surface' : 'border-pas-ink/25'
                }`}
              >
                {f}
              </button>
            ))}
            <span aria-hidden className="mx-1 h-pas-5 w-px bg-pas-ink/15" />
            <select
              value={seriesFilter}
              onChange={(e) => setSeriesFilter(e.target.value)}
              aria-label="Serie"
              className="pas-stamp rounded-pas-chrome border border-pas-ink/25 bg-pas-surface px-2 py-2"
            >
              <option value="">Todas las series</option>
              {SERIES.map((s) => (
                <option key={s.series_uid} value={s.series_uid}>
                  {s.name_raw}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Ordenar"
              className="pas-stamp rounded-pas-chrome border border-pas-ink/25 bg-pas-surface px-2 py-2"
            >
              <option value="catalogue">Orden del catálogo</option>
              <option value="code">Código</option>
              <option value="series">Serie</option>
              <option value="coverage">m² por caja</option>
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4">
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
                className="grid h-pas-6 w-pas-6 shrink-0 place-items-center border border-pas-ink/40"
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
                <span className="min-w-0 flex-1">
                  {/* Never truncate a code: it is the string a buyer pastes
                      into WhatsApp. The lines beneath it may elide. */}
                  <span className="pas-mono block whitespace-nowrap text-pas-dense">{sku.code}</span>
                  <span className="block truncate text-pas-label opacity-pas-resting">
                    {series.name_raw} · {finishLabel(sku)}
                  </span>
                  <span className="block truncate text-pas-label opacity-pas-dimmed">
                    {patternLabel(sku)}
                  </span>
                </span>
              </button>

              {/* The coverage figure was hidden below sm — on the device this
                  tool was designed for — while a lamp reading DISPONIBLE
                  repeated 236 times took the space. Swapped: the number that
                  differentiates always shows; the lamp appears only when the
                  status is an exception, and never without its label. */}
              <span className="pas-mono shrink-0 text-right text-pas-micro opacity-pas-resting">
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
