'use client'

// La Escalera · Rungs 2 + 3 — one row of the muestrario.
//
// Rung 2 anatomy: thumbnail · name · format · finish · status · checkbox, plus a
// note and a drag handle. Rung 3 grows the same row an m² input, a waste
// selector and a room label — and shows what those round up to in cartons,
// kilos and pallets. The outputs sit on the row itself: the buyer should never
// have to trust a total they cannot see derived.

import { Reorder, useDragControls } from 'framer-motion'
import { fmtInt, fmtKg, fmtM2, WASTE_PRESETS } from '@/lib/packing'
import { useRecord, type RecordEntry } from '@/lib/record'
import { specStatus } from '@/components/TileCard'
import { formatChip, type Tile } from '@/types/tile'
import type { QuoteLine } from '@/lib/quote'

function Out({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div>
      <p className="stamp text-sheet-ink-dim">{label}</p>
      <p className={`tabular font-mono text-t1 ${dim ? 'text-sheet-ink-dim' : 'text-sheet-ink'}`}>
        {value}
      </p>
    </div>
  )
}

export function RecordRow({ line, entry, tile }: { line: QuoteLine; entry: RecordEntry; tile: Tile }) {
  const rec = useRecord()
  const controls = useDragControls()
  const status = specStatus(tile)
  const t = line.totals

  return (
    <Reorder.Item
      value={entry}
      dragListener={false}
      dragControls={controls}
      className={`rounded-panel border bg-sheet-1 ${
        entry.checked ? 'border-line/15 opacity-70' : 'border-line/25'
      }`}
    >
      <div className="flex gap-4 p-4">
        {/* thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tile.thumb}
          alt=""
          className="h-20 w-20 flex-none rounded-control object-cover"
          loading="lazy"
          decoding="async"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="tabular truncate font-mono text-t1 text-sheet-ink">{tile.code}</p>
              <p className="mt-0.5 truncate text-t0 text-sheet-ink-dim">
                {formatChip(tile)} mm · {tile.finish}
              </p>
              <p className="mt-1 flex items-center gap-2">
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-pill ${
                    status.tone === 'ready' ? 'bg-positive' : 'bg-caution'
                  }`}
                />
                <span className="stamp text-sheet-ink-dim">{status.label}</span>
              </p>
            </div>

            {/* checkbox — checked items float to their own section */}
            <label className="flex flex-none cursor-pointer items-center gap-2">
              <span className="sr-only">Marcar {tile.code} como decidido</span>
              <input
                type="checkbox"
                checked={entry.checked}
                onChange={(e) => rec.patch(entry.tileId, { checked: e.target.checked })}
                className="h-5 w-5 accent-[rgb(var(--accent))]"
              />
            </label>

            {/* drag handle — pointer-driven, so it never fights the page scroll */}
            <button
              type="button"
              aria-label={`Reordenar ${tile.code}`}
              onPointerDown={(e) => controls.start(e)}
              className="flex-none cursor-grab touch-none px-1 text-sheet-ink-dim active:cursor-grabbing"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="currentColor">
                <circle cx="6" cy="4" r="1.4" />
                <circle cx="10" cy="4" r="1.4" />
                <circle cx="6" cy="8" r="1.4" />
                <circle cx="10" cy="8" r="1.4" />
                <circle cx="6" cy="12" r="1.4" />
                <circle cx="10" cy="12" r="1.4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Rung 3: the inputs ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 border-t border-line/15 px-4 py-4 sm:grid-cols-4">
        <label className="col-span-1">
          <span className="stamp block text-sheet-ink-dim">Área m²</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={entry.areaM2 ?? ''}
            placeholder="0"
            onChange={(e) => {
              const v = e.target.value
              rec.patch(entry.tileId, { areaM2: v === '' ? null : Math.max(0, Number(v)) })
            }}
            className="tabular mt-1 w-full rounded-control border border-line/30 bg-sheet-0 px-3 py-2 font-mono text-t1 text-sheet-ink"
          />
        </label>

        <label className="col-span-1">
          <span className="stamp block text-sheet-ink-dim">Desperdicio</span>
          <select
            value={
              WASTE_PRESETS.some((w) => w.pct === entry.wastePct) ? String(entry.wastePct) : 'custom'
            }
            onChange={(e) => {
              if (e.target.value === 'custom') return
              rec.patch(entry.tileId, { wastePct: Number(e.target.value) })
            }}
            className="mt-1 w-full rounded-control border border-line/30 bg-sheet-0 px-3 py-2 text-t1 text-sheet-ink"
          >
            {WASTE_PRESETS.map((w) => (
              <option key={w.id} value={w.pct}>
                {w.detail}
              </option>
            ))}
            <option value="custom">Otro: {entry.wastePct}%</option>
          </select>
        </label>

        <label className="col-span-2">
          <span className="stamp block text-sheet-ink-dim">Ambiente</span>
          <input
            type="text"
            value={entry.room}
            placeholder="Baño 2"
            onChange={(e) => rec.patch(entry.tileId, { room: e.target.value })}
            className="mt-1 w-full rounded-control border border-line/30 bg-sheet-0 px-3 py-2 text-t1 text-sheet-ink"
          />
        </label>
      </div>

      {/* ── Rung 3: what that actually costs in cartons ───────────────── */}
      {line.priced && (
        <div className="grid grid-cols-2 gap-4 border-t border-line/15 bg-sheet-0 px-4 py-4 sm:grid-cols-4">
          <Out label="Cajas" value={fmtInt(t.cartons)} />
          <Out label="m² surtidos" value={fmtM2(t.suppliedM2)} />
          <Out label="Peso" value={`${fmtKg(t.kg)} kg`} />
          <Out label="Pallets" value={fmtInt(t.pallets)} dim />
          <p className="col-span-2 text-t0 text-sheet-ink-dim sm:col-span-4">
            {fmtM2(t.requestedM2)} m² + {entry.wastePct}% = {fmtM2(t.withWasteM2)} m² →{' '}
            {fmtInt(t.cartons)} cajas de {fmtM2(tile.packing.m2_per_carton)} m² (se redondea
            hacia arriba; sobran {fmtM2(t.surplusM2)} m²)
          </p>
        </div>
      )}

      {/* ── note + remove ─────────────────────────────────────────────── */}
      <div className="flex items-end gap-3 border-t border-line/15 px-4 py-4">
        <label className="min-w-0 flex-1">
          <span className="stamp block text-sheet-ink-dim">Nota</span>
          <input
            type="text"
            value={entry.note}
            placeholder="Tu criterio manda"
            onChange={(e) => rec.patch(entry.tileId, { note: e.target.value })}
            className="mt-1 w-full rounded-control border border-line/25 bg-sheet-1 px-3 py-2 text-t0 text-sheet-ink"
          />
        </label>
        <button
          type="button"
          onClick={() => rec.remove(entry.tileId, tile.code)}
          className="stamp flex-none rounded-control border border-line/30 px-3 py-2.5 text-sheet-ink-dim"
        >
          Quitar
        </button>
      </div>
    </Reorder.Item>
  )
}
