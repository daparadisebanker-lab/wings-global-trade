'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { UserMenu } from './UserMenu'

// Slim greeting strip (TOWER-REDESIGN §7 P2 "top greeting bar"). Real data only:
// a time-of-day greeting + today's date (es-PE) + the operator identity — never a
// placeholder. Time-sensitive values are computed on the client AFTER mount so
// SSR and the first client render agree (no hydration mismatch): the neutral
// "Hola" and no date render on the server and first paint, then resolve.
function greetingFor(hour: number, locale: Locale): string {
  if (hour < 12) return t({ es: 'Buenos días', en: 'Good morning' }, locale)
  if (hour < 19) return t({ es: 'Buenas tardes', en: 'Good afternoon' }, locale)
  return t({ es: 'Buenas noches', en: 'Good evening' }, locale)
}

export function GreetingBar({
  userName,
  userEmail,
  locale = DEFAULT_LOCALE,
}: {
  userName: string | null
  userEmail: string | null
  locale?: Locale
}) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
  }, [])

  const greeting = now ? greetingFor(now.getHours(), locale) : t({ es: 'Hola', en: 'Hi' }, locale)
  const dateLabel = now
    ? now.toLocaleDateString(locale === 'es' ? 'es-PE' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : null

  return (
    <div className="hidden items-center justify-between gap-3 border-b border-line bg-surface-1 px-4 py-2 md:flex">
      <div className="flex min-w-0 items-baseline gap-2.5">
        <span className="font-ui text-t0 text-ink-primary">{greeting}</span>
        {dateLabel ? (
          <span className="truncate font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
            {dateLabel}
          </span>
        ) : null}
      </div>
      {userName || userEmail ? <UserMenu name={userName} email={userEmail} locale={locale} /> : null}
    </div>
  )
}
