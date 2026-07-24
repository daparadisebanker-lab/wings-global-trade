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
  onOpenMister,
  onOpenSearch,
  locale = DEFAULT_LOCALE,
}: {
  open: boolean
  onClose: () => void
  userName: string | null
  userEmail: string | null
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
          className="fixed inset-0 z-[55]"
          style={{ backgroundColor: 'var(--scrim)' }}
        />
      ) : null}

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal={open}
        aria-label={t({ es: 'Centro de control', en: 'Control center' }, locale)}
        className={cn(
          'material-panel fixed inset-x-0 top-0 z-[56] flex max-h-[90vh] flex-col gap-4 overflow-y-auto rounded-b-panel border-b border-line p-4 transition-transform duration-300',
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
        </div>

        {/* Status + theme + recent activity + sign out (moved here from the drawer). */}
        <ControlCenterStatus userName={userName} userEmail={userEmail} active={open} locale={locale} />
      </div>
    </div>
  )
}
