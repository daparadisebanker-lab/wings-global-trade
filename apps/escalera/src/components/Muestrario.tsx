'use client'

// La Escalera · Rung 2 (the record) + Rung 3 (the arithmetic).
//
// "THE ONE THING lives here: a buyer who leaves with a record has been served."
// The record is the product. Everything on this screen either feeds it or is
// cut. Rung 3 does not add a screen — it grows this one a column of inputs and
// a set of totals the supplier can price without asking a single question.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Reorder } from 'framer-motion'
import { ContainerFillBar } from '@/components/ContainerFillBar'
import { RecordRow } from '@/components/RecordRow'
import { UndoToast } from '@/components/Deck'
import { fmtInt, fmtKg, fmtM2, type ContainerKind } from '@/lib/packing'
import { buildQuote, ASSUMED_PALLET_NOTE } from '@/lib/quote'
import { useRecord, type RecordEntry } from '@/lib/record'
import { quoteMessage, whatsappHref } from '@/lib/whatsapp'
import type { Tile } from '@/types/tile'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function Total({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-l-2 border-line/25 pl-3">
      <p className="stamp text-sheet-ink-dim">{label}</p>
      <p className="tabular font-mono text-t3 leading-tight text-sheet-ink">{value}</p>
      {hint && <p className="stamp mt-0.5 text-sheet-ink-dim">{hint}</p>}
    </div>
  )
}

