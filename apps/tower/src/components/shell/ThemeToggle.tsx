'use client'

import { useEffect, useState } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

type Theme = 'light' | 'dark'

/**
 * Theme toggle (TOWER-REDESIGN P2b). Reads/writes the `tower-theme` key the P1
 * bootstrap (layout.tsx) consumes, and flips `data-theme` on <html> instantly.
 * Renders only after mount — the server can't know the resolved theme, so this
 * avoids a hydration mismatch — then a MutationObserver keeps it live against the
 * shared `data-theme` attribute so every instance stays in sync. Footprint comes
 * from `className`: the TopBar default is desktop-only 40px; the P5 mobile Control
 * Center passes a mobile-visible ≥44px variant. Now that a toggle exists on both
 * surfaces, the layout.tsx OS-preference auto-dark is safe — dark is always
 * escapable.
 */
export function ThemeToggle({
  locale = DEFAULT_LOCALE,
  // Visibility AND footprint. Size lives here (not in the base string) so a caller
  // can override it deterministically — `cn` is plain concatenation, no
  // tailwind-merge, so conflicting size utilities would otherwise resolve by
  // stylesheet order, not intent. TopBar keeps the desktop 40px default; the mobile
  // Control Center (P5) passes `inline-flex h-11 w-11` for the ≥44px target (§8).
  className = 'hidden h-10 w-10 md:inline-flex',
}: {
  locale?: Locale
  className?: string
}) {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const el = document.documentElement
    const read = () => setTheme(el.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    read()
    // Stay live with the shared attribute: when the desktop TopBar toggle flips
    // `data-theme`, the (hidden) mobile Control Center instance must not keep stale
    // local state, or it shows the wrong icon / aria-pressed after a resize below
    // `md` and needs two taps to act (review F-P5-2). Future-proofs any 3rd instance.
    const obs = new MutationObserver(read)
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  // Reserve the button's footprint before mount so the cluster doesn't shift when
  // the resolved theme arrives (review F-P2b-3).
  if (theme === null) return <span className={cn('shrink-0', className)} aria-hidden />

  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const apply = () => {
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('tower-theme', next)
    } catch {
      /* private mode — a session-only theme is acceptable */
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={apply}
      aria-pressed={theme === 'dark'}
      aria-label={
        next === 'dark'
          ? t({ es: 'Activar modo oscuro', en: 'Switch to dark mode' }, locale)
          : t({ es: 'Activar modo claro', en: 'Switch to light mode' }, locale)
      }
      className={cn(
        'shrink-0 items-center justify-center rounded-card text-ink-secondary transition-colors hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
        className,
      )}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
          <circle cx="10" cy="10" r="3.4" />
          <path d="M10 1.6v2.2M10 16.2v2.2M1.6 10h2.2M16.2 10h2.2M4.1 4.1l1.5 1.5M14.4 14.4l1.5 1.5M15.9 4.1l-1.5 1.5M5.6 14.4l-1.5 1.5" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
          <path d="M16.2 11.6A6.6 6.6 0 0 1 8.4 3.8a6.6 6.6 0 1 0 7.8 7.8z" />
        </svg>
      )}
    </button>
  )
}
