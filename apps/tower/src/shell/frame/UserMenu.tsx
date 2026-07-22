'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { readRecents, type RecentEntry } from '@/shell/navigation/recents'
import { signOut } from '@/lib/actions/session'

// The account menu — the operator's identity turned into an actionable control.
// The trigger shows their NAME when the rep profile carries a display name, and
// falls back to the account email only when it doesn't (the ask: show the name,
// not the email, when it's available). Opening it recaps "what you've been
// working on" — the local recents trail (P6) — and offers Sign out, a server
// action that clears the Supabase session and returns to /login.
//
// Two shapes from one component:
//  - default: a trigger button + popover (desktop — the GreetingBar strip has
//    room to open downward). Mirrors the Notifications popover contract
//    (material-panel + tower-fade, Escape + outside-click to close).
//  - inline: the recap + Sign out rendered directly, no popover (the mobile
//    Control Center lives in a scrolling drawer where an absolute popover would
//    clip; the identity is already shown by the status row, so we skip the header).

function RecapAndSignOut({
  recents,
  locale,
  onNavigate,
}: {
  recents: RecentEntry[]
  locale: Locale
  onNavigate?: () => void
}) {
  return (
    <>
      <p className="px-1 pb-1.5 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
        {t({ es: 'Actividad reciente', en: 'Recent activity' }, locale)}
      </p>
      {recents.length > 0 ? (
        <ul className="flex flex-col">
          {recents.slice(0, 5).map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                onClick={onNavigate}
                className="flex items-center gap-2 rounded-card px-1 py-1.5 text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink-primary"
              >
                <span className="shrink-0 font-mono text-label uppercase tracking-[0.1em] text-lane-accent">
                  {r.tag}
                </span>
                <span className="truncate font-ui text-t0">{r.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-1 py-1 font-ui text-t0 text-ink-secondary">
          {t({ es: 'Aún no has abierto registros.', en: 'You haven’t opened any records yet.' }, locale)}
        </p>
      )}

      <div className="my-2 border-t border-line-hairline" />

      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-card px-1 py-1.5 text-left font-ui text-t0 text-ink-primary transition-colors hover:bg-surface-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden
            className="shrink-0 text-ink-secondary"
          >
            <path d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 14l4-4-4-4M17 10H8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t({ es: 'Cerrar sesión', en: 'Sign out' }, locale)}
        </button>
      </form>
    </>
  )
}

export function UserMenu({
  name,
  email,
  locale = DEFAULT_LOCALE,
  inline = false,
  active = false,
}: {
  name: string | null
  email: string | null
  locale?: Locale
  inline?: boolean
  /** Inline (mobile) only: true while the drawer is open. Re-reads the recents
   *  recap each time it flips true, so the trail is fresh, not mount-stale. */
  active?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [recents, setRecents] = useState<RecentEntry[]>([])
  const rootRef = useRef<HTMLDivElement>(null)

  // Read the recents trail fresh each time the surface becomes visible — the
  // drawer opening (`active`) for the inline variant, the popover opening
  // (`open`) otherwise — so a record visited after mount still shows (F-UM-1).
  useEffect(() => {
    if (inline ? active : open) setRecents(readRecents())
  }, [inline, active, open])

  // Escape + outside-click close (popover only). The account menu carries an
  // action, so it earns the fuller dismiss contract the Notifications stub lacks.
  useEffect(() => {
    if (inline || !open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
    }
  }, [open, inline])

  if (inline) {
    return (
      <div className="flex flex-col">
        <RecapAndSignOut recents={recents} locale={locale} />
      </div>
    )
  }

  const label = name ?? email ?? '—'

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[220px] items-center gap-1.5 rounded-card border border-line px-2.5 py-1.5 text-ink-secondary transition-colors hover:border-gold hover:text-ink-primary"
      >
        <span className={cn('truncate', name ? 'font-ui text-t0' : 'font-mono text-label tracking-[0.04em]')}>
          {label}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          aria-hidden
          className={cn('shrink-0 transition-transform', open && 'rotate-180')}
        >
          <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={t({ es: 'Cuenta', en: 'Account' }, locale)}
          className="material-panel tower-fade absolute right-0 top-full z-50 mt-2 w-72 rounded-card-lg p-3"
        >
          {/* Identity — name over email so the account is never ambiguous. */}
          <div className="flex flex-col gap-0.5 px-1 pb-2">
            <span className="truncate font-ui text-t0 text-ink-primary">{name ?? email ?? '—'}</span>
            {name && email ? (
              <span className="truncate font-mono text-label tracking-[0.04em] text-ink-secondary">{email}</span>
            ) : null}
          </div>

          <div className="my-2 border-t border-line-hairline" />

          <RecapAndSignOut recents={recents} locale={locale} onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  )
}