export function Muestrario({ tiles }: { tiles: Tile[] }) {
  const rec = useRecord()
  const [kind, setKind] = useState<ContainerKind>('20GP')
  const [exporting, setExporting] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const tilesById = useMemo(() => new Map(tiles.map((t) => [t.id, t])), [tiles])
  const quote = useMemo(
    () => ({ ...buildQuote(rec.state.entries, tilesById, kind), buyer: rec.state.buyer }),
    [rec.state.entries, rec.state.buyer, tilesById, kind],
  )

  const pending = rec.state.entries.filter((e) => !e.checked)
  const done = rec.state.entries.filter((e) => e.checked)
  const lineFor = (e: RecordEntry) => quote.lines.find((l) => l.entry.tileId === e.tileId)

  if (!rec.hydrated) {
    return <div className="min-h-dvh bg-sheet-0" aria-busy="true" />
  }

  return (
    <div className="min-h-dvh bg-sheet-0 pb-32">
      <header className="sticky top-0 z-20 border-b border-line/20 bg-sheet-0/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <p className="stamp text-sheet-ink-dim">El Muestrario</p>
            <h1 className="text-t2 text-sheet-ink">
              {rec.state.entries.length}{' '}
              {rec.state.entries.length === 1 ? 'pieza' : 'piezas'}
            </h1>
          </div>
          <Link
            href="/"
            className="stamp rounded-pill border border-line/30 px-4 py-2 text-sheet-ink no-underline"
          >
            Volver al mazo
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {rec.degraded && (
          <p className="mb-5 rounded-control border border-caution/40 bg-caution/10 px-4 py-3 text-t0 text-sheet-ink">
            Este navegador bloquea el almacenamiento local. El muestrario funciona en esta
            sesión, pero no podemos garantizar que sobreviva al cierre de la pestaña — exporta
            antes de salir.
          </p>
        )}

        {rec.state.entries.length === 0 ? (
          <div className="rounded-panel border border-line/25 bg-sheet-1 px-6 py-14 text-center">
            <p className="stamp text-sheet-ink-dim">Muestrario vacío</p>
            <p className="mx-auto mt-3 max-w-sm text-t1 text-sheet-ink">
              Desliza a la derecha en el mazo para guardar una pieza. Lo que guardes queda en
              este teléfono, sin cuenta y sin conexión.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-control bg-accent px-6 py-3 text-t1 text-accent-ink no-underline"
            >
              Abrir el mazo
            </Link>
          </div>
        ) : (
          <>
            {/* ── pending ─────────────────────────────────────────────── */}
            <Reorder.Group
              axis="y"
              values={pending}
              onReorder={(next) => rec.reorder([...next, ...done])}
              className="space-y-3"
            >
              {pending.map((entry) => {
                const line = lineFor(entry)
                const tile = tilesById.get(entry.tileId)
                if (!line || !tile) return null
                return <RecordRow key={entry.tileId} line={line} entry={entry} tile={tile} />
              })}
            </Reorder.Group>

            {/* ── decided, floated to their own section ───────────────── */}
            {done.length > 0 && (
              <>
                <h2 className="stamp mb-3 mt-8 text-sheet-ink-dim">
                  Decididas · {done.length}
                </h2>
                <Reorder.Group
                  axis="y"
                  values={done}
                  onReorder={(next) => rec.reorder([...pending, ...next])}
                  className="space-y-3"
                >
                  {done.map((entry) => {
                    const line = lineFor(entry)
                    const tile = tilesById.get(entry.tileId)
                    if (!line || !tile) return null
                    return <RecordRow key={entry.tileId} line={line} entry={entry} tile={tile} />
                  })}
                </Reorder.Group>
              </>
            )}

            {/* ── totals ──────────────────────────────────────────────── */}
            <section className="mt-8 rounded-panel border border-line/25 bg-sheet-1 p-5">
              <h2 className="stamp mb-4 text-sheet-ink-dim">Totales del pedido</h2>
              {quote.pricedLines.length === 0 ? (
                <p className="text-t1 text-sheet-ink-dim">
                  Escribe los m² de al menos una pieza y aquí aparecen cajas, kilos y pallets.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                  <Total label="Cajas" value={fmtInt(quote.totals.cartons)} />
                  <Total label="Superficie" value={fmtM2(quote.totals.suppliedM2)} hint="m² surtidos" />
                  <Total label="Peso bruto" value={fmtKg(quote.totals.kg)} hint="kg" />
                  <Total
                    label="Pallets"
                    value={fmtInt(quote.totals.pallets)}
                    hint={quote.hasAssumedPacking ? 'supuesto' : undefined}
                  />
                </div>
              )}
            </section>

            {quote.pricedLines.length > 0 && (
              <div className="mt-4">
                <ContainerFillBar fill={quote.fill} kind={kind} onKind={setKind} />
              </div>
            )}

            {quote.hasAssumedPacking && quote.pricedLines.length > 0 && (
              <p className="mt-4 text-t0 leading-snug text-sheet-ink-dim">{ASSUMED_PALLET_NOTE}</p>
            )}

            {/* ── who is asking ───────────────────────────────────────── */}
            <section className="mt-8 rounded-panel border border-line/25 bg-sheet-1 p-5">
              <h2 className="stamp mb-4 text-sheet-ink-dim">Datos para la cotización</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ['name', 'Nombre'],
                    ['company', 'Empresa'],
                    ['project', 'Proyecto'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    <span className="stamp block text-sheet-ink-dim">{label}</span>
                    <input
                      type="text"
                      value={rec.state.buyer[key]}
                      onChange={(e) => rec.setBuyer({ [key]: e.target.value })}
                      className="mt-1 w-full rounded-control border border-line/30 bg-sheet-0 px-3 py-2 text-t1 text-sheet-ink"
                    />
                  </label>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ── the exports: the record leaves the phone ─────────────────── */}
      {rec.state.entries.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/20 bg-sheet-0/95 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            {pdfError && <p className="text-t0 text-negative">{pdfError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={exporting}
                onClick={async () => {
                  setPdfError(null)
                  setExporting(true)
                  try {
                    const { downloadQuotePdf } = await import('@/lib/pdf')
                    await downloadQuotePdf(quote, today())
                  } catch {
                    setPdfError('No se pudo generar el PDF. Intenta de nuevo.')
                  } finally {
                    setExporting(false)
                  }
                }}
                className="flex-1 rounded-control border border-line/40 py-4 text-t1 text-sheet-ink disabled:opacity-50"
              >
                {exporting ? 'Generando…' : 'Descargar PDF'}
              </button>
              <a
                href={whatsappHref(quoteMessage(quote, today()))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-control bg-accent py-4 text-center text-t1 font-medium text-accent-ink no-underline"
              >
                Enviar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <UndoToast />
    </div>
  )
}
