// src/components/signals/lane-pulse.tsx
// COMPONENT_TREE §4 <LanePulse> — the headline row: views · spec opens · Mister
// starts · RFQs · handoffs, current window vs the previous. Server component
// (no interactivity). Status/delta read WITHOUT relying on colour (a +/− glyph
// carries the sign; colour only reinforces it), per DESIGN_SYSTEM accessibility.
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { PulseMetric } from '@/lib/actions/signals'
import { formatInt, formatDelta } from './format'

export function LanePulse({
  metrics,
  windowDays,
  locale = DEFAULT_LOCALE,
}: {
  metrics: PulseMetric[]
  windowDays: number
  locale?: Locale
}) {
  return (
    <section aria-label={t({ es: 'Pulso del lane', en: 'Lane pulse' }, locale)}>
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="font-mono text-label uppercase tracking-[0.15em] text-ink-secondary">
          {t({ es: 'Pulso', en: 'Pulse' }, locale)}
        </h2>
        <span className="font-mono text-label uppercase tracking-[0.15em] text-ink-secondary" data-numeric>
          {t({ es: `Últimos ${windowDays} d vs previo`, en: `Last ${windowDays} d vs prev` }, locale)}
        </span>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => {
          const deltaClass = m.delta > 0 ? 'tile-up' : m.delta < 0 ? 'tile-dn' : 'tile-flat'
          return (
            <div key={m.key} className="tower-tile flex flex-col gap-2 rounded-card p-4">
              <span className="tile-k font-mono text-label uppercase tracking-[0.12em]">
                {t(m.label, locale)}
              </span>
              <span className="tile-v font-mono text-t4 leading-none" data-numeric>
                {formatInt(m.current, locale)}
              </span>
              <span className={`font-mono text-t0 ${deltaClass}`} data-numeric>
                {formatDelta(m.delta, locale)}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
