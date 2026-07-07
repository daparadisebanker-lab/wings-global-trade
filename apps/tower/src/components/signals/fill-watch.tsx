// src/components/signals/fill-watch.tsx
// COMPONENT_TREE §4 <FillWatch> — public fill-meter engagement: FillMeter
// interaction volume per lane. (Fill PROGRESS lives in Container Desk data; this
// panel reports the interaction signal from rollups. When a container-fill join
// is wired at the page level it renders alongside — flagged, not faked.)
// Server component; horizontal bars sized off the max, mono numerals.
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { FillWatchRow } from '@/lib/actions/signals'
import { formatInt } from './format'

export function FillWatch({
  rows,
  locale = DEFAULT_LOCALE,
}: {
  rows: FillWatchRow[]
  locale?: Locale
}) {
  const max = rows.reduce((m, r) => Math.max(m, r.interactions), 0)
  return (
    <section aria-label={t({ es: 'Interacción con fill-meters', en: 'Fill-meter watch' }, locale)}>
      <h2 className="mb-3 font-mono text-label uppercase tracking-[0.15em] text-ink-secondary">
        {t({ es: 'FillMeter · interacción', en: 'FillMeter · engagement' }, locale)}
      </h2>
      <div className="border border-line bg-surface-1 p-4">
        {rows.length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">
            {t({ es: 'Sin interacciones en el periodo.', en: 'No interactions in this window.' }, locale)}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((r) => {
              const pct = max > 0 ? Math.round((r.interactions / max) * 100) : 0
              return (
                <li key={r.laneSlug} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-t0 uppercase tracking-[0.08em] text-ink-primary">{r.laneSlug}</span>
                    <span className="font-mono text-label text-ink-secondary" data-numeric>
                      {formatInt(r.interactions, locale)} · {formatInt(r.sessions, locale)}{' '}
                      {t({ es: 'sesiones', en: 'sessions' }, locale)}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-line">
                    <div
                      className="h-1 bg-lane-accent"
                      style={{ width: `${pct}%` }}
                      role="meter"
                      aria-valuenow={r.interactions}
                      aria-valuemin={0}
                      aria-valuemax={max}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
