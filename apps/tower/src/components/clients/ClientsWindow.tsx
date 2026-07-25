import { t, type Locale } from '@/lib/i18n'
import {
  type ClientListItem,
  sourceLabel,
  stageLabel,
  archetypeLabel,
} from '@/lib/actions/clients-logic'
import { NewClient } from './NewClient'

// The Clients CRM — the per-brand client database over tower.accounts, joined to
// its brand and primary contact. Each record now carries origin, buyer archetype,
// category, demand, pipeline stage, location, owner and score. Read surface +
// create (here or via Mister's save-draft). Stage is shown as a labelled chip
// (readable without colour, per TOWER law).

const TAG = 'CLI · Clientes'
const TITLE = { es: 'Clientes', en: 'Clients' }

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-top ${className}`}>{children}</td>
}

function StageChip({ stage, locale }: { stage: ClientListItem['stage']; locale: Locale }) {
  return (
    <span className="inline-flex items-center rounded-pill border border-line bg-surface-2 px-2 py-0.5 font-mono text-label uppercase tracking-[0.08em] text-ink-primary">
      {stageLabel(stage, locale)}
    </span>
  )
}

function location(c: ClientListItem): string {
  return [c.country, c.region, c.city].filter(Boolean).join(' · ')
}

function perfil(c: ClientListItem, locale: Locale): string {
  return [archetypeLabel(c.archetype, locale), c.category].filter(Boolean).join(' · ')
}

export function ClientsWindow({
  items,
  locale,
  owners = {},
}: {
  items: ClientListItem[]
  locale: Locale
  owners?: Record<string, string>
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {TAG}
        </span>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-t3 text-ink-primary">{t(TITLE, locale)}</h1>
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {items.length}
          </span>
        </div>
        <p className="max-w-prose text-t0 text-ink-secondary">
          {t(
            {
              es: 'Los clientes de tus marcas: origen, qué compran, etapa y contacto. Créalos aquí o al cotizar con Mister; viven en un solo lugar.',
              en: 'Your brands’ clients: origin, what they buy, stage and contact. Create them here or while quoting with Mister; they live in one place.',
            },
            locale,
          )}
        </p>
        <div className="mt-2">
          <NewClient locale={locale} />
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-card border border-line-hairline bg-surface-1 p-8 text-center text-t0 text-ink-secondary">
          {t(
            {
              es: 'Todavía no hay clientes. Crea el primero aquí o al armar una cotización con Mister.',
              en: 'No clients yet. Create the first one here or while building a quote with Mister.',
            },
            locale,
          )}
        </div>
      ) : (
        <>
          {/* Mobile: one card per client. */}
          <ul className="flex flex-col gap-3 md:hidden">
            {items.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 rounded-card border border-line-hairline bg-surface-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium text-ink-primary">{c.name}</span>
                  <StageChip stage={c.stage} locale={locale} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                  <span>{c.brandName ?? '—'}</span>
                  {c.source ? <span>{sourceLabel(c.source, locale)}</span> : null}
                  {perfil(c, locale) ? <span>{perfil(c, locale)}</span> : null}
                </div>
                {location(c) ? <span className="text-t0 text-ink-secondary">{location(c)}</span> : null}
                {c.primaryContact ? (
                  <span className="text-t0 text-ink-secondary">
                    {c.primaryContact.name}
                    {c.primaryContact.whatsapp ? ` · ${c.primaryContact.whatsapp}` : ''}
                  </span>
                ) : null}
                <div className="flex items-center justify-between font-mono text-label text-ink-secondary">
                  <span data-numeric>{c.createdAt.slice(0, 10)}</span>
                  <span data-numeric>score {c.score}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: the table. */}
          <div className="hidden overflow-x-auto rounded-card border border-line-hairline md:block">
            <table className="w-full border-collapse text-t0">
              <thead>
                <tr className="border-b border-line-hairline text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                  <Cell>{t({ es: 'Cliente', en: 'Client' }, locale)}</Cell>
                  <Cell>{t({ es: 'Marca', en: 'Brand' }, locale)}</Cell>
                  <Cell>{t({ es: 'Origen', en: 'Source' }, locale)}</Cell>
                  <Cell>{t({ es: 'Perfil · Categoría', en: 'Profile · Category' }, locale)}</Cell>
                  <Cell>{t({ es: 'Etapa', en: 'Stage' }, locale)}</Cell>
                  <Cell>{t({ es: 'Ubicación', en: 'Location' }, locale)}</Cell>
                  <Cell className="text-right">{t({ es: 'Score', en: 'Score' }, locale)}</Cell>
                  <Cell className="text-right">{t({ es: 'Alta', en: 'Added' }, locale)}</Cell>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => {
                  const ownerName = c.ownerId ? owners[c.ownerId] : null
                  return (
                    <tr key={c.id} className="border-b border-line-hairline last:border-0 hover:bg-surface-2">
                      <Cell className="text-ink-primary">
                        <span className="font-medium">{c.name}</span>
                        {c.primaryContact ? (
                          <span className="mt-0.5 block font-ui text-label text-ink-secondary">
                            {c.primaryContact.name}
                            {c.primaryContact.role ? ` · ${c.primaryContact.role}` : ''}
                            {c.primaryContact.whatsapp ? ` · ${c.primaryContact.whatsapp}` : ''}
                          </span>
                        ) : null}
                        {ownerName ? (
                          <span className="mt-0.5 block font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
                            {t({ es: 'Resp', en: 'Owner' }, locale)}: {ownerName}
                          </span>
                        ) : null}
                      </Cell>
                      <Cell className="font-mono text-ink-secondary">{c.brandName ?? '—'}</Cell>
                      <Cell className="text-ink-secondary">{sourceLabel(c.source, locale) ?? '—'}</Cell>
                      <Cell className="text-ink-secondary">{perfil(c, locale) || '—'}</Cell>
                      <Cell>
                        <StageChip stage={c.stage} locale={locale} />
                      </Cell>
                      <Cell className="text-ink-secondary">{location(c) || '—'}</Cell>
                      <Cell className="text-right font-mono tabular-nums" data-numeric>
                        {c.score}
                      </Cell>
                      <Cell className="text-right font-mono text-ink-secondary tabular-nums" data-numeric>
                        {c.createdAt.slice(0, 10)}
                      </Cell>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
