'use client'

// MisterCommitRail — the commit / redirect zone (Phase E slice 1, right column).
// Mister is the AI-native front-end; the modules are the systems of record. This
// rail is the bridge: given the artifact on the canvas, it offers the module(s)
// where that artifact becomes a durable record ("Redirigir"), and it hosts the
// Intelligence review queue ("Revisión") — the AI-proposes/human-disposes surface
// that the Intelligence module used to be, now folded into Mister. Links are real
// (no fabricated counts); the queue lives one level down at /intelligence/revision
// until slice 2 inlines it here.
import Link from 'next/link'
import { t } from '@/lib/i18n'
import { useMister } from './MisterProvider'
import { handoffsFor, artifactLabel } from './handoffs'

export function MisterCommitRail() {
  const { locale, latestArtifact } = useMister()
  const renderer = latestArtifact?.renderer ?? null
  const links = handoffsFor(renderer)

  return (
    <div className="ck-rail-scroll">
      <section className="ck-rail-sec">
        <span className="ck-rail-eyebrow">{t({ es: 'Redirigir', en: 'Hand-off' }, locale)}</span>
        <p className="ck-rail-lead">
          {renderer
            ? t(
                { es: 'Lleva este artefacto al sistema de registro.', en: 'Take this artifact to its system of record.' },
                locale,
              )
            : t(
                { es: 'Mister compone; los módulos registran.', en: 'Mister composes; the modules record.' },
                locale,
              )}
        </p>
        {renderer ? (
          <span className="ck-rail-tag">{t(artifactLabel(renderer), locale)}</span>
        ) : null}
        <div className="ck-rail-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="ck-rail-link">
              {t(l.label, locale)}
              <span aria-hidden>→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ck-rail-sec">
        <span className="ck-rail-eyebrow">{t({ es: 'Revisión', en: 'Review' }, locale)}</span>
        <p className="ck-rail-lead">
          {t(
            {
              es: 'La IA propone, el humano decide. Cola de triage y extracción de specs.',
              en: 'AI proposes, humans dispose. Triage and spec-extraction queue.',
            },
            locale,
          )}
        </p>
        <div className="ck-rail-links">
          <Link href="/intelligence/revision" className="ck-rail-link">
            {t({ es: 'Abrir cola de revisión', en: 'Open review queue' }, locale)}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
