// src/lib/pluralize.ts
//
// Every count rendered anywhere on the site ("1 modelo" / "N modelos") goes
// through this — the automóviles lane had two spots (lane-root segment/brand
// counts) that always rendered the plural noun regardless of count ("1
// modelos"), while every other count in the same lane already used an
// inline ternary correctly. One util instead of N inline ternaries drifting
// out of sync with each other again.

/**
 * @param count the quantity being labelled
 * @param singular the singular noun, e.g. "modelo"
 * @param plural the plural noun; defaults to singular + "s"
 */
export function pluralize(count: number, singular: string, plural: string = `${singular}s`): string {
  return count === 1 ? singular : plural
}

/** Convenience form: "1 modelo" / "0 modelos" / "3 modelos". */
export function pluralizeCount(count: number, singular: string, plural?: string): string {
  return `${count} ${pluralize(count, singular, plural)}`
}
