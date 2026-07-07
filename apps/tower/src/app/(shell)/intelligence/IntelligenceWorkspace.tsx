'use client'

// Intelligence module workspace (COMPONENT_TREE §5). Two review surfaces —
// TriageQueue and SpecExtractReview — behind a keyboard-reachable segmented
// switch. Every surface here is a review surface: the AI draft, its confidence,
// the diff, and explicit Approve / Reject. Nothing commits except via the
// W4.B (RLS-scoped) actions. The module itself is ⌘K/NavRail-reachable through
// lib/nav.ts; this switch moves between its two panels.
import { useState } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'
import { TriageQueue } from '@/components/intelligence/triage-queue'
import { SpecExtractReview } from '@/components/intelligence/spec-extract'

type Panel = 'triage' | 'spec-extract'

const PANELS: { id: Panel; tag: string; label: Localized }[] = [
  { id: 'triage', tag: 'TRI', label: { es: 'Triage', en: 'Triage' } },
  { id: 'spec-extract', tag: 'SPX', label: { es: 'Extracción de specs', en: 'Spec extraction' } },
]

export function IntelligenceWorkspace({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const [panel, setPanel] = useState<Panel>('triage')

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-t0 uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          INT · {t({ es: 'Inteligencia', en: 'Intelligence' }, locale)}
        </span>
        <p className="max-w-2xl font-ui text-t0 leading-relaxed text-ink-secondary">
          {t(
            {
              es: 'La IA propone, el humano decide. Cada borrador muestra su confianza y su diferencia contra el registro actual.',
              en: 'Intelligence proposes, humans dispose. Every draft shows its confidence and its diff against the current record.',
            },
            locale,
          )}
        </p>

        <div className="flex flex-wrap gap-2" role="group" aria-label={t({ es: 'Vistas', en: 'Views' }, locale)}>
          {PANELS.map((p) => {
            const active = panel === p.id
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPanel(p.id)}
                className={cn(
                  'flex items-center gap-2 rounded-card border px-3 py-2 font-mono text-label uppercase tracking-[0.1em] outline-none focus-visible:border-lane-accent',
                  active
                    ? 'border-lane-accent bg-surface-1 text-ink-primary'
                    : 'border-line bg-surface-0 text-ink-secondary hover:text-ink-primary',
                )}
              >
                <span aria-hidden className="text-lane-accent">
                  {p.tag}
                </span>
                {t(p.label, locale)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1">
        {panel === 'triage' ? <TriageQueue locale={locale} /> : <SpecExtractReview locale={locale} />}
      </div>
    </div>
  )
}
