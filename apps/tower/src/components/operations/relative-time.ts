import type { Locale } from '@/lib/i18n'

// Relative timestamp for the signals feed — "hace 4 min" / "4m ago". Uses the
// platform Intl.RelativeTimeFormat (no dependency). `now` is injected so the
// server component passes a single request-time clock (deterministic per render).
const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

export function formatRelative(iso: string, now: Date, locale: Locale): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const rtf = new Intl.RelativeTimeFormat(locale === 'es' ? 'es' : 'en', { numeric: 'auto', style: 'narrow' })
  let duration = (then - now.getTime()) / 1000 // seconds; negative = past
  for (const { amount, unit } of DIVISIONS) {
    if (Math.abs(duration) < amount) return rtf.format(Math.round(duration), unit)
    duration /= amount
  }
  return ''
}
