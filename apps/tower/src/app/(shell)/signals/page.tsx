import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { LanePulse, FunnelChart, ProductLeaderboard, FillWatch, SourceSplit } from '@/components/signals'
import { getSignalDeck } from '@/lib/actions/signals'
import { DEFAULT_LOCALE, t } from '@/lib/i18n'

// Signal Deck (analytics) — Wave 4. Reads ONLY the rollup matview, lane-scoped
// (getSignalDeck resolves the caller's lanes from memberships, then queries
// tower.metric_rollups_daily via the service role — never raw events, and the
// matview is never exposed to `authenticated`). Server-rendered; lane filtering
// is a navigation (?lane=), matching the Container Desk pattern.
export const dynamic = 'force-dynamic'

const TAG = 'SIG · Signal Deck'
const TITLE = { es: 'Señales', en: 'Signals' }

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ lane?: string; days?: string }>
}) {
  const params = await searchParams
  const days = params.days ? Number(params.days) : undefined
  const result = await getSignalDeck({ laneSlug: params.lane, days })
  const locale = DEFAULT_LOCALE

  if (!result.ok) {
    const copy =
      result.reason === 'NO_LANES'
        ? {
            es: 'No tienes lanes asignadas todavía. Pide a un administrador que te asigne una.',
            en: 'You have no lanes assigned yet. Ask an admin to assign you one.',
          }
        : {
            es: 'No se pudieron cargar las señales. Intenta de nuevo.',
            en: 'Could not load signals. Please try again.',
          }
    return <EmptyState tag={TAG} title={TITLE} description={copy} />
  }

  const { deck, lanes } = result
  const activeLane = deck.laneSlugs.length === 1 ? deck.laneSlugs[0] : null

  return (
    <div className="flex flex-col gap-8 p-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
              {TAG}
            </span>
            <h1 className="font-ui text-t3 text-ink-primary">{t(TITLE, locale)}</h1>
          </div>
          {deck.isGroupAdmin ? (
            <Link
              href="/signals/group"
              className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary underline-offset-4 hover:text-lane-accent hover:underline"
            >
              {t({ es: 'Vista de grupo →', en: 'Group view →' }, locale)}
            </Link>
          ) : null}
        </div>

        {/* Lane filter — only when the caller has more than one lane. */}
        {lanes.length > 1 ? (
          <nav aria-label={t({ es: 'Filtrar por lane', en: 'Filter by lane' }, locale)} className="flex flex-wrap gap-2">
            <LaneChip href="/signals" label={{ es: 'Todas', en: 'All' }} active={activeLane === null} />
            {lanes.map((l) => (
              <LaneChip
                key={l.slug}
                href={`/signals?lane=${l.slug}`}
                label={{ es: l.name, en: l.name }}
                active={activeLane === l.slug}
              />
            ))}
          </nav>
        ) : null}
      </header>

      <LanePulse metrics={deck.pulse} windowDays={deck.windowDays} locale={locale} />

      <div className="grid gap-8 lg:grid-cols-2">
        <FunnelChart steps={deck.funnel} locale={locale} />
        <SourceSplit slices={deck.sourceSplit} locale={locale} />
      </div>

      <ProductLeaderboard rows={deck.leaderboard} locale={locale} />
      <FillWatch rows={deck.fillWatch} locale={locale} />

      {/* <WeeklyBrief> (★ Intelligence-written digest) is owned by the
          Intelligence surface (Wave 4/5) and mounts here once available. */}
    </div>
  )
}

function LaneChip({
  href,
  label,
  active,
}: {
  href: string
  label: { es: string; en: string }
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={`border px-3 py-1 font-mono text-label uppercase tracking-[0.1em] ${
        active
          ? 'border-lane-accent text-lane-accent'
          : 'border-line text-ink-secondary hover:border-ink-secondary hover:text-ink-primary'
      }`}
    >
      {t(label, DEFAULT_LOCALE)}
    </Link>
  )
}
