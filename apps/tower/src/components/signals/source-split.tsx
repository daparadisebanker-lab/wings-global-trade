'use client'

// src/components/signals/source-split.tsx
// COMPONENT_TREE §4 <SourceSplit> — origination: Mister vs form vs WhatsApp.
// Three slices, so one chart (DESIGN_SYSTEM "if a chart needs a legend of more
// than 4 items, it is two charts"). Recharts bars in tokens only — lane accent
// + radar green + muted ink; alarm red is reserved for true failures, never
// spent on a category (the "no third accent" refusal).
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip } from 'recharts'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { SourceSlice } from '@/lib/actions/signals'
import { formatInt } from './format'

const AXIS_TICK = { fill: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--type-label)' } as const

// Token colours by source key — amber/green carry it, ink-secondary is neutral.
const FILL_BY_KEY: Record<string, string> = {
  mister: 'var(--lane-accent)',
  form: 'var(--positive)',
  whatsapp: 'var(--ink-secondary)',
}

export function SourceSplit({
  slices,
  locale = DEFAULT_LOCALE,
}: {
  slices: SourceSlice[]
  locale?: Locale
}) {
  const data = slices.map((s) => ({ key: s.key, name: t(s.label, locale), count: s.count }))
  return (
    <section aria-label={t({ es: 'Origen de las solicitudes', en: 'Origination split' }, locale)}>
      <h2 className="mb-3 font-mono text-label uppercase tracking-[0.15em] text-ink-secondary">
        {t({ es: 'Origen', en: 'Source split' }, locale)}
      </h2>
      <div className="border border-line bg-surface-1 p-4">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" tick={AXIS_TICK} stroke="var(--line)" />
              <YAxis tick={AXIS_TICK} stroke="var(--line)" allowDecimals={false} width={40} />
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
                formatter={(value: number) => [formatInt(value, locale), t({ es: 'Solicitudes', en: 'Requests' }, locale)]}
              />
              <Bar dataKey="count" isAnimationActive={false}>
                {data.map((d) => (
                  <Cell key={d.key} fill={FILL_BY_KEY[d.key] ?? 'var(--ink-secondary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
