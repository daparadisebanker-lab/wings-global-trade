// src/components/catalog/spec-form/state.ts
// Pure state-transition helpers used by SpecForm's event handlers. Kept as
// standalone functions (not inlined closures) so the exact computation behind
// `onChange` and the ES/EN tab switch is directly testable without a DOM —
// this workspace has no jsdom/@testing-library/react installed yet (flagged in
// the build report), so component tests exercise these functions directly
// alongside a static (SSR) render of the markup.
import type { Locale } from '../../../lib/i18n'

/** What `onChange` always receives: the previous record with one key patched. */
export function mergeSpecValue(
  value: Record<string, unknown>,
  key: string,
  fieldValue: unknown,
): Record<string, unknown> {
  return { ...value, [key]: fieldValue }
}

export interface LocalizedPair {
  es: string
  en: string
}

/** Normalizes a possibly-partial/undefined localized value into a full `{es, en}` pair. */
export function normalizeLocalizedPair(value: unknown): LocalizedPair {
  const pair = (value ?? {}) as Partial<LocalizedPair>
  return { es: pair.es ?? '', en: pair.en ?? '' }
}

/** Applies an edit to the active tab's locale only, leaving the other locale untouched. */
export function updateLocalizedPair(current: unknown, activeLocale: Locale, text: string): LocalizedPair {
  const pair = normalizeLocalizedPair(current)
  return { ...pair, [activeLocale]: text }
}
