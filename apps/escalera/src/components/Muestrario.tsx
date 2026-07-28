'use client'

// El Pasillo · §4.7 — the muestrario. Two row types, because a booth is a series.
//
// A series row is a folder: tri-state checkbox, the series' own thumbnail, and
// "22 SKUs · 6 elegidos". A SKU row is a leaf, indented, carrying the code in
// mono and its coverage. 64px rows, hairline between, zero radius, no cards —
// REF-A's rule: structure does a card's work for one pixel.
//
// Checked items float to their own section under a mono eyebrow, because the
// buyer's shortlist is the thing they came back for. Order is theirs: long-press
// a series row and drag it. Their logic outranks ours.

import Link from 'next/link'
import { useCallback, useMemo, useRef, useState } from 'react'
import { VolumeFooter } from '@/components/VolumeFooter'
import { StatusLamp } from '@/components/StatusLamp'
import { finishLabel, getSeries, skusOf } from '@/lib/catalogue'
import {
  BASIS_LABEL,
  containerFill,
  fmtInt,
  fmtM2,
  lineTotals,
  sumTotals,
  type ContainerKind,
} from '@/lib/packing'
import { haptic, useRecord, type Folder } from '@/lib/record'
import type { Sku } from '@/types/catalogue'

export function Muestrario({ onOpenSku }: { onOpenSku: (sku: Sku) => void }) {
  const rec = useRecord()
  const [kind, setKind] = useState<ContainerKind>('20GP')
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [drag, setDrag] = useState<{ uid: string; y: number } | null>(null)
  const rowsRef = useRef<HTMLDivElement>(null)

  const { totals, fill } = useMemo(() => {
    const lines = rec.state.folders.flatMap((f) => {
      const series = getSeries(f.series_uid)
      if (!series) return []
      return f.selected.map((uid) => lineTotals(rec.state.qty[uid], series))
    })
    const t = sumTotals(lines)
    return { totals: t, fill: containerFill(t.kg, kind) }
  }, [rec.state.folders, rec.state.qty, kind])

  const toggleOpen = (uid: string) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(uid)) n.delete(uid)
      else n.add(uid)
      return n
    })

  // Long-press then drag to reorder. Computed from row midpoints so a drop
  // always lands where the buyer sees the row, not where a transform ended.
  const onDragMove = useCallback(
    (uid: string, clientY: number) => {
      const host = rowsRef.current
      if (!host) return
      const rows = [...host.querySelectorAll<HTMLElement>('[data-folder]')]
      const from = rec.state.folders.findIndex((f) => f.series_uid === uid)
      let to = from
      rows.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        if (clientY > r.top + r.height / 2) to = i
      })
      if (to !== from && to >= 0) {
        const next = [...rec.state.folders]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        rec.reorder(next)
      }
    },
    [rec],
  )

  if (!rec.hydrated) return <div className="min-h-dvh bg-surface" aria-busy="true" />

  const folders = rec.state.folders
  const anySelected = folders.some((f) => f.selected.length > 0)

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b rule px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-4">
          <div>
            <p className="stamp opacity-resting">El Muestrario</p>
            <h1 className="font-display text-t2 font-semibold tracking-[-0.02em]">
              {folders.length} {folders.length === 1 ? 'serie' : 'series'}
            </h1>
          </div>
          <Link href="/" className="stamp rounded-chrome border border-ink/25 px-4 py-2">
            Al pasillo
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        {rec.degraded && (
          <p className="mb-4 border rule px-3 py-2 text-t0 opacity-resting">
            Este navegador bloquea el almacenamiento local. El muestrario funciona en esta
            sesión, pero exporta antes de salir.
          </p>
        )}

        {folders.length === 0 ? (
          <div className="border rule px-6 py-16 text-center">
            <p className="stamp opacity-resting">Muestrario vacío</p>
            <p className="mx-auto mt-3 max-w-sm text-t1">
              El muestrario está vacío. Desliza a la derecha para guardar una serie.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block bg-ink px-6 py-3 text-t0 text-surface"
            >
              Abrir el pasillo
            </Link>
          </div>
        ) : (
          <div ref={rowsRef}>
            {folders.map((folder) => (
              <FolderRow
                key={folder.series_uid}
                folder={folder}
                expanded={open.has(folder.series_uid)}
                dragging={drag?.uid === folder.series_uid}
                onToggleOpen={() => toggleOpen(folder.series_uid)}
                onOpenSku={onOpenSku}
                onDragStart={(y) => setDrag({ uid: folder.series_uid, y })}
                onDragMove={(y) => onDragMove(folder.series_uid, y)}
                onDragEnd={() => setDrag(null)}
              />
            ))}
          </div>
        )}
      </main>

      {anySelected && (
        <div className="sticky bottom-0">
          <VolumeFooter
            totals={totals}
            fill={fill}
            basis={rec.state.basis}
            onBasis={rec.setBasis}
            kind={kind}
            onKind={setKind}
          />
          {/* Two send actions, equal weight. Parity is mandatory. */}
          <div className="border-t rule bg-surface px-4 py-3">
            <div className="mx-auto flex max-w-3xl gap-3">
              <Link
                href="/mesa"
                className="flex-1 rounded-chrome border border-ink/30 py-3 text-center text-t0"
              >
                Mesa de comercio
              </Link>
            </div>
          </div>
        </div>
      )}

      {rec.undo && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-3xl items-center
                     justify-between gap-4 rounded-chrome bg-ink px-5 py-3.5 text-surface"
        >
          <span className="text-t0">
            <span className="mono">{rec.undo.label}</span> fuera del muestrario
          </span>
          <button type="button" onClick={rec.runUndo} className="stamp underline">
            Deshacer
          </button>
        </div>
      )}
    </div>
  )
}

