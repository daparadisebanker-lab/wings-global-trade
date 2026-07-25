'use client'

import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from '@/shell/frame/UserMenu'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

/**
 * TopBar (COMPONENT_TREE) — the SINGLE header panel. hamburger (mobile) · brand
 * switcher (group admin) · theme · the account menu (identity + recents + sign
 * out). Search is NOT here on desktop: it lives in the Dock (⌘K), so the only
 * "Buscar" affordance the header keeps is a mobile-only one (the Dock is
 * desktop-only). The former GreetingBar strip and the Avisos stub were folded
 * away — one bar, no duplicate identity, no dead "no alerts" popover. Everything
 * shrinks safely (min-w-0) so the page never scrolls sideways at 390px.
 */
export function TopBar({
  userName,
  userEmail,
  isGroupAdmin,
  onOpenSearch,
  onOpenMenu,
  onOpenControlCenter,
  hasModules = true,
  locale = DEFAULT_LOCALE,
}: {
  userName: string | null
  userEmail: string | null
  isGroupAdmin: boolean
  onOpenSearch: () => void
  onOpenMenu?: () => void
  /** Opens the mobile iOS Control Center shade (mobile only). */
  onOpenControlCenter?: () => void
  /** When false the Dock is absent (no visible modules) — keep search on desktop
   *  too, else a mouse user would have no search affordance at all (⌘K only). */
  hasModules?: boolean
  locale?: Locale
}) {
  // z-[25]: as sticky app chrome the header sits ABOVE in-page popovers (the
  // z-20 EntityCombobox dropdown, the z-20 bottom PublishBar) yet BELOW the mobile
  // drawer backdrop (z-30) that must cover it. Desktop reverts to normal-flow
  // relative z-10 (the rail/Dock already persist there).
  return (
    <header className="tower-bar sticky top-0 z-[25] flex min-w-0 items-center justify-between gap-2 border-b border-line bg-surface-1 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:gap-4 sm:px-4 md:relative md:z-10 md:pt-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Hamburger — opens the module drawer on mobile only */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t({ es: 'Abrir menú', en: 'Open menu' }, locale)}
          className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-ink-secondary hover:text-ink-primary md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wings-isotipo.webp" alt="" aria-hidden className="hidden h-6 w-6 shrink-0 md:block" />
        <span aria-hidden className="hidden h-5 w-px shrink-0 bg-line md:block" />
        {/* Brand switcher — hidden on the smallest screens to keep the bar tight */}
        {isGroupAdmin ? (
          <button
            type="button"
            className="hidden truncate rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary transition-colors hover:border-gold hover:text-ink-primary sm:inline-block"
          >
            {t({ es: 'Marca: Todas', en: 'Brand: All' }, locale)}
          </button>
        ) : (
          <span className="hidden font-mono text-label uppercase tracking-[0.12em] text-ink-secondary sm:inline">
            WINGS
          </span>
        )}
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
        {/* Search — MOBILE ONLY (md:hidden). Desktop search is the Dock's Buscar
            tile + ⌘K, so the header never duplicates it; mobile has no Dock, so it
            keeps a tap-reachable search here rather than stranding those users. */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label={t({ es: 'Buscar', en: 'Search' }, locale)}
          className={`flex h-11 w-11 items-center justify-center rounded-control text-ink-secondary transition-colors hover:text-ink-primary ${hasModules ? 'md:hidden' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
            <circle cx="9" cy="9" r="5" />
            <path d="M13.5 13.5 17 17" strokeLinecap="round" />
          </svg>
        </button>
        {/* Control Center — MOBILE ONLY (md:hidden). The iOS-style top shade: quick
            actions + theme + status + sign out. Desktop keeps theme + the account menu. */}
        <button
          type="button"
          onClick={onOpenControlCenter}
          aria-label={t({ es: 'Centro de control', en: 'Control center' }, locale)}
          className="flex h-11 w-11 items-center justify-center rounded-control text-ink-secondary transition-colors hover:text-ink-primary md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
            <path d="M3 6.5h7M14 6.5h3M3 13.5h3M10 13.5h7" strokeLinecap="round" />
            <circle cx="12" cy="6.5" r="1.7" />
            <circle cx="8" cy="13.5" r="1.7" />
          </svg>
        </button>
        {/* Theme — desktop only; on mobile it lives in the Control Center shade. */}
        <div className="hidden md:block">
          <ThemeToggle locale={locale} />
        </div>
        {/* The account menu — identity + recent activity + sign out, in ONE control
            (folded up from the removed GreetingBar). Desktop only; on mobile the
            Control Center shade carries the same identity + recap + sign out. */}
        <div className="hidden md:block">
          <UserMenu name={userName} email={userEmail} locale={locale} />
        </div>
      </div>
    </header>
  )
}
