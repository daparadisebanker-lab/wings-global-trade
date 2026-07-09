// src/lib/duty-rates.ts
// Static customs duty rate table by destination country x HS chapter.
// Rates are indicative reference values (%) for preliminary estimates only.
// Source orientation: WTO tariff schedules for the served markets.

export type CountryCode = string

/** Map of destination country -> HS chapter (2-digit) -> duty rate %. */
export const DUTY_RATE_TABLE: Record<string, Record<string, number>> = {
  // HS chapter examples used in this MVP:
  //   84 = machinery & mechanical appliances
  //   85 = electrical machinery / generators
  //   87 = vehicles (trucks, buses, tractors)
  //   40 = rubber (tires)
  //   default = fallback when chapter unknown
  'Perú': { '84': 6, '85': 6, '87': 9, '40': 6, default: 6 },
  Peru: { '84': 6, '85': 6, '87': 9, '40': 6, default: 6 },
  Chile: { '84': 6, '85': 6, '87': 6, '40': 6, default: 6 },
  Colombia: { '84': 5, '85': 5, '87': 10, '40': 10, default: 7 },
  'Panamá': { '84': 3, '85': 3, '87': 8, '40': 5, default: 5 },
  Panama: { '84': 3, '85': 3, '87': 8, '40': 5, default: 5 },
  'Costa Rica': { '84': 1, '85': 1, '87': 6, '40': 5, default: 4 },
  Bolivia: { '84': 5, '85': 5, '87': 10, '40': 10, default: 8 },
  'R. Dominicana': { '84': 8, '85': 8, '87': 14, '40': 10, default: 10 },
  'República Dominicana': { '84': 8, '85': 8, '87': 14, '40': 10, default: 10 },
}

const DEFAULT_DUTY_RATE = 8

/** Extract the 2-digit HS chapter from an HS code string. */
export function hsChapter(hsCode?: string | null): string | null {
  if (!hsCode) return null
  const digits = hsCode.replace(/[^\d]/g, '')
  if (digits.length < 2) return null
  return digits.slice(0, 2)
}

/** Look up the duty rate (%) for a country + HS code. Falls back gracefully. */
export function lookupDutyRate(country: string, hsCode?: string | null): number {
  const countryTable = DUTY_RATE_TABLE[country]
  if (!countryTable) return DEFAULT_DUTY_RATE

  const chapter = hsChapter(hsCode)
  if (chapter && countryTable[chapter] !== undefined) {
    return countryTable[chapter]
  }
  return countryTable.default ?? DEFAULT_DUTY_RATE
}
