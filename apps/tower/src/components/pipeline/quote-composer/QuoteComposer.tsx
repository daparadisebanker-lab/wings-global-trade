'use client'

// Versioned quote composer (COMPONENT_TREE §2 <QuoteComposer>): totals are
// SERVER-computed integer minor units (CLAUDE.md Directive 3 / ARCHITECTURE
// ADR-7) — the numbers rendered here while drafting are a client-side
// preview only (via lib/actions/pipeline-logic#computeQuoteLines/Total, the
// same pure archetype unit math the server uses), never what gets persisted.
// The persisted total always comes back from `composeQuote`'s server response.
import { useMemo, useState, useTransition } from 'react'
import { getUnits, type Archetype } from '@/lib/archetypes'
import { formatMinor } from '@/lib/money'
import { computeQuoteLines, computeQuoteTotal } from '@/lib/actions/pipeline-logic'
import {
  composeQuote,
  convertToOrder,
  markQuoteStatus,
  sendQuote,
  type OrderRow,
  type PipelineCapabilities,
  type QuoteRow,
  type RfqLineRow,
} from '@/lib/actions/pipeline'

interface DraftQuoteLine {
  key: string
  rfqLineId: string | null
  description: string
  unitId: string
  quantity: string
  unitPriceMajor: string
  cbmPerUnit: string
}

function draftsFromRfqLines(lines: RfqLineRow[], fallbackUnit: string): DraftQuoteLine[] {
  if (lines.length === 0) return []
  return lines.map((l) => ({
    key: l.id,
    rfqLineId: l.id,
    description: l.description ?? l.productName?.es ?? 'Línea / Line',
    unitId: l.unit || fallbackUnit,
    quantity: String(l.qty),
    unitPriceMajor: l.targetPriceMinor !== null ? (l.targetPriceMinor / 100).toFixed(2) : '0',
    cbmPerUnit: '',
  }))
}

const QUOTE_STATUS_STYLE: Record<QuoteRow['status'], string> = {
  DRAFT: 'text-ink-secondary',
  SENT: 'text-accent',
  ACCEPTED: 'text-positive',
  REJECTED: 'text-negative',
  EXPIRED: 'text-ink-secondary line-through',
}

