import Link from 'next/link'
import { LanePulse, FunnelChart, ProductLeaderboard, FillWatch, SourceSplit } from '@/components/signals'
import { OperationsBand, QuickActions, SignalsFeed } from '@/components/operations'
import { getSignalDeck } from '@/lib/actions/signals'
import { getOperationsSnapshot } from '@/lib/actions/operations'
import { getLaneMemberships, getIsGroupAdmin, getHasRbMembership } from '@/lib/lanes/memberships'
import { visibleModules, type Role } from '@/lib/rbac'
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
  const locale = DEFAULT_LOCALE

  // The Signal Deck is now the post-login home, so it must render for EVERY
  // identity — never hard-fail when the lane-scoped analytics deck has no lanes.
  // Fetch the rbac set + the exact operations snapshot alongside the (optional)
  // analytics deck, all in one wave.
  const [memberships, isGroupAdmin, hasRbMembership, deckResult, ops] = await Promise.all([
    getLaneMemberships(),
    getIsGroupAdmin(),
    getHasRbMembership(),
    getSignalDeck({ laneSlug: params.lane, days }),
    getOperationsSnapshot({ includeRb: true }),
  ])
  const visible = visibleModules(memberships.map((m) => m.role) as Role[], isGroupAdmin, hasRbMembership)

  const lanes = deckResult.ok ? deckResult.lanes : []
  const activeLane = deckResult.ok && deckResult.deck.laneSlugs.length === 1 ? deckResult.deck.laneSlugs[0] : null

  return (
    <div className="flex flex-col gap-8 p-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
              {TAG}
            </span>
            <h1 className="font-display text-t3 text-ink-primary">{t(TITLE, locale)}</h1>
          </div>
          {isGroupAdmin ? (
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

      {/* Operations cockpit — exact point-in-time state, the home's reason to exist.
          Renders for every identity; each tile gates on the operator's visible
          modules and drill-links into its owner. */}
      <QuickActions visible={visible} isGroupAdmin={isGroupAdmin} locale={locale} />
      {ops.ok ? <OperationsBand snapshot={ops.snapshot} visible={visible} locale={locale} /> : null}
      {isGroupAdmin ? <SignalsFeed locale={locale} /> : null}

      {/* Analytics (matview funnel) — renders only when the lane-scoped deck loads;
          an operator with no lanes still gets the operations cockpit above. */}
      {deckResult.ok ? (
        <>
          <LanePulse metrics={deckResult.deck.pulse} windowDays={deckResult.deck.windowDays} locale={locale} />
          <div className="grid gap-8 lg:grid-cols-2">
            <FunnelChart steps={deckResult.deck.funnel} locale={locale} />
            <SourceSplit slices={deckResult.deck.sourceSplit} locale={locale} />
          </div>
          <ProductLeaderboard rows={deckResult.deck.leaderboard} locale={locale} />
          <FillWatch rows={deckResult.deck.fillWatch} locale={locale} />
        </>
      ) : (
        <p className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {deckResult.reason === 'NO_LANES'
            ? t({ es: 'La analítica aparece cuando tengas una lane asignada.', en: 'Analytics appear once you have a lane assigned.' }, locale)
            : t({ es: 'No se pudo cargar la analítica.', en: 'Could not load analytics.' }, locale)}
        </p>
      )}
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
