'use client'

// QC checkpoint tracker with evidence — COMPONENT_TREE §3 <QcTracker>,
// scoped to whichever PO POPanel has selected. Evidence upload itself is out
// of scope this wave (components/containers/README.md) — the evidence field
// takes an already-known storage path string.
import { useState, useTransition } from 'react'
import { recordQC } from '@/lib/actions/containers'
import { QC_RESULTS, type QcResult } from '@/lib/actions/containers-types'
import { useQcChecksQuery } from './useQcChecksQuery'

const RESULT_STYLE: Record<QcResult, string> = {
  PASS: 'text-positive',
  FAIL: 'text-negative',
  CONDITIONAL: 'text-accent',
}

export function QcTracker({ purchaseOrderId, canWrite }: { purchaseOrderId: string | null; canWrite: boolean }) {
  const query = useQcChecksQuery(purchaseOrderId)
  const [checkpoint, setCheckpoint] = useState('')
  const [result, setResult] = useState<QcResult>('PASS')
  const [evidencePath, setEvidencePath] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!purchaseOrderId) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">QC</h2>
        <p className="font-ui text-t0 text-ink-secondary">
          Selecciona una orden de compra para ver sus checkpoints / Select a purchase order to see its checkpoints
        </p>
      </div>
    )
  }

  function submit() {
    setError(null)
    if (!checkpoint.trim()) {
      setError('Checkpoint requerido / Checkpoint required')
      return
    }
    startTransition(async () => {
      const result_ = await recordQC(purchaseOrderId as string, {
        checkpoint: checkpoint.trim(),
        result,
        evidence: evidencePath ? [evidencePath] : [],
      })
      if (result_.error) {
        setError(`${result_.error.code}: ${result_.error.message}`)
        return
      }
      setCheckpoint('')
      setEvidencePath('')
      await query.refetch()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">QC</h2>

      {canWrite ? (
        <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-1 p-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Checkpoint</span>
            <input
              value={checkpoint}
              onChange={(e) => setCheckpoint(e.target.value)}
              className="w-56 rounded-card border border-line bg-surface-0 px-3 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Resultado / Result</span>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as QcResult)}
              className="rounded-card border border-line bg-surface-0 px-3 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            >
              {QC_RESULTS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Evidencia (ruta, opcional) / Evidence (path, optional)
            </span>
            <input
              value={evidencePath}
              onChange={(e) => setEvidencePath(e.target.value)}
              className="w-56 rounded-card border border-line bg-surface-0 px-3 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            />
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="rounded-card bg-accent px-4 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            {isPending ? 'Registrando… / Recording…' : 'Registrar / Record'}
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {(query.data ?? []).map((check) => (
          <div key={check.id} className="flex items-center justify-between rounded-card border border-line p-3">
            <span className="font-ui text-t0 text-ink-primary">{check.checkpoint}</span>
            <span
              className={`font-mono text-label uppercase tracking-[0.08em] ${
                check.result ? RESULT_STYLE[check.result] : 'text-ink-secondary'
              }`}
            >
              {check.result ?? 'PENDIENTE / PENDING'}
            </span>
          </div>
        ))}
        {!query.isLoading && (query.data ?? []).length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">Sin checkpoints / No checkpoints yet</p>
        ) : null}
      </div>
    </div>
  )
}
