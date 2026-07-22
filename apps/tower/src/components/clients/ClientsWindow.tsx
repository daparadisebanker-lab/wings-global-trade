import { t, type Locale } from '@/lib/i18n'
import type { ClientListItem } from '@/lib/actions/clients-logic'
import { NewClient } from './NewClient'

// The Clients window — the per-lane clients database. A standalone list of every
// account the caller can see, joined to its brand. Read-only surface (2A);
// create/edit + Mister create-client wiring land in 2B. Clients are created today
// through Mister's save-draft (Slice 1C) and land here.

const TAG = 'CLI · Clientes'
const TITLE = { es: 'Clientes', en: 'Clients' }

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-middle ${className}`}>{children}</td>
}

export function ClientsWindow({ items, locale }: { items: ClientListItem[]; locale: Locale }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {TAG}
        </span>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-h2 font-semibold">{t(TITLE, locale)}</h1>
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {items.length}
          </span>
        </div>
        <p className="max-w-prose text-body-sm text-ink-secondary">
          {t(
            {
              es: 'Los clientes de tus marcas. Créalos aquí o al cotizar con Mister; viven en un solo lugar.',
              en: 'Your brands’ clients. Create them here or while quoting with Mister; they live in one place.',
            },
            locale,
          )}
        </p>
        <div className="mt-2">
          <NewClient locale={locale} />
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-card border border-hairline bg-surface-1 p-8 text-center text-body-sm text-ink-secondary">
          {t(
            {
              es: 'Todavía no hay clientes. Crea el primero al armar una cotización con Mister.',
              en: 'No clients yet. Create the first one while building a quote with Mister.',
            },
            locale,
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-hairline">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-hairline text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                <Cell>{t({ es: 'Cliente', en: 'Client' }, locale)}</Cell>
                <Cell>{t({ es: 'Marca', en: 'Brand' }, locale)}</Cell>
                <Cell>{t({ es: 'País / Región', en: 'Country / Region' }, locale)}</Cell>
                <Cell className="text-right">{t({ es: 'Score', en: 'Score' }, locale)}</Cell>
                <Cell className="text-right">{t({ es: 'Alta', en: 'Added' }, locale)}</Cell>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-hairline last:border-0 hover:bg-surface-2">
                  <Cell className="font-medium text-ink-primary">{c.name}</Cell>
                  <Cell className="font-mono text-ink-secondary">{c.brandName ?? '—'}</Cell>
                  <Cell className="text-ink-secondary">
                    {[c.country, c.region].filter(Boolean).join(' · ') || '—'}
                  </Cell>
                  <Cell className="text-right font-mono tabular-nums" data-numeric>
                    {c.score}
                  </Cell>
                  <Cell className="text-right font-mono text-ink-secondary tabular-nums" data-numeric>
                    {c.createdAt.slice(0, 10)}
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
