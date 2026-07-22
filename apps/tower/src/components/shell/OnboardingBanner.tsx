'use client'

// OnboardingBanner — a gentle, dismissible prompt shown to an enrolled rep who
// has not finished onboarding (their rep_profiles row exists but onboarded_at is
// null). It never hard-blocks the app; it just points them at /perfil. The
// server (shell layout) decides whether to render it; this only handles dismissal
// for the session and hides itself once the rep is already on /perfil.
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function OnboardingBanner() {
  const pathname = usePathname()
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || pathname.startsWith('/perfil')) return null

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 border-b border-line bg-surface-1 px-4 py-2.5"
      style={{ borderLeft: '2px solid var(--gold)' }}
    >
      <span aria-hidden className="inline-block h-2 w-2 shrink-0 bg-gold" />
      <span className="font-ui text-t0 text-ink-primary">
        Completa tu perfil de rep (nombre, cargo, WhatsApp y firma). / Complete your rep profile (name, title, WhatsApp and
        signature).
      </span>
      <Link
        href="/perfil"
        className="rounded-card bg-accent px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
      >
        Completar perfil / Complete profile
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-auto rounded-card px-2 py-1 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
      >
        Después / Later
      </button>
    </div>
  )
}
