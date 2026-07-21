'use client'

import { Notifications } from './Notifications'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

/**
 * TopBar (COMPONENT_TREE): brand switcher (group admin only) · global search
 * (opens the ⌘K palette) · notifications · user. Tower chrome stays graphite.
 */
export function TopBar({
  userEmail,
  isGroupAdmin,
  onOpenSearch,
  onOpenMenu,
  locale = DEFAULT_LOCALE,
}: {
  userEmail: string | null
  isGroupAdmin: boolean
  onOpenSearch: () => void
  onOpenMenu?: () => void
  locale?: Locale
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-surface-1 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Hamburger — opens the module drawer on mobile only */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t({ es: 'Abrir menú', en: 'Open menu' }, locale)}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-card text-ink-secondary hover:text-ink-primary md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wings-isotipo.svg" alt="" aria-hidden className="hidden h-6 w-6 md:block" />
        <span aria-hidden className="hidden h-5 w-px bg-line md:block" />
        {isGroupAdmin ? (
          <button
            type="button"
            className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary transition-colors hover:border-gold hover:text-ink-primary"
          >
            {t({ es: 'Marca: Todas', en: 'Brand: All' }, locale)}
          </button>
        ) : (
          <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
            WINGS
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary transition-colors hover:border-gold hover:text-ink-primary"
        >
          {t({ es: 'Buscar', en: 'Search' }, locale)}
          <span aria-hidden className="opacity-70">
            ⌘K
          </span>
        </button>
        <Notifications locale={locale} />
        <span className="hidden max-w-[220px] truncate font-ui text-t0 text-ink-secondary md:inline" data-numeric>
          {userEmail ?? '—'}
        </span>
      </div>
    </header>
  )
}
