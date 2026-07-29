'use client'

// El Pasillo · §4.7 — the muestrario. Two row types, because a booth is a series.
//
// A series row is a folder: tri-state checkbox, the series' own thumbnail, and
// "22 SKUs · 6 elegidos". A SKU row is a leaf, indented, carrying the code in
// pas-mono and its coverage. 64px rows, hairline between, zero radius, no cards —
// REF-A's pas-rule: structure does a card's work for one pixel.
//
// Checked items float to their own section under a pas-mono eyebrow, because the
// buyer's shortlist is the thing they came back for. Order is theirs: long-press
// a series row and drag it. Their logic outranks ours.

import Link from 'next/link'
import { LaneExit } from '@/pasillo/components/PasilloShell'
import { PASILLO_ROUTES } from '@/pasillo/lib/routes'
import { useCallback, useMemo, useRef, useState } from 'react'
import { VolumeFooter } from '@/pasillo/components/VolumeFooter'
import { StatusLamp } from '@/pasillo/components/StatusLamp'
import { finishLabel, getSeries, seriesName, skusOf } from '@/pasillo/lib/catalogue'
import {
  BASIS_LABEL,
  containerFill,
  fmtInt,
  fmtM2,
  lineTotals,
  sumTotals,
  type ContainerKind,
} from '@/pasillo/lib/packing'
import { haptic, useRecord, type Folder } from '@/pasillo/lib/record'
import type { Sku } from '@/pasillo/types/catalogue'

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

  if (!rec.hydrated) return <div className="min-h-dvh bg-pas-surface" aria-busy="true" />

  const folders = rec.state.folders
  const anySelected = folders.some((f) => f.selected.length > 0)

  return (
    <div className="flex min-h-dvh flex-col bg-pas-surface">
      <header className="border-b pas-rule px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-4">
          <div>
            <LaneExit />
            <h1 className="font-pas-display text-pas-t2 font-semibold tracking-pas-display">
              {/* "series" is invariant in Spanish, so the count alone read as
                  the English word. The participle is what makes it Spanish —
                  and it agrees, so it has to be part of the same branch. */}
              {folders.length} {folders.length === 1 ? 'serie guardada' : 'series guardadas'}
            </h1>
          </div>
          {/* "Al recorrido", not "Al catálogo": Catálogo in the global nav is
              the machinery catalogue, and one word naming two trees is how a
              buyer ends up in the wrong one. */}
          <Link
            href={PASILLO_ROUTES.lane}
            className="pas-stamp rounded-pas-chrome border border-pas-ink/25 px-4 py-2"
          >
            Al recorrido
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-pas-5">
        {rec.degraded && (
          <p className="mb-4 border pas-rule px-3 py-2 text-pas-t0 opacity-pas-resting">
            Este navegador bloquea el almacenamiento local. El muestrario se perderá al cerrar
            esta pestaña — envía la solicitud desde la mesa de comercio antes de salir.
          </p>
        )}

        {folders.length === 0 ? (
          <div className="border pas-rule px-pas-6 py-16 text-center">
            <p className="pas-stamp opacity-pas-resting">Muestrario vacío</p>
            <p className="mx-auto mt-3 max-w-sm text-pas-t1">
              Aún no hay series guardadas. En el recorrido, desliza una serie a la derecha y
              llega aquí con todos sus diseños marcados.
            </p>
            <Link
              href={PASILLO_ROUTES.lane}
              className="mt-pas-6 inline-block bg-pas-ink px-pas-6 py-3 text-pas-t0 text-pas-surface"
            >
              Abrir el recorrido
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
          <div className="border-t pas-rule bg-pas-surface px-4 py-3">
            <div className="mx-auto flex max-w-3xl gap-3">
              <Link
                href={PASILLO_ROUTES.mesa}
                className="flex-1 rounded-pas-chrome border border-pas-ink/30 py-3 text-center text-pas-t0"
              >
                Preparar la cotización
              </Link>
            </div>
          </div>
        </div>
      )}

      {rec.undo && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-3xl items-center
                     justify-between gap-4 rounded-pas-chrome bg-pas-ink px-pas-5 py-3 text-pas-surface"
        >
          <span className="text-pas-t0">
            <span className="pas-mono">{rec.undo.label}</span> fuera del muestrario
          </span>
          <button type="button" onClick={rec.runUndo} className="pas-stamp underline">
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
  // The chosen faces, in catalogue order — the strip below the row.
  const chosen = skus.filter((s) => folder.selected.includes(s.sku_uid))

  return (
    <div data-folder={folder.series_uid} className={dragging ? 'opacity-pas-resting' : undefined}>
      <div className="flex h-pas-row items-center gap-3 border-b pas-rule">
        <TriBox
          state={tri}
          label={`Seleccionar ${seriesName(series)}`}
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
            {/* No longer truncated. The Spanish names are short enough to fit,
                and "Flat And Matt…" told a buyer nothing about a series they
                were being asked to price. */}
            <span className="block text-pas-t0">{seriesName(series)}</span>
            <span className="block truncate text-pas-micro opacity-pas-resting">
              {series.format_mm[0]}×{series.format_mm[1]} · {fmtM2(series.m2_per_ctn)} m²/caja
            </span>
          </span>
          {/* One line, not two. "6 SKU" above "6 elegidos" made the buyer read
              two numbers and work out the relationship; the relationship IS
              the information. */}
          <span className="pas-mono shrink-0 text-right text-pas-micro">
            {folder.selected.length} de {skus.length}
            <span className="block opacity-pas-resting">elegidos</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleOpen}
          aria-label={expanded ? `Contraer ${seriesName(series)}` : `Expandir ${seriesName(series)}`}
          aria-expanded={expanded}
          className="grid h-11 w-11 shrink-0 place-items-center opacity-pas-resting"
        >
          {/* A drawn chevron, not the glyph "▸". The character rendered at the
              body size in whatever the font had, sat off the optical centre,
              and read as punctuation rather than a control. */}
          <svg
            viewBox="0 0 12 12"
            className={`h-3.5 w-3.5 transition-transform duration-pas-light ${
              expanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4.5 2 L8.5 6 L4.5 10" />
          </svg>
        </button>
      </div>

      {/* THE MUESTRARIO IS A SAMPLE BOARD.
          Collapsed, each series showed one cover thumbnail and two counts — a
          list of filenames for a decision made entirely on colour. The faces
          the buyer actually chose are the record; show them. Scrolls sideways
          when a series carries more than fits, and disappears once the folder
          is open, where every face is already on screen at full size. */}
      {!expanded && folder.selected.length > 0 && (
        <div
          className="flex gap-1 overflow-x-auto border-b pas-rule px-3 pb-3 pl-11
                     [mask-image:linear-gradient(90deg,#000_calc(100%-24px),transparent)]"
        >
          {chosen.map((sku) => (
            <button
              key={sku.sku_uid}
              type="button"
              onClick={() => onOpenSku(sku)}
              aria-label={`Ver ${sku.code}`}
              className="h-pas-8 w-pas-8 shrink-0 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sku.thumb}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {expanded && (
        <div className="pl-4">
          {skus.map((sku) => (
            <SkuRow key={sku.sku_uid} sku={sku} onOpen={() => onOpenSku(sku)} />
          ))}
          <div className="flex h-pas-row items-center gap-3 border-b pas-rule pl-4">
            <button
              type="button"
              onClick={() => rec.removeSeries(folder.series_uid, seriesName(series))}
              className="pas-stamp opacity-pas-resting underline"
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
    <div className="border-b pas-rule">
      <div className="flex h-pas-row items-center gap-3">
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
            {/* The code never truncates — it is what gets pasted into
                WhatsApp. The finish line below it may. */}
            <span className="pas-mono block whitespace-nowrap text-pas-dense">{sku.code}</span>
            <span className="block truncate text-pas-label opacity-pas-resting">{finishLabel(sku)}</span>
          </span>
        </button>
        <span className="pas-mono shrink-0 text-right text-pas-micro opacity-pas-resting">
          {line.cartons > 0 ? `${fmtInt(line.cartons)} cajas` : `${fmtM2(series.m2_per_ctn)} m²`}
        </span>
        <StatusLamp status={series.status} />
      </div>

      {selected && (
        // Column, not row: squeezed to the right of the input this wrapped to
        // three ragged lines at 390px and stole the width that was truncating
        // the code above it. One line, one reading direction.
        <div className="flex flex-col gap-2 pb-3 pl-11">
          <label className="flex items-center gap-2">
            <span className="pas-stamp opacity-pas-resting">Cantidad</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={qty?.value ?? ''}
              placeholder="0"
              // The visible label reads "Cantidad" on every row, so on its own
              // it names nothing — a screen reader lands on the fourth of them
              // with no idea which reference it is editing.
              aria-label={`Cantidad para ${sku.code} en ${BASIS_LABEL[basis]}`}
              onChange={(e) =>
                rec.setQty(
                  sku.sku_uid,
                  e.target.value === ''
                    ? null
                    : { value: Math.max(0, Number(e.target.value)), basis },
                )
              }
              className="pas-mono h-11 w-24 border pas-rule bg-pas-surface px-2 text-pas-t0"
            />
            <span className="pas-stamp opacity-pas-resting">{BASIS_LABEL[basis]}</span>
          </label>
          {line.cartons > 0 && (
            <p className="pas-mono text-pas-micro opacity-pas-resting">
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
      className="ml-1 grid h-pas-6 w-pas-6 shrink-0 place-items-center border border-pas-ink/40"
    >
      {state === 'all' && (
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6.4 L4.8 9.2 L10 3" />
        </svg>
      )}
      {state === 'partial' && <span className="h-[3px] w-3 bg-pas-ink" />}
    </button>
  )
}
