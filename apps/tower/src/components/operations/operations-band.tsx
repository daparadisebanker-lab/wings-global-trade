import Link from 'next/link'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'
import type { ModuleId } from '@/lib/nav'
import type { OperationsSnapshot } from '@/lib/actions/operations'

// The operations cockpit band — one asymmetric HERO + satellite tiles, each a
// drill-link into its owning module (every metric has an owner and an action).
// Depth law: elevation/premium ground on the hero moment only; satellites are
// flat/ruled. Numerals tabular (font-mono + data-numeric). No deltas — these are
// point-in-time counts, and there is no honest baseline to diff against.

interface OpsTile {
  key: string
  value: number | null
  label: Localized
  tag: string
  module: ModuleId
  href: string
}

// null (a failed count) renders as an em dash, never a false 0.
function fmt(value: number | null, locale: Locale): string {
  return value === null ? '—' : new Intl.NumberFormat(locale === 'es' ? 'es-PE' : 'en-US').format(value)
}

export function OperationsBand({
  snapshot,
  visible,
  locale = DEFAULT_LOCALE,
}: {
  snapshot: OperationsSnapshot
  visible: Set<ModuleId>
  locale?: Locale
}) {
  // Priority order — the hero is the first tile the operator can actually see
  // (per-role fallback: a lane-only op with containers hidden gets the next one).
  const tiles: OpsTile[] = [
    { key: 'containersInTransit', value: snapshot.containersInTransit, label: { es: 'Contenedores en tránsito', en: 'Containers in transit' }, tag: 'CTN', module: 'containers', href: '/containers' },
    { key: 'quotesAwaiting', value: snapshot.quotesAwaiting, label: { es: 'Cotizaciones por responder', en: 'Quotes awaiting reply' }, tag: 'COT', module: 'quotations', href: '/quotations' },
    { key: 'rfqsTotal', value: snapshot.rfqsTotal, label: { es: 'RFQs (total)', en: 'RFQs (total)' }, tag: 'PIP', module: 'pipeline', href: '/pipeline' },
    { key: 'containersFilling', value: snapshot.containersFilling, label: { es: 'Contenedores en llenado', en: 'Containers filling' }, tag: 'CTN', module: 'containers', href: '/containers' },
    { key: 'triageBacklog', value: snapshot.triageBacklog, label: { es: 'Triage pendiente', en: 'Triage backlog' }, tag: 'INT', module: 'intelligence', href: '/intelligence/revision' },
    { key: 'productsPublished', value: snapshot.productsPublished, label: { es: 'Productos publicados', en: 'Products published' }, tag: 'CAT', module: 'catalog', href: '/catalog' },
    { key: 'clientsTotal', value: snapshot.clientsTotal, label: { es: 'Clientes', en: 'Clients' }, tag: 'CLI', module: 'clients', href: '/clients' },
    { key: 'rbContainersInTransit', value: snapshot.rbContainersInTransit, label: { es: 'RB en tránsito', en: 'RB in transit' }, tag: 'MRC', module: 'marcas', href: '/marcas' },
    { key: 'rbReservationsLive', value: snapshot.rbReservationsLive, label: { es: 'Reservas RB activas', en: 'RB reservations live' }, tag: 'MRC', module: 'marcas', href: '/marcas' },
    { key: 'rbBrandsLive', value: snapshot.rbBrandsLive, label: { es: 'Marcas activas', en: 'Brands live' }, tag: 'MRC', module: 'marcas', href: '/marcas' },
  ]

  const eligible = tiles.filter((tile) => visible.has(tile.module))

  if (eligible.length === 0) {
    // Wholly-empty deck: a laid-out note, never a spinner or a wall of zeros.
    return (
      <p className="rounded-card border border-line bg-surface-1 p-4 font-ui text-t0 text-ink-secondary">
        {t({ es: 'Sin operaciones visibles para tu rol. Pide acceso a un administrador.', en: 'No operations visible for your role. Ask an administrator for access.' }, locale)}
      </p>
    )
  }

  const [hero, ...satellites] = eligible

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
      <Link
        href={hero.href}
        className="tower-tile flex flex-col justify-between gap-4 rounded-card p-5 transition-colors sm:col-span-2 lg:col-span-2 lg:row-span-2"
      >
        <span className="tile-k font-mono text-label uppercase tracking-[0.12em]">{t(hero.label, locale)}</span>
        <span
          className="tile-v font-mono text-t5 leading-none"
          data-numeric
          aria-label={hero.value === null ? t({ es: 'no disponible', en: 'unavailable' }, locale) : undefined}
        >
          {fmt(hero.value, locale)}
        </span>
      </Link>
      {satellites.map((tile) => (
        <Link
          key={tile.key}
          href={tile.href}
          className="flex flex-col justify-between gap-2 rounded-card border border-line bg-surface-1 p-4 transition-colors hover:border-gold"
        >
          <span className="tile-k font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">{t(tile.label, locale)}</span>
          <span
            className="font-mono text-t4 leading-none text-ink-primary"
            data-numeric
            aria-label={tile.value === null ? t({ es: 'no disponible', en: 'unavailable' }, locale) : undefined}
          >
            {fmt(tile.value, locale)}
          </span>
        </Link>
      ))}
    </div>
  )
}
