// src/components/signals/format.ts
// Shared numeric formatting for the Signal Deck. Numbers are brand assets
// (Prime Directive 5) — always tabular, grouped, never abbreviated silently.
import type { Locale } from '@/lib/i18n'

const LOCALE_TAG: Record<Locale, string> = { es: 'es-PE', en: 'en-US' }

/** Grouped integer, e.g. 12 345. */
export function formatInt(n: number, locale: Locale = 'es'): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale]).format(Math.round(n))
}

/** Signed delta, e.g. +50 / −12 (true minus glyph, never a hyphen). */
export function formatDelta(n: number, locale: Locale = 'es'): string {
  const abs = formatInt(Math.abs(n), locale)
  if (n > 0) return `+${abs}`
  if (n < 0) return `−${abs}`
  return abs
}

/** Basis points → percent label, e.g. 4000 → "40%". */
export function formatBpsPercent(bps: number): string {
  return `${Math.round(bps / 100)}%`
}