function FolderRow({
  folder,
  expanded,
  dragging,
  onToggleOpen,
  onOpenSku,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  folder: Folder
  expanded: boolean
  dragging: boolean
  onToggleOpen: () => void
  onOpenSku: (sku: Sku) => void
  onDragStart: (y: number) => void
  onDragMove: (y: number) => void
  onDragEnd: () => void
}) {
  const rec = useRecord()
  const series = getSeries(folder.series_uid)
  const press = useRef<ReturnType<typeof setTimeout> | null>(null)
  const held = useRef(false)

  if (!series) return null
  const skus = skusOf(folder.series_uid)
  const tri = rec.triState(folder.series_uid)
  const cover = skus[0]

  return (
    <div data-folder={folder.series_uid} className={dragging ? 'opacity-resting' : undefined}>
      <div className="flex h-row items-center gap-3 border-b rule">
        <TriBox
          state={tri}
          label={`Seleccionar ${series.name_raw}`}
          onChange={() => {
            haptic('check')
            rec.setSeriesAll(folder.series_uid, tri !== 'all')
          }}
        />

        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.thumb}
            alt=""
            className="h-11 w-11 shrink-0 object-cover"
            loading="lazy"
            decoding="async"
          />
        )}

        <button
          type="button"
          onClick={onToggleOpen}
          onPointerDown={(e) => {
            const y = e.clientY
            press.current = setTimeout(() => {
              held.current = true
              haptic('check')
              onDragStart(y)
            }, 380)
          }}
          onPointerMove={(e) => {
            if (held.current) onDragMove(e.clientY)
          }}
          onPointerUp={() => {
            if (press.current) clearTimeout(press.current)
            if (held.current) onDragEnd()
            held.current = false
          }}
          onPointerLeave={() => {
            if (press.current) clearTimeout(press.current)
          }}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 py-2 text-left"
        >
          <span className="min-w-0">
            <span className="block truncate text-t0">{series.name_raw}</span>
            <span className="block truncate text-[12px] opacity-resting">
              {series.format_mm[0]}×{series.format_mm[1]} · {series.m2_per_ctn.toFixed(2)} m²/caja
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="mono block text-[12px]">{skus.length} SKU</span>
            <span className="mono block text-[12px] opacity-resting">
              {folder.selected.length} elegidos
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleOpen}
          aria-label={expanded ? 'Contraer' : 'Expandir'}
          aria-expanded={expanded}
          className="w-8 shrink-0 text-center opacity-resting"
        >
          {expanded ? '▾' : '▸'}
        </button>
      </div>

      {expanded && (
        <div className="pl-4">
          {skus.map((sku) => (
            <SkuRow key={sku.sku_uid} sku={sku} onOpen={() => onOpenSku(sku)} />
          ))}
          <div className="flex h-row items-center gap-3 border-b rule pl-4">
            <button
              type="button"
              onClick={() => rec.removeSeries(folder.series_uid, series.name_raw)}
              className="stamp opacity-resting underline"
            >
              Quitar la serie
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SkuRow({ sku, onOpen }: { sku: Sku; onOpen: () => void }) {
  const rec = useRecord()
  const series = getSeries(sku.series_uid)
  const selected = rec.isSkuSelected(sku.series_uid, sku.sku_uid)
  const qty = rec.state.qty[sku.sku_uid]
  const basis = rec.state.basis
  if (!series) return null
  const line = lineTotals(qty, series)

  return (
    <div className="border-b rule">
      <div className="flex h-row items-center gap-3">
        <TriBox
          state={selected ? 'all' : 'none'}
          label={`Seleccionar ${sku.code}`}
          onChange={() => rec.toggleSku(sku.series_uid, sku.sku_uid)}
        />
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sku.thumb}
            alt=""
            className="h-10 w-10 shrink-0 object-cover"
            loading="lazy"
            decoding="async"
          />
          <span className="min-w-0 flex-1 text-left">
            <span className="mono block truncate text-[13px]">{sku.code}</span>
            <span className="block truncate text-[11px] opacity-resting">{finishLabel(sku)}</span>
          </span>
        </button>
        <span className="mono shrink-0 text-right text-[12px] opacity-resting">
          {line.cartons > 0 ? `${fmtInt(line.cartons)} cajas` : `${series.m2_per_ctn.toFixed(2)} m²`}
        </span>
        <StatusLamp status={series.status} />
      </div>

      {selected && (
        <div className="flex items-center gap-3 pb-3 pl-11">
          <label className="flex items-center gap-2">
            <span className="stamp opacity-resting">Cantidad</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={qty?.value ?? ''}
              placeholder="0"
              onChange={(e) =>
                rec.setQty(
                  sku.sku_uid,
                  e.target.value === ''
                    ? null
                    : { value: Math.max(0, Number(e.target.value)), basis },
                )
              }
              className="mono w-24 border rule bg-surface px-2 py-1 text-t0"
            />
            <span className="stamp opacity-resting">{BASIS_LABEL[basis]}</span>
          </label>
          {line.cartons > 0 && (
            <p className="mono text-[12px] opacity-resting">
              → {fmtInt(line.cartons)} cajas · {fmtM2(line.m2)} m² · {fmtInt(line.kg)} kg
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/** Tri-state box. Achromatic: state is form and value, never hue. */
function TriBox({
  state,
  label,
  onChange,
}: {
  state: 'none' | 'partial' | 'all'
  label: string
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === 'all' ? true : state === 'partial' ? 'mixed' : false}
      aria-label={label}
      onClick={onChange}
      className="ml-1 grid h-6 w-6 shrink-0 place-items-center border border-ink/40"
    >
      {state === 'all' && (
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6.4 L4.8 9.2 L10 3" />
        </svg>
      )}
      {state === 'partial' && <span className="h-[3px] w-3 bg-ink" />}
    </button>
  )
}
