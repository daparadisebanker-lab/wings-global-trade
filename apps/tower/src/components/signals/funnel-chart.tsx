'use client'

// src/components/signals/funnel-chart.tsx
// COMPONENT_TREE §4 <FunnelChart> — view → spec → Mister → RFQ, with the
// conversion at each edge (DESIGN_SYSTEM "Funnel edges annotated with conversion
// %"). Recharts, restyled to the control-room: single thin series in the active
// lane accent, no gradient, mono numerals, --line grid. Client component
// (Recharts renders to SVG in the browser).
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { FunnelStep } from '@/lib/actions/signals'
import { formatInt, formatBpsPercent } from './format'

const AXIS_TICK = { fill: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--type-label)' } as const

export function FunnelChart({
  steps,
  locale = DEFAULT_LOCALE,
}: {
  steps: FunnelStep[]
  locale?: Locale
}) {
  const data = steps.map((s) => ({ name: t(s.label, locale), count: s.count }))
  return (
    <section aria-label={t({ es: 'Embudo de conversión', en: 'Conversion funnel' }, locale)}>
      <h2 className="mb-3 font-mono text-label uppercase tracking-[0.15em] text-ink-secondary">
        {t({ es: 'Embudo', en: 'Funnel' }, locale)}
      </h2>
      <div className="border border-line bg-surface-1 p-4">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid horizontal={false} stroke="var(--line)" />
              <XAxis type="number" tick={AXIS_TICK} stroke="var(--line)" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={96} tick={AXIS_TICK} stroke="var(--line)" />
              <Tooltip
                cursor={{ fill: 'var(--surface-0)' }}
                contentStyle={{
                  background: 'var(--surface-0)',
                  border: '1px solid var(--line)',
                  borderRadius: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--type-label)',
                  color: 'var(--ink-primary)',
                }}
                formatter={(value: number) => [formatInt(value, locale), t({ es: 'Eventos', en: 'Events' }, locale)]}
              />
              <Bar dataKey="count" fill="var(--lane-accent)" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {steps.slice(1).map((s) => (
            <li key={s.key} className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              {t(s.label, locale)}:{' '}
              <span className="text-lane-accent" data-numeric>
                {formatBpsPercent(s.conversionBps)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
