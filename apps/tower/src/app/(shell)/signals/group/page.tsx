import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { LanePulse, FunnelChart, formatInt } from '@/components/signals'
import { getGroupSignalDeck } from '@/lib/actions/signals'
import { DEFAULT_LOCALE, t } from '@/lib/i18n'

// Signal Deck · group cross-lane view (COMPONENT_TREE §4 `/signals/group`).
// Group admin only — `getGroupSignalDeck` gates on the RLS-scoped
// is_group_admin flag; a non-admin gets a FORBIDDEN empty state. Still reads
// ONLY the rollup matview, filtered to every lane.
export const dynamic = 'force-dynamic'

const TAG = 'SIG · Group'
const TITLE = { es: 'Señales · Grupo', en: 'Signals · Group' }

export default async function GroupSignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const params = await searchParams
  const days = params.days ? Number(params.days) : undefined
  const result = await getGroupSignalDeck({ days })
  const locale = DEFAULT_LOCALE

  if (!result.ok) {
    const copy =
      result.reason === 'FORBIDDEN'
        ? {
            es: 'La vista de grupo es solo para administradores del grupo.',
            en: 'The group view is restricted to group admins.',
          }
        : result.reason === 'NO_LANES'
          ? { es: 'No hay lanes registradas todavía.', en: 'No lanes registered yet.' }
          : { es: 'No se pudieron cargar las señales del grupo.', en: 'Could not load group signals.' }
    return <EmptyState tag={TAG} title={TITLE} description={copy} />
  }

  const { deck, breakdown } = result

  return (
    <div className="flex flex-col gap-8 p-6">
      <header className="flex items-baseline justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
            {TAG}
          </span>
          <h1 className="font-display text-t3 text-ink-primary">{t(TITLE, locale)}</h1>
        </div>
        <Link
          href="/signals"
          className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary underline-offset-4 hover:text-lane-accent hover:underline"
        >
          {t({ es: '← Mis lanes', en: '← My lanes' }, locale)}
        </Link>
      </header>

      <LanePulse metrics={deck.pulse} windowDays={deck.windowDays} locale={locale} />

      <div className="grid gap-8 lg:grid-cols-2">
        <FunnelChart steps={deck.funnel} locale={locale} />

        {/* Brand split (Wings vs Áladín) — group-only cohort. */}
        <section aria-label={t({ es: 'Reparto por marca', en: 'Brand split' }, locale)}>
          <h2 className="mb-3 font-mono text-label uppercase tracking-[0.15em] text-ink-secondary">
            {t({ es: 'Reparto por marca', en: 'Brand split' }, locale)}
          </h2>
          <div className="grid grid-cols-2 gap-px border border-line bg-line">
            {breakdown.brandSplit.length === 0 ? (
              <div className="bg-surface-1 p-4 font-ui text-t0 text-ink-secondary">
                {t({ es: 'Sin datos.', en: 'No data.' }, locale)}
              </div>
            ) : (
              breakdown.brandSplit.map((b) => (
                <div key={b.brandSlug} className="flex flex-col gap-2 bg-surface-1 p-4">
                  <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
                    {b.brandSlug}
                  </span>
                  <span className="font-mono text-t4 leading-none text-ink-primary" data-numeric>
                    {formatInt(b.views, locale)}
                  </span>
                  <span className="font-mono text-label text-ink-secondary" data-numeric>
                    {formatInt(b.rfqs, locale)} {t({ es: 'RFQ', en: 'RFQs' }, locale)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Per-lane comparison table. */}
      <section aria-label={t({ es: 'Comparación por lane', en: 'Per-lane comparison' }, locale)}>
        <h2 className="mb-3 font-mono text-label uppercase tracking-[0.15em] text-ink-secondary">
          {t({ es: 'Comparación por lane', en: 'Per-lane comparison' }, locale)}
        </h2>
        <div className="overflow-x-auto border border-line">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface-1">
                <th scope="col" className="px-3 py-2 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
                  {t({ es: 'Lane', en: 'Lane' }, locale)}
                </th>
                <th scope="col" className="px-3 py-2 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
                  {t({ es: 'Marca', en: 'Brand' }, locale)}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
                  {t({ es: 'Vistas', en: 'Views' }, locale)}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
                  {t({ es: 'RFQ', en: 'RFQs' }, locale)}
                </th>
              </tr>
            </thead>
            <tbody>
              {breakdown.perLane.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
                    {t({ es: 'Sin datos en el periodo.', en: 'No data in this window.' }, locale)}
                  </td>
                </tr>
              ) : (
                breakdown.perLane.map((l) => (
                  <tr key={l.laneSlug} className="h-row border-b border-line last:border-b-0">
                    <td className="px-3 py-2 font-mono text-t0 text-ink-primary">{l.laneName}</td>
                    <td className="px-3 py-2 font-mono text-t0 text-ink-secondary">{l.brandSlug}</td>
                    <td className="px-3 py-2 text-right font-mono text-t0 text-ink-primary" data-numeric>
                      {formatInt(l.views, locale)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-t0 text-ink-primary" data-numeric>
                      {formatInt(l.rfqs, locale)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
