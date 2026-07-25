'use client'

// MobileControlCenter — the iOS-style drop-down "Control Center" shade (mobile only).
// Distinct from the left drawer: the drawer is MODULE NAVIGATION (hamburger, slides from
// the left); this shade is QUICK ACTIONS + SETTINGS + STATUS (a pill in the top-right, slides
// DOWN from the top). It owns the status/sign-out that used to live at the bottom of the
// drawer, so nothing is duplicated. Translucent material + spring, reduced-motion → fade.
import { useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { MisterMark } from '@/components/shell/MisterMark'
import { ControlCenterStatus } from './ControlCenter'

function Tile({
  label,
  onClick,
  href,
  children,
}: {
  /** Already localized (the caller passes t(...)). */
  label: string
  onClick?: () => void
  href?: string
  children: ReactNode
}) {
  const cls = 'cc-tile min-w-0 w-full flex-col items-start gap-2 text-left'
  const inner = (
    <>
      <span className="shrink-0 text-ink-secondary">{children}</span>
      <span className="min-w-0 truncate font-ui text-t0">{label}</span>
    </>
  )
  // href → Link (navigation); else a button (opens an overlay / runs a shell action).
  return href ? (
    <Link href={href} onClick={onClick} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

const ICON = { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 } as const

export function MobileControlCenter({
  open,
  onClose,
  userName,
  userEmail,
  teamSpaceEnabled = false,
  unreadMentions = 0,
  onOpenMister,
  onOpenSearch,
  locale = DEFAULT_LOCALE,
}: {
  open: boolean
  onClose: () => void
  userName: string | null
  userEmail: string | null
  /** Team space live (tower_55 applied) — the Equipo tile appears only then, so
   *  mobile users reach their mentions without a dead-end while dormant. */
  teamSpaceEnabled?: boolean
  unreadMentions?: number
  onOpenMister: () => void
  onOpenSearch: () => void
  locale?: Locale
}) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Escape closes; the closed sheet is inert (off-screen but must not be tabbable).
  useEffect(() => {
    if (sheetRef.current) sheetRef.current.inert = !open
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className="md:hidden">
      {open ? (
        <button
          type="button"
          aria-label={t({ es: 'Cerrar centro de control', en: 'Close control center' }, locale)}
          onClick={onClose}
          className="fixed inset-0 z-[55] backdrop-blur"
          style={{ backgroundColor: 'var(--scrim)' }}
        />
      ) : null}

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal={open}
        aria-label={t({ es: 'Centro de control', en: 'Control center' }, locale)}
        className={cn(
          // material-chrome = the translucent backdrop-blur glass the desktop Dock
          // uses (ships an opaque fallback for engines without backdrop-filter), so
          // the "iOS Control Center" shade finally reads as the frosted material its
          // own comment promised — with elevation for depth. Top padding clears the
          // notch/status-bar via the safe-area inset (viewport-fit:cover, layout.tsx).
          'material-chrome fixed inset-x-0 top-0 z-[56] flex max-h-[90vh] flex-col gap-4 overflow-y-auto rounded-b-panel px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-elevation-3',
          // macOS spring on the slide; reduced-motion drops the travel (crossfade).
          'transition-transform duration-300 ease-spring-settle motion-reduce:transition-none',
          open ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        {/* Grabber — the iOS pull affordance. */}
        <span aria-hidden className="mx-auto h-1 w-10 shrink-0 rounded-pill bg-line" />

        <div className="grid grid-cols-2 gap-2">
          <Tile label={t({ es: 'Mister', en: 'Mister' }, locale)} onClick={() => { onOpenMister(); onClose() }}>
            <MisterMark size={20} />
          </Tile>
          <Tile label={t({ es: 'Buscar', en: 'Search' }, locale)} onClick={() => { onOpenSearch(); onClose() }}>
            <svg {...ICON} aria-hidden>
              <circle cx="9" cy="9" r="5" />
              <path d="M13.5 13.5 17 17" strokeLinecap="round" />
            </svg>
          </Tile>
          <Tile label={t({ es: 'Brief del día', en: 'Morning Brief' }, locale)} href="/brief" onClick={onClose}>
            <svg {...ICON} aria-hidden>
              <path d="M4 4h12v12H4z" />
              <path d="M7 8h6M7 11h6" strokeLinecap="round" />
            </svg>
          </Tile>
          <Tile label={t({ es: 'Mi perfil', en: 'My profile' }, locale)} href="/perfil" onClick={onClose}>
            <svg {...ICON} aria-hidden>
              <circle cx="10" cy="7" r="3" />
              <path d="M4.5 16a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
            </svg>
          </Tile>
          {/* Team space — only when live (tower_55 applied); shows the unread count
              so mention notifications are reachable on mobile, not desktop-only. */}
          {teamSpaceEnabled ? (
            <Tile
              label={
                unreadMentions > 0
                  ? `${t({ es: 'Equipo', en: 'Team' }, locale)} · ${unreadMentions > 99 ? '99+' : unreadMentions}`
                  : t({ es: 'Equipo', en: 'Team' }, locale)
              }
              href="/equipo"
              onClick={onClose}
            >
              <svg {...ICON} aria-hidden>
                <circle cx="7" cy="7.5" r="2.5" />
                <path d="M2.5 16a4.5 4.5 0 0 1 9 0" strokeLinecap="round" />
                <path d="M13 5.2a2.4 2.4 0 0 1 0 4.6M14.5 16a4.5 4.5 0 0 0-2.3-3.9" strokeLinecap="round" />
              </svg>
            </Tile>
          ) : null}
        </div>

        {/* Status + theme + recent activity + sign out (moved here from the drawer). */}
        <ControlCenterStatus userName={userName} userEmail={userEmail} active={open} locale={locale} />
      </div>
    </div>
  )
}
