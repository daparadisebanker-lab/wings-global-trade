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

/** Registry-driven module grid — same TOOLS × `visible` × `useActiveTool` as the
 *  Dock; no new nav list. Keeps NavRail's designed empty note for zero-module. */
export function ControlCenterGrid({
  visible,
  onNavigate,
  locale = DEFAULT_LOCALE,
}: {
  visible: Set<ModuleId>
  onNavigate?: () => void
  locale?: Locale
}) {
  const active = useActiveTool()
  const tools = TOOLS.filter((tl) => visible.has(tl.id))

  if (tools.length === 0) {
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
    <nav aria-label={t({ es: 'Módulos', en: 'Modules' }, locale)} className="grid grid-cols-2 gap-3 p-3">
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
            className="cc-tile"
          >
            <Icon className={cn('shrink-0', on ? 'text-gold' : 'text-ink-secondary')} />
            <span className="font-ui text-t0">{t(tl.label, locale)}</span>
            <span aria-hidden className="ml-auto font-mono text-label tracking-[0.1em] text-ink-secondary">
              {tl.tag}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function greetingFor(hour: number, locale: Locale): string {
  if (hour < 12) return t({ es: 'Buenos días', en: 'Good morning' }, locale)
  if (hour < 19) return t({ es: 'Buenas tardes', en: 'Good afternoon' }, locale)
  return t({ es: 'Buenas noches', en: 'Good evening' }, locale)
}

/** Quick-status row — greeting + date + operator identity + the mobile theme
 *  toggle. Time-sensitive values resolve after mount (no hydration mismatch). */
export function ControlCenterStatus({
  userEmail,
  locale = DEFAULT_LOCALE,
}: {
  userEmail: string | null
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

  return (
    <div className="flex items-center gap-3 border-t border-line p-3">
      <div className="min-w-0 flex-1">
        <div className="font-ui text-t0 text-ink-primary">{greeting}</div>
        {dateLabel ? (
          <div className="truncate font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">{dateLabel}</div>
        ) : null}
        {userEmail ? (
          <div className="truncate font-mono text-label tracking-[0.04em] text-ink-secondary">{userEmail}</div>
        ) : null}
      </div>
      <ThemeToggle locale={locale} className="inline-flex h-11 w-11" />
    </div>
  )
}
