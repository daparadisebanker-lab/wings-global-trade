'use client'

// MisterReviewList — the Intelligence review queue, inlined into the cockpit's
// commit rail (Phase E slice 2) and rendered World-B navy-native. It reuses the
// review DATA LAYER (the same server actions + query keys as the light
// /intelligence/revision workspace) but NOT the light card components — dropping
// ink-on-surface ERP cards into the navy rail would look broken. Same law holds:
// the AI proposes, the human disposes; nothing commits except through the
// (RLS-scoped) approve/reject actions. The full two-column review lives one link
// away for when the operator wants room.
import { useState } from 'react'
import Link from 'next/link'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { getArchetypeConfig } from '@/lib/archetypes'
import { approveSpecExtract, approveTriage, rejectDraft } from '@/lib/actions/intelligence'
import type { AiDraftRecord } from '@/lib/ai'
import { useSpecReview, useTriageReview } from './review-queries'

function confPct(v: number): string {
  return `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%`
}
function docName(path: string): string {
  const base = path.split('/').pop() ?? path
  return base.length > 26 ? `${base.slice(0, 24)}…` : base
}

function ReviewCard({
  id,
  title,
  sub,
  confidence,
  acting,
  onApprove,
  onReject,
  locale,
}: {
  id: string
  title: string
  sub: string
  confidence: number
  acting: boolean
  onApprove: () => void
  onReject: () => void
  locale: Locale
}) {
  return (
    <article className="ck-rev-card">
      <div className="ck-rev-top">
        <span className="ck-rev-title">{title}</span>
        <span className="ck-rev-conf-n" data-numeric>
          {confPct(confidence)}
        </span>
      </div>
      <span className="ck-rev-sub">{sub}</span>
      <div className="ck-conf" aria-hidden>
        <span style={{ width: confPct(confidence) }} />
      </div>
      <div className="ck-rev-actions">
        <button type="button" className="ck-rev-approve" disabled={acting} onClick={onApprove}>
          {t({ es: 'Aprobar', en: 'Approve' }, locale)}
        </button>
        <button type="button" className="ck-rev-reject" disabled={acting} onClick={onReject}>
          {t({ es: 'Rechazar', en: 'Reject' }, locale)}
        </button>
      </div>
    </article>
  )
}

export function MisterReviewList({ active, locale = DEFAULT_LOCALE }: { active: boolean; locale?: Locale }) {
  const triage = useTriageReview(active)
  const spec = useSpecReview(active)
  const [actingId, setActingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(fn: () => Promise<{ error?: { message: string } | null }>, id: string, after: () => void) {
    setError(null)
    setActingId(id)
    try {
      const res = await fn()
      if (res.error) setError(res.error.message)
      else after()
    } finally {
      setActingId(null)
    }
  }

  const triageDrafts = triage.data ?? []
  const specDrafts = spec.data ?? []
  const loading = (triage.isLoading || spec.isLoading) && active
  const failed = triage.error || spec.error
  const total = triageDrafts.length + specDrafts.length

  return (
    <div className="ck-rev">
      {error ? (
        <p role="alert" className="ck-rev-err">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="ck-rev-note">{t({ es: 'Cargando cola…', en: 'Loading queue…' }, locale)}</p>
      ) : failed ? (
        <p role="alert" className="ck-rev-err">
          {t({ es: 'No se pudo cargar la cola.', en: 'Could not load the queue.' }, locale)}
        </p>
      ) : total === 0 ? (
        <p className="ck-rev-note">{t({ es: 'Cola vacía — nada por revisar.', en: 'Queue empty — nothing to review.' }, locale)}</p>
      ) : (
        <>
          {triageDrafts.length > 0 ? (
            <section className="ck-rev-group">
              <span className="ck-rev-group-h">{t({ es: 'Triage', en: 'Triage' }, locale)}</span>
              {triageDrafts.map((d: AiDraftRecord<'TRIAGE'>) => (
                <ReviewCard
                  key={d.id}
                  id={d.id}
                  title={d.payload.proposedLaneCode || t({ es: 'RFQ entrante', en: 'Inbound RFQ' }, locale)}
                  sub={`${t(getArchetypeConfig(d.payload.proposedArchetype).label, locale)} · ${d.payload.proposedStage}`}
                  confidence={d.confidence}
                  acting={actingId === d.id}
                  onApprove={() => run(() => approveTriage(d.id), d.id, () => triage.refetch())}
                  onReject={() => run(() => rejectDraft(d.id), d.id, () => triage.refetch())}
                  locale={locale}
                />
              ))}
            </section>
          ) : null}

          {specDrafts.length > 0 ? (
            <section className="ck-rev-group">
              <span className="ck-rev-group-h">{t({ es: 'Extracción de specs', en: 'Spec extraction' }, locale)}</span>
              {specDrafts.map((d: AiDraftRecord<'SPEC_EXTRACT'>) => (
                <ReviewCard
                  key={d.id}
                  id={d.id}
                  title={t(d.payload.name, locale)}
                  sub={`${d.payload.archetype} · ${docName(d.payload.sourcePath)}`}
                  confidence={d.confidence}
                  acting={actingId === d.id}
                  onApprove={() => run(() => approveSpecExtract(d.id), d.id, () => spec.refetch())}
                  onReject={() => run(() => rejectDraft(d.id), d.id, () => spec.refetch())}
                  locale={locale}
                />
              ))}
            </section>
          ) : null}
        </>
      )}

      <Link href="/intelligence/revision" className="ck-rail-link">
        {t({ es: 'Ver cola completa', en: 'Open full queue' }, locale)}
        <span aria-hidden>→</span>
      </Link>
    </div>
  )
}
