// src/lib/i18n.ts
// Minimal ES/EN localization seam. TOWER copy is scaffolded ES/EN-ready; Spanish
// is the default (Wings is Spanish-first). A fuller i18n layer can replace this
// without touching call sites — every UI string reads through `t()`.
export type Locale = 'es' | 'en'
export const DEFAULT_LOCALE: Locale = 'es'

export interface Localized {
  es: string
  en: string
}

export function t(dict: Localized, locale: Locale = DEFAULT_LOCALE): string {
  return dict[locale]
}
