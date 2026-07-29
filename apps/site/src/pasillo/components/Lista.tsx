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

import Link from 'next/link'
import { PASILLO_ROUTES } from '@/pasillo/lib/routes'
import { useMemo, useState } from 'react'
import { StatusLamp } from '@/pasillo/components/StatusLamp'
import { SERIES, SKUS, finishLabel, getSeries, patternLabel } from '@/pasillo/lib/catalogue'
import { fmtM2 } from '@/pasillo/lib/packing'
import { haptic, useRecord } from '@/pasillo/lib/record'
import type { Finish, Sku } from '@/pasillo/types/catalogue'

type Sort = 'catalogue' | 'code' | 'series' | 'coverage'

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

  const rows = useMemo(() => {
    let out = SKUS.filter(
      (s) =>
        (finishes.size === 0 || finishes.has(s.finish)) &&
        (!seriesFilter || s.series_uid === seriesFilter),
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
  }, [finishes, seriesFilter, sort])

  const toggleFinish = (f: Finish) =>
    setFinishes((s) => {
      const n = new Set(s)
      if (n.has(f)) n.delete(f)
      else n.add(f)
      return n
    })

  return (
    <div className="min-h-dvh bg-pas-surface pb-24">
      <header className="sticky top-0 z-20 border-b pas-rule bg-pas-surface px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="pas-stamp opacity-pas-resting">Lista</p>
              <h1 className="font-pas-display text-pas-t2 font-semibold tracking-[-0.02em]">
                {rows.length} SKU
              </h1>
            </div>
            <Link href={PASILLO_ROUTES.lane} className="pas-stamp rounded-pas-chrome border border-pas-ink/25 px-4 py-2">
              Al catálogo
            </Link>
          </div>

          {/* finish is a text chip, never a swatch: finish is tactile and cannot
              be shown at 40px without lying about it */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {FINISHES.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={finishes.has(f.id)}
                onClick={() => toggleFinish(f.id)}
                className={`pas-stamp rounded-pas-chrome border px-3 py-1.5 ${
                  finishes.has(f.id) ? 'border-pas-ink bg-pas-ink text-pas-surface' : 'border-pas-ink/25'
                }`}
              >
                {f.label}
              </button>
            ))}
            <span aria-hidden className="mx-1 h-pas-5 w-px bg-pas-ink/15" />
            <select
              value={seriesFilter}
              onChange={(e) => setSeriesFilter(e.target.value)}
              aria-label="Serie"
              className="pas-stamp rounded-pas-chrome border border-pas-ink/25 bg-pas-surface px-2 py-1.5"
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
              className="pas-stamp rounded-pas-chrome border border-pas-ink/25 bg-pas-surface px-2 py-1.5"
            >
              <option value="catalogue">Orden del catálogo</option>
              <option value="code">Código</option>
              <option value="series">Serie</option>
              <option value="coverage">Cobertura</option>
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
                  <span className="pas-mono block truncate text-pas-dense">{sku.code}</span>
                  <span className="block truncate text-pas-label opacity-pas-resting">
                    {series.name_raw} · {finishLabel(sku)}
                  </span>
                  <span className="block truncate text-pas-label opacity-pas-dimmed">
                    {patternLabel(sku)}
                  </span>
                </span>
              </button>

              <span className="pas-mono hidden shrink-0 text-right text-pas-micro opacity-pas-resting sm:block">
                {fmtM2(series.m2_per_ctn)} m²/caja
              </span>
              <StatusLamp status={series.status} />
            </div>
          )
        })}
        {rows.length === 0 && (
          <p className="py-16 text-center text-pas-t1 opacity-pas-resting">
            Ningún SKU coincide con estos filtros.
          </p>
        )}
      </main>
    </div>
  )
}
