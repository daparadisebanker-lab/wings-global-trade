import { t, type Locale } from '@/lib/i18n'
import { type ClientListItem, sourceLabel, stageLabel, archetypeLabel } from '@/lib/actions/clients-logic'

// Presentational client list (table on desktop, cards on mobile). Pure — the
// interactive shell (ClientsView) passes items, the owner-name map, and an edit
// handler. Shared chip + label helpers are exported for the board to reuse.

export function StageChip({ stage, locale }: { stage: ClientListItem['stage']; locale: Locale }) {
  return (
    <span className="inline-flex items-center rounded-pill border border-line bg-surface-2 px-2 py-0.5 font-mono text-label uppercase tracking-[0.08em] text-ink-primary">
      {stageLabel(stage, locale)}
    </span>
  )
}

export function locationOf(c: ClientListItem): string {
  return [c.country, c.region, c.city].filter(Boolean).join(' · ')
}

export function perfilOf(c: ClientListItem, locale: Locale): string {
  return [archetypeLabel(c.archetype, locale), c.category].filter(Boolean).join(' · ')
}

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-top ${className}`}>{children}</td>
}

export function ClientList({
  items,
  locale,
  owners,
  onEdit,
}: {
  items: ClientListItem[]
  locale: Locale
  owners: Record<string, string>
  onEdit: (c: ClientListItem) => void
}) {
  return (
    <>
      {/* Mobile: one card per client. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-card border border-line-hairline bg-surface-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onEdit(c)}
                className="text-left font-medium text-ink-primary hover:text-lane-accent"
              >
                {c.name}
              </button>
              <StageChip stage={c.stage} locale={locale} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              <span>{c.brandName ?? '—'}</span>
              {c.source ? <span>{sourceLabel(c.source, locale)}</span> : null}
              {perfilOf(c, locale) ? <span>{perfilOf(c, locale)}</span> : null}
            </div>
            {locationOf(c) ? <span className="text-t0 text-ink-secondary">{locationOf(c)}</span> : null}
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
                    <button
                      type="button"
                      onClick={() => onEdit(c)}
                      className="text-left font-medium hover:text-lane-accent"
                    >
                      {c.name}
                    </button>
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
                  <Cell className="text-ink-secondary">{perfilOf(c, locale) || '—'}</Cell>
                  <Cell>
                    <StageChip stage={c.stage} locale={locale} />
                  </Cell>
                  <Cell className="text-ink-secondary">{locationOf(c) || '—'}</Cell>
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
  )
}
