'use client'

// One RFQ card on the PipelineBoard (COMPONENT_TREE §2 <RFQCard>): account ·
// source icon (Mister/WA/form) · currency · a keyboard-reachable stage select
// (no drag-and-drop dependency is available in this workspace — a native
// <select> is fully keyboard/screen-reader accessible and satisfies
// DESIGN_SYSTEM "Full keyboard: every board and table navigable").
import Link from 'next/link'
import { getStages, type Archetype } from '@/lib/archetypes'
import type { RfqRow } from '@/lib/actions/pipeline'

const SOURCE_LABEL: Record<RfqRow['source'], string> = {
  MISTER: 'MISTER',
  RFQ_FORM: 'RFQ',
  WHATSAPP: 'WA',
  MANUAL: 'MANUAL',
  ADVISOR: 'ADVISOR',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return iso
  }
}

export function RfqCard({
  rfq,
  archetype,
  canAdvanceStage,
  busy = false,
  onStageChange,
}: {
  rfq: RfqRow
  archetype: Archetype
  canAdvanceStage: boolean
  busy?: boolean
  onStageChange?: (stage: string) => void
}) {
  const stages = getStages(archetype)

  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-surface-1 p-3">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/pipeline/${rfq.id}`}
          className="font-ui text-t0 text-ink-primary underline-offset-2 hover:text-lane-accent hover:underline"
        >
          {rfq.accountName ?? 'Sin cuenta / No account'}
        </Link>
        <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
          {SOURCE_LABEL[rfq.source]}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary" data-numeric>
          {rfq.currency}
        </span>
        <span className="font-mono text-label text-ink-secondary" data-numeric>
          {formatDate(rfq.createdAt)}
        </span>
      </div>

      {canAdvanceStage ? (
        <label className="flex flex-col gap-1">
          <span className="sr-only">Etapa / Stage</span>
          <select
            value={rfq.stage}
            disabled={busy}
            onChange={(e) => onStageChange?.(e.target.value)}
            className="w-full rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-label uppercase tracking-[0.06em] text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-40"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label.es}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  )
}
