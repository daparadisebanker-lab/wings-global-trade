'use client'

// WINGS Control Center content (TOWER-REDESIGN §3.2), tap-first. Lives inside the
// existing mobile drawer (`<aside>`, now mobile-only after P4b) so it inherits the
// proven a11y contract (inert-when-closed, focus trap, restore, scrim). Two parts:
// a registry-driven module tile grid (replacing the drawer's list) and a
// quick-status row that discharges the P5 debts — the mobile theme toggle, and
// the greeting/identity the desktop-only GreetingBar doesn't show on mobile.
// The finger-tracked pull-down gesture + top-right pill are a later polish pass.
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { ModuleId } from '@/lib/nav'
import { TOOLS } from '@/shell/navigation/registry'
import { useActiveTool } from '@/shell/navigation/useActiveTool'
import { NAV_ICONS } from '@/components/shell/nav-icons'
import { ThemeToggle } from '@/components/shell/ThemeToggle'
import { MisterMark } from '@/components/shell/MisterMark'
import { UserMenu } from '@/shell/frame/UserMenu'

/** Registry-driven module grid — same TOOLS × `visible` × `useActiveTool` as the
 *  Dock; no new nav list. Keeps NavRail's designed empty note for zero-module. */
export function ControlCenterGrid({
  visible,
  onNavigate,
  onOpenMister,
  locale = DEFAULT_LOCALE,
}: {
  visible: Set<ModuleId>
  onNavigate?: () => void
  /** Opens the immersive Mister overlay (the copilot) — the mobile equivalent of the
   *  desktop floating door / ⌘J. When wired, Mister is a dedicated entry here that
   *  opens the immersive experience, so the RBAC-gated `intelligence` MODULE tile
   *  (also labeled "Mister", but → the /intelligence page) is folded into it to avoid
   *  a confusing second "Mister" — the overlay's Revisión tab covers that page's job. */
  onOpenMister?: () => void
  locale?: Locale
}) {
  const active = useActiveTool()
  const tools = TOOLS.filter((tl) => visible.has(tl.id) && !(onOpenMister && tl.id === 'intelligence'))

  // Mister is unconditional (the copilot isn't a module), so the empty note only
  // shows when there are no modules AND no Mister entry to offer.
  if (tools.length === 0 && !onOpenMister) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <p className="font-ui text-t0 text-ink-secondary">
          {t({ es: 'Tu cuenta aún no tiene módulos asignados.', en: 'Your account has no modules assigned yet.' }, locale)}
        </p>
        <p className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {t({ es: 'Pídele acceso a un administrador.', en: 'Ask an administrator for access.' }, locale)}
        </p>
      </div>
    )
  }

  return (
    <nav aria-label={t({ es: 'Módulos', en: 'Modules' }, locale)} className="grid grid-cols-1 gap-3 p-3">
      {/* Mister — the copilot, opening the immersive overlay (not a route). Same
          entry the desktop floating door provides; first so it reads as primary. */}
      {onOpenMister ? (
        <button
          type="button"
          onClick={onOpenMister}
          // No "(⌘J)" in the label: this grid is md:hidden (phones only), where the
          // chord means nothing and would just be announced to AT.
          aria-label={t({ es: 'Abrir Mister', en: 'Open Mister' }, locale)}
          className="cc-tile min-w-0 w-full text-left"
        >
          <MisterMark size={20} className="shrink-0" />
          <span className="min-w-0 truncate font-ui text-t0">Mister</span>
          {/* data-kbd-hint hides the chord on coarse-pointer devices (globals.css). */}
          <span data-kbd-hint aria-hidden className="ml-auto shrink-0 font-mono text-label tracking-[0.1em] text-ink-secondary">
            ⌘J
          </span>
        </button>
      ) : null}
      {tools.map((tl) => {
        const Icon = NAV_ICONS[tl.icon]
        const on = active?.id === tl.id
        return (
          <Link
            key={tl.id}
            href={tl.href}
            onClick={onNavigate}
            data-active={on}
            aria-current={on ? 'page' : undefined}
            // min-w-0 lets the tile shrink to its grid column instead of forcing
            // the whole row wider than the drawer; the label then truncates and
            // the tag stays intact (shrink-0) — no more right-column overflow.
            className="cc-tile min-w-0"
          >
            <Icon className={cn('shrink-0', on ? 'text-gold' : 'text-ink-secondary')} />
            <span className="min-w-0 truncate font-ui text-t0">{t(tl.label, locale)}</span>
            <span aria-hidden className="ml-auto shrink-0 font-mono text-label tracking-[0.1em] text-ink-secondary">
              {tl.tag}
            </span>
          </Link>
        )
      })}
      {/* Zero-module operator: keep the "ask an admin" guidance (the early-return
          note can't fire once a Mister entry is present). */}
      {tools.length === 0 ? (
        <p className="px-1 pt-1 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {t({ es: 'Aún sin módulos — pídele acceso a un administrador.', en: 'No modules yet — ask an administrator for access.' }, locale)}
        </p>
      ) : null}
    </nav>
  )
}

function greetingFor(hour: number, locale: Locale): string {
  if (hour < 12) return t({ es: 'Buenos días', en: 'Good morning' }, locale)
  if (hour < 19) return t({ es: 'Buenas tardes', en: 'Good afternoon' }, locale)
  return t({ es: 'Buenas noches', en: 'Good evening' }, locale)
}

/** Quick-status row — greeting + date + operator identity + the mobile theme
 *  toggle, and (below) the account recap + Sign out. Identity shows the rep's
 *  NAME when their profile has one, falling back to the account email. Sign out
 *  and "what you've been working on" live inline here because the mobile drawer
 *  scrolls — an absolute popover would clip. Time-sensitive values resolve after
 *  mount (no hydration mismatch). */
export function ControlCenterStatus({
  userName,
  userEmail,
  active = false,
  locale = DEFAULT_LOCALE,
}: {
  userName: string | null
  userEmail: string | null
  /** True while the mobile drawer is open — forwarded so the inline recap
   *  re-reads the recents trail each open instead of going mount-stale. */
  active?: boolean
  locale?: Locale
}) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
  }, [])

  const greeting = now ? greetingFor(now.getHours(), locale) : t({ es: 'Hola', en: 'Hi' }, locale)
  const dateLabel = now
    ? now.toLocaleDateString(locale === 'es' ? 'es-PE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })
    : null
  const identity = userName ?? userEmail

  return (
    <div className="flex flex-col gap-3 border-t border-line p-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-ui text-t0 text-ink-primary">{greeting}</div>
          {dateLabel ? (
            <div className="truncate font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              {dateLabel}
            </div>
          ) : null}
          {identity ? (
            <div
              className={cn(
                'truncate text-ink-secondary',
                userName ? 'font-ui text-t0' : 'font-mono text-label tracking-[0.04em]',
              )}
            >
              {identity}
            </div>
          ) : null}
        </div>
        <ThemeToggle locale={locale} className="inline-flex h-11 w-11" />
      </div>
      {identity ? <UserMenu name={userName} email={userEmail} locale={locale} inline active={active} /> : null}
    </div>
  )
}
