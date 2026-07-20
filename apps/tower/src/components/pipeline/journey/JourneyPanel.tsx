'use client'

// Operational milestone bar (Quotation Intelligence SPEC §2.4). The rep's
// TOWER-side control for a quote's import journey: commit + digitally sign the
// CIF (opens the journey), then advance each hito phase by phase. Every action
// recomputes the derived phase server-side; this panel just reflects it and
// surfaces the client tracker link. Reveals under a composed quote in the RFQ
// detail.
import { useEffect, useState, useTransition } from 'react'
import {
  getJourneyByQuote,
  openImportJourney,
  recordJourneyMilestone,
  type ImportJourney,
} from '@/lib/actions/journeys'
import { PHASE_LABELS, type PhaseCode } from '@/lib/journeys/phases'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'

// The hitos a rep advances by hand (the status-driven ones flip from the
// underlying order/container automatically; these have no single source).
const OPS_PHASES: PhaseCode[] = ['EN_ORIGEN', 'ASEGURADO', 'BL_LIBERADO', 'ARRIBO', 'ENTREGADO']

export function JourneyPanel({ quoteId }: { quoteId: string }) {
  const [journey, setJourney] = useState<ImportJourney | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let active = true
    getJourneyByQuote(quoteId).then((res) => {
      if (!active) return
      if (res.data !== undefined) setJourney(res.data)
      setLoaded(true)
    })
    return () => {
      active = false
    }
  }, [quoteId])

  function handleOpen() {
    setError(null)
    startTransition(async () => {
      const res = await openImportJourney(quoteId)
      if (res.error) {
        setError(res.error.message)
        return
      }
      setJourney(res.data)
    })
  }

  function handleMilestone(phase: PhaseCode) {
    if (!journey) return
    setError(null)
    startTransition(async () => {
      const res = await recordJourneyMilestone({ journeyId: journey.id, phase })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setJourney(res.data)
    })
  }

  if (!loaded) return null

  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4">
      <div className="flex items-center justify-between">
        <h3 className={LABEL}>Seguimiento de importación</h3>
        {journey ? (
          <span className="font-mono text-label uppercase tracking-[0.1em] text-accent">{PHASE_LABELS[journey.currentPhase].es}</span>
        ) : null}
      </div>

      {!journey ? (
        <button
          type="button"
          onClick={handleOpen}
          disabled={isPending}
          className="w-fit rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          Abrir seguimiento y firmar CIF / Commit + sign
        </button>
      ) : (
        <>
          {/* Client tracker link */}
          {journey.accessToken ? (
            <div className="flex flex-col gap-1">
              <span className={LABEL}>Enlace para el cliente</span>
              <code className="rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary">
                /importacion/{journey.accessToken}
              </code>
            </div>
          ) : null}

          {/* Signature attestation */}
          <p className="font-mono text-label text-ink-secondary">
            CIF firmado por el representante {journey.signatureValid ? '· firma válida ✓' : '· firma sin verificar'}
          </p>

          {/* Milestone bar */}
          <div className="flex flex-wrap items-center gap-2">
            {OPS_PHASES.map((p) => {
              const done = journey.milestones.some((m) => m.phase === p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleMilestone(p)}
                  disabled={isPending}
                  className={`rounded-card border px-2 py-1 font-mono text-label uppercase tracking-[0.08em] disabled:opacity-40 ${
                    done ? 'border-positive text-positive' : 'border-line text-ink-secondary hover:border-lane-accent'
                  }`}
                >
                  {done ? '✓ ' : '+ '}
                  {PHASE_LABELS[p].es}
                </button>
              )
            })}
          </div>

          {/* Dated timeline */}
          {journey.milestones.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {journey.milestones.map((m) => (
                <li key={m.id} className="flex items-baseline justify-between font-mono text-label text-ink-secondary">
                  <span>{PHASE_LABELS[m.phase].es}</span>
                  <span data-numeric>{m.occurredAt.slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}
    </div>
  )
}
