'use client'

// RFQ line items (COMPONENT_TREE §2 <LineItems>): qty in the lane's unit math,
// target price, optionally linked to a published product. Unit options and
// per-line CBM preview come straight from the lane's archetype
// (`getUnits`/`computeLineExtension`, lib/archetypes) — never a hardcoded
// "per MT" or "per key" (CLAUDE.md Directive 2). Saves via a full-sync
// `upsertLines` call (lib/actions/pipeline.ts).
import { useEffect, useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { computeLineExtension, getUnits, type Archetype } from '@/lib/archetypes'
import { formatMinor } from '@/lib/money'
import { listProducts } from '@/lib/actions/catalog'
import { upsertLines, type RfqLineInput, type RfqLineRow } from '@/lib/actions/pipeline'

interface DraftLine {
  key: string
  id?: string
  productId: string | null
  description: string
  qty: string
  unit: string
  targetPriceMajor: string
  currency: string
}

function toDraft(line: RfqLineRow, fallbackCurrency: string): DraftLine {
  return {
    key: line.id,
    id: line.id,
    productId: line.productId,
    description: line.description ?? '',
    qty: String(line.qty),
    unit: line.unit,
    targetPriceMajor: line.targetPriceMinor !== null ? (line.targetPriceMinor / 100).toFixed(2) : '',
    currency: line.currency || fallbackCurrency,
  }
}

let keySeq = 0
function newDraft(defaultUnit: string, currency: string): DraftLine {
  keySeq += 1
  return {
    key: `new-${keySeq}`,
    productId: null,
    description: '',
    qty: '1',
    unit: defaultUnit,
    targetPriceMajor: '',
    currency,
  }
}

export function LineItems({
  rfqId,
  laneId,
  archetype,
  currency,
  lines,
  canEdit,
  onLinesChange,
}: {
  rfqId: string
  laneId: string
  archetype: Archetype
  currency: string
  lines: RfqLineRow[]
  canEdit: boolean
  onLinesChange?: (lines: RfqLineRow[]) => void
}) {
  const units = getUnits(archetype)
  const [drafts, setDrafts] = useState<DraftLine[]>(() => lines.map((l) => toDraft(l, currency)))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setDrafts(lines.map((l) => toDraft(l, currency)))
    // Only re-sync from the server's line set, not on every local edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines])

  const productsQuery = useQuery({
    queryKey: ['tower', 'pipeline', 'lane-products', laneId],
    queryFn: async () => {
      const result = await listProducts({ laneId, status: 'PUBLISHED', limit: 200 })
      if (result.error) throw new Error(result.error.message)
      return result.data.rows
    },
  })

  function updateDraft(key: string, patch: Partial<DraftLine>) {
    setDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)))
  }

  function addLine() {
    setDrafts((ds) => [...ds, newDraft(units[0]?.id ?? '', currency)])
  }

  function removeLine(key: string) {
    setDrafts((ds) => ds.filter((d) => d.key !== key))
  }

  function preview(d: DraftLine): { totalMinor: number; cbm?: number } | null {
    const qty = Number(d.qty)
    const priceMinor = d.targetPriceMajor.trim() ? Math.round(Number(d.targetPriceMajor) * 100) : 0
    if (!Number.isFinite(qty) || qty <= 0 || !d.unit) return null
    try {
      return computeLineExtension(archetype, { unitId: d.unit, quantity: qty, unitPriceMinor: priceMinor })
    } catch {
      return null
    }
  }

  function handleSave() {
    setError(null)
    const payload: RfqLineInput[] = drafts.map((d) => ({
      id: d.id,
      productId: d.productId,
      description: d.description.trim() ? d.description.trim() : null,
      qty: Number(d.qty) || 0,
      unit: d.unit,
      targetPriceMinor: d.targetPriceMajor.trim() ? Math.round(Number(d.targetPriceMajor) * 100) : null,
      currency: d.currency,
    }))

    startTransition(async () => {
      const result = await upsertLines(rfqId, payload)
      if (result.error) {
        setError(result.error.message)
        return
      }
      onLinesChange?.(result.data)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {drafts.map((d) => {
        const ext = preview(d)
        return (
          <div key={d.key} className="flex flex-wrap items-end gap-2 rounded-card border border-line bg-surface-1 p-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Producto / Product</span>
              <select
                value={d.productId ?? ''}
                disabled={!canEdit}
                onChange={(e) => {
                  const product = (productsQuery.data ?? []).find((p) => p.id === e.target.value)
                  updateDraft(d.key, {
                    productId: e.target.value || null,
                    description: product ? product.name.es : d.description,
                  })
                }}
                className="w-48 rounded-card border border-line bg-surface-0 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
              >
                <option value="">Libre / Free text</option>
                {(productsQuery.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.es}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Descripción / Description</span>
              <input
                value={d.description}
                disabled={!canEdit}
                onChange={(e) => updateDraft(d.key, { description: e.target.value })}
                className="w-56 rounded-card border border-line bg-surface-0 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Cant. / Qty</span>
              <input
                type="number"
                min={0}
                step="any"
                value={d.qty}
                disabled={!canEdit}
                onChange={(e) => updateDraft(d.key, { qty: e.target.value })}
                data-numeric
                className="w-24 rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Unidad / Unit</span>
              <select
                value={d.unit}
                disabled={!canEdit}
                onChange={(e) => updateDraft(d.key, { unit: e.target.value })}
                className="rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.abbr}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                Precio objetivo ({d.currency}) / Target price
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={d.targetPriceMajor}
                disabled={!canEdit}
                onChange={(e) => updateDraft(d.key, { targetPriceMajor: e.target.value })}
                data-numeric
                className="w-28 rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
              />
            </label>

            {ext ? (
              <span className="font-mono text-label text-ink-secondary" data-numeric>
                {formatMinor(ext.totalMinor, d.currency)}
                {ext.cbm !== undefined ? ` · ${ext.cbm.toFixed(2)} CBM` : ''}
              </span>
            ) : null}

            {canEdit ? (
              <button
                type="button"
                onClick={() => removeLine(d.key)}
                className="rounded-card border border-line px-2 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-negative"
              >
                Quitar / Remove
              </button>
            ) : null}
          </div>
        )
      })}

      {drafts.length === 0 ? (
        <p className="font-ui text-t0 text-ink-secondary">Sin líneas todavía / No line items yet.</p>
      ) : null}

      {canEdit ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addLine}
            className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
          >
            + Línea / + Line
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            Guardar líneas / Save lines
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}
    </div>
  )
}
