// src/components/signals/product-leaderboard.tsx
// COMPONENT_TREE §4 <ProductLeaderboard> — a ManifestTable of the top products
// by views, with spec opens, RFQ lines and a view-velocity delta. Server
// component; dense, mono numerals, rules-not-shadows (DESIGN_SYSTEM density).
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'
import type { LeaderboardRow } from '@/lib/actions/signals'
import { formatInt, formatDelta } from './format'

const COLS: { key: string; label: Localized; numeric?: boolean }[] = [
  { key: 'product', label: { es: 'Producto', en: 'Product' } },
  { key: 'views', label: { es: 'Vistas', en: 'Views' }, numeric: true },
  { key: 'specs', label: { es: 'Fichas', en: 'Specs' }, numeric: true },
  { key: 'rfqs', label: { es: 'RFQ', en: 'RFQs' }, numeric: true },
  { key: 'velocity', label: { es: 'Δ Velocidad', en: 'Velocity Δ' }, numeric: true },
]

export function ProductLeaderboard({
  rows,
  locale = DEFAULT_LOCALE,
}: {
  rows: LeaderboardRow[]
  locale?: Locale
}) {
  return (
    <section aria-label={t({ es: 'Ranking de productos', en: 'Product leaderboard' }, locale)}>
      <h2 className="mb-3 font-mono text-label uppercase tracking-[0.15em] text-ink-secondary">
        {t({ es: 'Ranking de productos', en: 'Product leaderboard' }, locale)}
      </h2>
      <div className="overflow-x-auto border border-line">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-surface-1">
              {COLS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`px-3 py-2 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary ${
                    c.numeric ? 'text-right' : 'text-left'
                  }`}
                >
                  {t(c.label, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
                  {t({ es: 'Sin datos en el periodo.', en: 'No data in this window.' }, locale)}
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const velClass =
                  r.velocityDelta > 0 ? 'text-positive' : r.velocityDelta < 0 ? 'text-negative' : 'text-ink-secondary'
                return (
                  <tr key={r.productSlug} className="h-row border-b border-line last:border-b-0">
                    <td className="px-3 py-2 font-mono text-t0 text-ink-primary">{r.productSlug}</td>
                    <td className="px-3 py-2 text-right font-mono text-t0 text-ink-primary" data-numeric>
                      {formatInt(r.views, locale)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-t0 text-ink-primary" data-numeric>
                      {formatInt(r.specOpens, locale)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-t0 text-ink-primary" data-numeric>
                      {formatInt(r.rfqs, locale)}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono text-t0 ${velClass}`} data-numeric>
                      {formatDelta(r.velocityDelta, locale)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
