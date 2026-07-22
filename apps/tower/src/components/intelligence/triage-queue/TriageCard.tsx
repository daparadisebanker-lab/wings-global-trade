'use client'

// One triage proposal (COMPONENT_TREE §5 <TriageQueue> row): the AI's proposed
// lane / archetype / stage / account for an inbound RFQ, with its confidence and
// a drafted reply, plus explicit Approve / Reject. Core law: Intelligence
// proposes, the human disposes — nothing commits except through the (RLS-scoped)
// approve/reject actions the parent wires in. Renders one tower.ai_drafts row of
// kind TRIAGE (AiDraftRecord<'TRIAGE'>).
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'
import { getArchetypeConfig } from '@/lib/archetypes'
import type { AiDraftRecord } from '@/lib/ai'
import { ConfidenceMeter } from '../confidence-meter'

function formatDate(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'es' ? 'es-PE' : 'en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

const EMPTY: Localized = { es: '—', en: '—' }

function ProposalRow({ label, value, locale }: { label: Localized; value: string | null; locale: Locale }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line px-3 py-2 last:border-b-0">
      <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-secondary">{t(label, locale)}</span>
      <span className="font-mono text-t0 text-ink-primary" data-numeric>
        {value || t(EMPTY, locale)}
      </span>
    </div>
  )
}

export function TriageCard({
  draft,
  busy = false,
  locale = DEFAULT_LOCALE,
  onApprove,
  onReject,
}: {
  draft: AiDraftRecord<'TRIAGE'>
  busy?: boolean
  locale?: Locale
  onApprove: (draftId: string) => void
  onReject: (draftId: string) => void
}) {
  const p = draft.payload
  const archetypeLabel = p.proposedArchetype ? t(getArchetypeConfig(p.proposedArchetype).label, locale) : null

  return (
    <article className="flex flex-col gap-3 rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-1">
      <header className="flex items-start justify-between gap-4">
        <span className="font-mono text-label text-ink-secondary" data-numeric>
          {formatDate(draft.createdAt, locale)}
        </span>
        <ConfidenceMeter value={draft.confidence} locale={locale} className="w-40" />
      </header>

      <div className="rounded-card border border-line bg-surface-0">
        <ProposalRow label={{ es: 'Lane', en: 'Lane' }} value={p.proposedLaneCode} locale={locale} />
        <ProposalRow label={{ es: 'Arquetipo', en: 'Archetype' }} value={archetypeLabel} locale={locale} />
        <ProposalRow label={{ es: 'Etapa', en: 'Stage' }} value={p.proposedStage} locale={locale} />
        <ProposalRow label={{ es: 'Cuenta', en: 'Account' }} value={p.accountId} locale={locale} />
      </div>

      {p.draftReply ? (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            {t({ es: 'Respuesta propuesta', en: 'Drafted reply' }, locale)}
          </span>
          <p className="rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 leading-relaxed text-ink-secondary">
            {t(p.draftReply, locale)}
          </p>
        </div>
      ) : null}

      {p.rationale ? <p className="px-1 font-ui text-label text-ink-secondary">{p.rationale}</p> : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onApprove(draft.id)}
          className="rounded-card bg-positive px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          {t({ es: 'Aprobar', en: 'Approve' }, locale)}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onReject(draft.id)}
          className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-negative outline-none focus-visible:border-negative disabled:opacity-40"
        >
          {t({ es: 'Rechazar', en: 'Reject' }, locale)}
        </button>
      </div>
    </article>
  )
}
