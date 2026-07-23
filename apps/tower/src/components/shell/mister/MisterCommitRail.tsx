'use client'

// MisterCommitRail — the commit / redirect zone (Phase E, right column). Mister
// is the AI-native front-end; the modules are the systems of record. Two tabs:
//   · Redirigir — given the artifact on the canvas, the module(s) where it becomes
//     a durable record (keyed to the SELECTED artifact, so flipping the canvas
//     switcher retargets the hand-off).
//   · Revisión — the Intelligence review queue, inlined (slice 2): triage + spec
//     extraction, AI-proposes/human-disposes, with a live pending count. This is
//     the Intelligence module, folded into Mister.
import { useState } from 'react'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import { useMister } from './MisterProvider'
import { handoffsFor, artifactLabel } from './handoffs'
import { useSpecReview, useTriageReview } from './review-queries'
import { MisterReviewList } from './MisterReviewList'

type RailTab = 'handoff' | 'review'

export function MisterCommitRail({ active }: { active: boolean }) {
  const { locale, selectedArtifact } = useMister()
  const [tab, setTab] = useState<RailTab>('handoff')

  // Read the queues for the live badge (shared cache with the review list + the
  // full workspace, so this triggers no extra fetch). Gated on `active` so a
  // closed cockpit never fetches AI drafts in the background.
  const triage = useTriageReview(active)
  const spec = useSpecReview(active)
  const pending = (triage.data?.length ?? 0) + (spec.data?.length ?? 0)

  const renderer = selectedArtifact?.renderer ?? null
  const links = handoffsFor(renderer)

  return (
    <div className="ck-rail-scroll">
      <div className="ck-rail-tabs" role="tablist" aria-label={t({ es: 'Registrar', en: 'Commit' }, locale)}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'handoff'}
          className={tab === 'handoff' ? 'ck-rail-tab is-active' : 'ck-rail-tab'}
          onClick={() => setTab('handoff')}
        >
          {t({ es: 'Redirigir', en: 'Hand-off' }, locale)}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'review'}
          className={tab === 'review' ? 'ck-rail-tab is-active' : 'ck-rail-tab'}
          onClick={() => setTab('review')}
        >
          {t({ es: 'Revisión', en: 'Review' }, locale)}
          {pending > 0 ? (
            <span className="ck-badge" data-numeric>
              {pending}
            </span>
          ) : null}
        </button>
      </div>

      {tab === 'handoff' ? (
        <section className="ck-rail-sec">
          <p className="ck-rail-lead">
            {renderer
              ? t({ es: 'Lleva este artefacto al sistema de registro.', en: 'Take this artifact to its system of record.' }, locale)
              : t({ es: 'Mister compone; los módulos registran.', en: 'Mister composes; the modules record.' }, locale)}
          </p>
          {renderer ? <span className="ck-rail-tag">{t(artifactLabel(renderer), locale)}</span> : null}
          <div className="ck-rail-links">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="ck-rail-link">
                {t(l.label, locale)}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <MisterReviewList active={active} locale={locale} />
      )}
    </div>
  )
}
