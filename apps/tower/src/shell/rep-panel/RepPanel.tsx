'use client'

// RepPanel — the desktop left rail (D1). After the Dock became the SOLE module
// navigator, the rail stopped listing modules and became the operator's own
// space: who you are (identity), the two things you reach from anywhere
// (your profile · marketing), and Sign out pinned to the foot. It never
// duplicates the Dock — no module list lives here.
//
// Working destinations only (the WS0 rule: no dead controls). Notes, the
// WhatsApp-Business share picker (WS5) and the team space + @mentions (WS6) are
// follow-up slots — they land as real controls in their own waves, never as
// disabled stubs here.
import Link from 'next/link'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { signOut } from '@/lib/actions/session'

/** Initials for the identity chip: first letters of the first two name tokens,
 *  else the first two characters of the single token (or the email local-part). */
function initialsOf(name: string | null, email: string | null): string {
  const src = (name?.trim() || email?.split('@')[0]?.trim() || '').replace(/[^\p{L}\p{N}\s]/gu, ' ')
  const parts = src.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  const token = parts[0] ?? ''
  return token ? token.slice(0, 2).toUpperCase() : '—'
}

const ROW =
  'group flex items-center gap-2.5 rounded-control px-2.5 py-2 text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent'
const ICON = { width: 18, height: 18, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 } as const

export function RepPanel({
  userName,
  userEmail,
  repTitle,
  showMarketing = false,
  locale = DEFAULT_LOCALE,
}: {
  userName: string | null
  userEmail: string | null
  repTitle: string | null
  /** The marketing shortcut only appears when the operator can reach a brand
   *  (mirrors the Dock's module visibility) — else it would land on an empty
   *  promo workbench. Reps without brands never see a shortcut to nowhere. */
  showMarketing?: boolean
  locale?: Locale
}) {
  const displayName = (userName?.trim() || userEmail?.trim()) ?? '—'
  const title = repTitle?.trim() || t({ es: 'Representante', en: 'Representative' }, locale)

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* Identity — who is signed in. Not a link itself; "Mi perfil" below edits it. */}
      <div className="flex items-center gap-3 rounded-card border border-line bg-surface-2 p-3">
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center rounded-pill bg-surface-1 font-mono text-t0 uppercase tracking-[0.04em] text-gold"
        >
          {initialsOf(userName, userEmail)}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-ui text-t0 text-ink-primary">{displayName}</span>
          <span className="truncate font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            {title}
          </span>
        </span>
      </div>

      {/* Destinations reachable from anywhere (never modules — those are the Dock). */}
      <nav aria-label={t({ es: 'Mi espacio', en: 'My space' }, locale)} className="flex flex-col gap-0.5">
        <Link href="/perfil" className={ROW}>
          <svg {...ICON} aria-hidden className="shrink-0">
            <circle cx="10" cy="7" r="3" />
            <path d="M4.5 16a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
          </svg>
          <span className="font-ui text-t0">{t({ es: 'Mi perfil', en: 'My profile' }, locale)}</span>
        </Link>

        {showMarketing ? (
          <Link href="/marcas/promocion" className={ROW}>
            <svg {...ICON} aria-hidden className="shrink-0">
              <path d="M4 8v4l9 4V4L4 8z" strokeLinejoin="round" />
              <path d="M4 8H3.5A1.5 1.5 0 0 0 2 9.5v1A1.5 1.5 0 0 0 3.5 12H4" />
              <path d="M13 8l4-2M13 12l4 2" strokeLinecap="round" />
            </svg>
            <span className="font-ui text-t0">{t({ es: 'Marketing', en: 'Marketing' }, locale)}</span>
          </Link>
        ) : null}
      </nav>

      {/* Sign out — pinned to the foot of the rail. */}
      <form action={signOut} className="mt-auto pt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent"
        >
          <svg {...ICON} aria-hidden className="shrink-0">
            <path d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 14l4-4-4-4M17 10H8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-ui text-t0">{t({ es: 'Cerrar sesión', en: 'Sign out' }, locale)}</span>
        </button>
      </form>
    </div>
  )
}