export function QuoteComposer({
  rfqId,
  archetype,
  currency,
  rfqLines,
  quotes,
  capabilities,
  hasAccount,
  onQuotesChange,
  onOrderCreated,
}: {
  rfqId: string
  archetype: Archetype
  currency: string
  rfqLines: RfqLineRow[]
  quotes: QuoteRow[]
  capabilities: PipelineCapabilities
  /** Gates convertToOrder: the RFQ must have an account before it can become an order. */
  hasAccount: boolean
  onQuotesChange?: (quotes: QuoteRow[]) => void
  onOrderCreated?: (order: OrderRow) => void
}) {
  const units = getUnits(archetype)
  const [drafts, setDrafts] = useState<DraftQuoteLine[]>(() => draftsFromRfqLines(rfqLines, units[0]?.id ?? ''))
  const [validUntil, setValidUntil] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const latest = quotes[0]

  const preview = useMemo(() => {
    try {
      const computed = computeQuoteLines(
        archetype,
        drafts.map((d) => ({
          rfqLineId: d.rfqLineId,
          description: d.description,
          unitId: d.unitId,
          quantity: Number(d.quantity) || 0,
          unitPriceMinor: Math.round((Number(d.unitPriceMajor) || 0) * 100),
          cbmPerUnit: d.cbmPerUnit.trim() ? Number(d.cbmPerUnit) : undefined,
        })),
      )
      return { lines: computed, total: computeQuoteTotal(computed, currency) }
    } catch {
      return null
    }
  }, [archetype, drafts, currency])

  function updateDraft(key: string, patch: Partial<DraftQuoteLine>) {
    setDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)))
  }

  function resyncFromLines() {
    setDrafts(draftsFromRfqLines(rfqLines, units[0]?.id ?? ''))
  }

  function handleCompose() {
    if (drafts.length === 0) {
      setError('Agrega al menos una línea / Add at least one line')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await composeQuote(
        rfqId,
        drafts.map((d) => ({
          rfqLineId: d.rfqLineId,
          description: d.description,
          unitId: d.unitId,
          quantity: Number(d.quantity) || 0,
          unitPriceMinor: Math.round((Number(d.unitPriceMajor) || 0) * 100),
          cbmPerUnit: d.cbmPerUnit.trim() ? Number(d.cbmPerUnit) : undefined,
        })),
      )
      if (result.error) {
        setError(result.error.message)
        return
      }
      onQuotesChange?.([result.data, ...quotes])
    })
  }

  function handleSend() {
    if (!latest) return
    setError(null)
    startTransition(async () => {
      const result = await sendQuote(latest.id, validUntil || null)
      if (result.error) {
        setError(result.error.message)
        return
      }
      onQuotesChange?.(quotes.map((q) => (q.id === result.data.id ? result.data : q)))
    })
  }

  function handleMarkStatus(status: 'ACCEPTED' | 'REJECTED' | 'EXPIRED') {
    if (!latest) return
    setError(null)
    startTransition(async () => {
      const result = await markQuoteStatus(latest.id, status)
      if (result.error) {
        setError(result.error.message)
        return
      }
      onQuotesChange?.(quotes.map((q) => (q.id === result.data.id ? result.data : q)))
    })
  }

  function handleConvert() {
    if (!latest) return
    setError(null)
    startTransition(async () => {
      const result = await convertToOrder(latest.id)
      if (result.error) {
        setError(result.error.message)
        return
      }
      onOrderCreated?.(result.data)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            Nueva versión / New version
          </h3>
          <button
            type="button"
            onClick={resyncFromLines}
            className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent"
          >
            Recargar líneas del RFQ / Reload from RFQ lines
          </button>
        </div>

        {drafts.map((d) => (
          <div key={d.key} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Descripción / Description</span>
              <input
                value={d.description}
                onChange={(e) => updateDraft(d.key, { description: e.target.value })}
                className="w-52 rounded-card border border-line bg-surface-0 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Cant. / Qty</span>
              <input
                type="number"
                min={0}
                step="any"
                value={d.quantity}
                onChange={(e) => updateDraft(d.key, { quantity: e.target.value })}
                data-numeric
                className="w-24 rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Unidad / Unit</span>
              <select
                value={d.unitId}
                onChange={(e) => updateDraft(d.key, { unitId: e.target.value })}
                className="rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
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
                Precio unitario ({currency}) / Unit price
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={d.unitPriceMajor}
                onChange={(e) => updateDraft(d.key, { unitPriceMajor: e.target.value })}
                data-numeric
                className="w-28 rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
              />
            </label>
          </div>
        ))}

        {preview ? (
          <p className="font-mono text-t1 text-ink-primary" data-numeric>
            Total (vista previa) / Total (preview): {formatMinor(preview.total, currency)}
          </p>
        ) : (
          <p className="font-ui text-t0 text-ink-secondary">
            Revisa unidades y cantidades para ver el total / Check units and quantities to see the total.
          </p>
        )}

        {capabilities.canComposeQuote ? (
          <button
            type="button"
            onClick={handleCompose}
            disabled={isPending}
            className="w-fit rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            Componer cotización / Compose quote
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {quotes.length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">Sin cotizaciones todavía / No quotes yet.</p>
        ) : null}
        {quotes.map((q, i) => (
          <div key={q.id} className="flex flex-col gap-2 rounded-card border border-line bg-surface-1 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-t1 text-ink-primary" data-numeric>
                  v{q.version}
                </span>
                <span className={`font-mono text-label uppercase tracking-[0.1em] ${QUOTE_STATUS_STYLE[q.status]}`}>
                  {q.status}
                </span>
                <span className="font-mono text-t1 text-ink-primary" data-numeric>
                  {formatMinor(q.totalMinor, q.currency)}
                </span>
                {q.validUntil ? (
                  <span className="font-mono text-label text-ink-secondary" data-numeric>
                    válido hasta / valid until {q.validUntil}
                  </span>
                ) : null}
              </div>

              {i === 0 ? (
                <div className="flex items-center gap-2">
                  {capabilities.canSendQuote && q.status === 'DRAFT' ? (
                    <>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className="rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-label text-ink-primary outline-none focus-visible:border-lane-accent"
                      />
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={isPending}
                        className="rounded-card border border-accent px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-accent disabled:opacity-40"
                      >
                        Enviar / Send
                      </button>
                    </>
                  ) : null}

                  {capabilities.canMarkQuoteStatus && q.status === 'SENT' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleMarkStatus('ACCEPTED')}
                        disabled={isPending}
                        className="rounded-card border border-positive px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-positive disabled:opacity-40"
                      >
                        Aceptada / Accepted
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkStatus('REJECTED')}
                        disabled={isPending}
                        className="rounded-card border border-negative px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-negative disabled:opacity-40"
                      >
                        Rechazada / Rejected
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkStatus('EXPIRED')}
                        disabled={isPending}
                        className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary disabled:opacity-40"
                      >
                        Expirada / Expired
                      </button>
                    </>
                  ) : null}

                  {capabilities.canConvertToOrder && q.status === 'ACCEPTED' ? (
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={isPending || !hasAccount}
                      title={hasAccount ? undefined : 'El RFQ necesita una cuenta / RFQ needs an account'}
                      className="rounded-card bg-positive px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
                    >
                      Convertir a pedido / Convert to order
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <ul className="flex flex-col gap-1">
              {q.lines.map((line, idx) => (
                <li key={idx} className="flex items-baseline justify-between font-mono text-t0 text-ink-secondary">
                  <span className="font-ui">{line.description}</span>
                  <span data-numeric>
                    {line.quantity} {line.unitId} · {formatMinor(line.totalMinor, q.currency)}
                    {line.cbm !== undefined ? ` · ${line.cbm.toFixed(2)} CBM` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

