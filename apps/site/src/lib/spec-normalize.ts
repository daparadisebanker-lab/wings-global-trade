// src/lib/spec-normalize.ts
// Specs as visual phenomenon — the normalization layer beneath every generative
// system on the product page. Six axes (HP, payload, GVW, wheelbase, speed,
// weight) are extracted from heterogeneous Spanish spec maps, parsed out of
// unit-bearing strings ("50 HP", "2370 kg", "766 RPM"), and mapped to 0–1
// against ranges derived from the Wings catalog. The same NormalizedSpecs object
// seeds the fingerprint, the noise field, the waveform, the trade route, and the
// cellular automaton — so a single product reads as one coherent organism.

export interface NormalizedSpecs {
  hp: number
  payload: number
  gvw: number
  wheelbase: number
  speed: number
  weight: number
}

export type SpecAxis = keyof NormalizedSpecs

/** Fixed axis order — every consumer (radar, score, legend) walks this order. */
export const SPEC_AXES: readonly SpecAxis[] = [
  'hp',
  'payload',
  'gvw',
  'wheelbase',
  'speed',
  'weight',
] as const

/**
 * Normalization ranges derived from the Wings catalog. A value at or below `min`
 * reads as 0, at or above `max` reads as 1. These are intentionally the rule —
 * Molnár's geometry — that every fingerprint is measured against.
 */
const RANGES: Record<SpecAxis, readonly [number, number]> = {
  hp: [18, 400],
  payload: [200, 20000],
  gvw: [800, 35000],
  wheelbase: [1800, 5500],
  speed: [30, 150],
  weight: [400, 18000],
}

/**
 * Fuzzy key dictionaries. Wings spec maps use Spanish labels with no fixed
 * schema, so we match on lowercased substrings rather than exact keys. Order
 * matters: earlier candidates win. Accents are stripped before matching.
 */
const KEY_HINTS: Record<SpecAxis, readonly string[]> = {
  hp: ['potencia del motor', 'potencia', 'caballos', 'hp', 'power'],
  payload: [
    'carga util',
    'carga útil',
    'capacidad de carga',
    'capacidad de levante',
    'capacidad de tolva',
    'payload',
    'levante',
  ],
  gvw: ['gvw', 'peso bruto', 'peso bruto vehicular', 'masa maxima', 'masa máxima'],
  wheelbase: ['batalla', 'distancia entre ejes', 'wheelbase', 'entre ejes'],
  speed: ['velocidad maxima', 'velocidad máxima', 'velocidad', 'speed', 'kmh', 'km/h'],
  weight: [
    'peso operativo',
    'peso en vacio',
    'peso en vacío',
    'peso neto',
    'curb weight',
    'tara',
    'peso',
  ],
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Parse the first numeric token out of an arbitrary value. Handles thousands
 * separators ("12,500" / "12.500"), decimals, and unit suffixes. Returns null
 * when no number is present (e.g. "4WD", "Flujo axial").
 */
function parseNumeric(raw: unknown): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
  if (typeof raw !== 'string') return null

  const match = raw.match(/-?\d[\d.,\s]*\d|-?\d/)
  if (!match) return null

  let token = match[0].replace(/\s/g, '')

  // Decide separator semantics. If both separators appear, the last one is the
  // decimal point. If only one appears and it groups into 3-digit blocks, treat
  // it as a thousands separator; otherwise as a decimal.
  const hasComma = token.includes(',')
  const hasDot = token.includes('.')

  if (hasComma && hasDot) {
    if (token.lastIndexOf(',') > token.lastIndexOf('.')) {
      token = token.replace(/\./g, '').replace(',', '.')
    } else {
      token = token.replace(/,/g, '')
    }
  } else if (hasComma) {
    token = /,\d{3}(\D|$)/.test(token) ? token.replace(/,/g, '') : token.replace(',', '.')
  } else if (hasDot) {
    token = /\.\d{3}(\D|$)/.test(token) ? token.replace(/\./g, '') : token
  }

  const n = parseFloat(token)
  return Number.isFinite(n) ? n : null
}

/**
 * Scale a parsed number to a canonical unit. The catalog mixes kilograms and
 * tonnes for mass/payload ("2370 kg" vs "40 toneladas"), so when a mass-like
 * value carries a tonne unit we convert to kg. Conservative: only fires on an
 * explicit "ton"/"tonelada"/"t" suffix to avoid mangling "Stage II" etc.
 */
function applyUnitScale(value: number, rawStr: string): number {
  const s = stripAccents(rawStr.toLowerCase())
  if (/\b\d[\d.,\s]*\s*(toneladas?|tons?|tn|t)\b/.test(s)) return value * 1000
  return value
}

/**
 * Fuzzy-extract the first matching numeric spec value. Pass axis hint keys (or
 * any custom keys) in priority order; the first key that fuzzy-matches an entry
 * in `specs` AND yields a parseable number wins. Tonne units are normalized to
 * kg so mass axes stay comparable across the catalog.
 */
export function extractNum(specs: Record<string, unknown>, ...keys: string[]): number | null {
  const entries = Object.entries(specs ?? {}).map(
    ([k, v]) => [stripAccents(k.toLowerCase()), v] as const,
  )

  for (const key of keys) {
    const needle = stripAccents(key.toLowerCase())
    for (const [normKey, value] of entries) {
      if (normKey.includes(needle)) {
        const n = parseNumeric(value)
        if (n !== null) {
          return typeof value === 'string' ? applyUnitScale(n, value) : n
        }
      }
    }
  }
  return null
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

function normalizeAxis(value: number | null, axis: SpecAxis): number {
  if (value === null) return 0
  const [min, max] = RANGES[axis]
  if (max === min) return 0
  return clamp01((value - min) / (max - min))
}

/**
 * Normalize a raw spec map to the six-axis 0–1 vector that seeds every
 * generative system. Missing axes resolve to 0 — the rule never throws, it just
 * collapses that axis, which is itself visually meaningful (a flat radius).
 */
export function normalizeSpecs(specs: Record<string, unknown>): NormalizedSpecs {
  const s = specs ?? {}
  return {
    hp: normalizeAxis(extractNum(s, ...KEY_HINTS.hp), 'hp'),
    payload: normalizeAxis(extractNum(s, ...KEY_HINTS.payload), 'payload'),
    gvw: normalizeAxis(extractNum(s, ...KEY_HINTS.gvw), 'gvw'),
    wheelbase: normalizeAxis(extractNum(s, ...KEY_HINTS.wheelbase), 'wheelbase'),
    speed: normalizeAxis(extractNum(s, ...KEY_HINTS.speed), 'speed'),
    weight: normalizeAxis(extractNum(s, ...KEY_HINTS.weight), 'weight'),
  }
}

/** Raw (un-normalized) axis values — used by the waveform and route systems
 *  that want the physical magnitude, not the 0–1 projection. */
export function rawSpecValues(specs: Record<string, unknown>): Record<SpecAxis, number | null> {
  const s = specs ?? {}
  return {
    hp: extractNum(s, ...KEY_HINTS.hp),
    payload: extractNum(s, ...KEY_HINTS.payload),
    gvw: extractNum(s, ...KEY_HINTS.gvw),
    wheelbase: extractNum(s, ...KEY_HINTS.wheelbase),
    speed: extractNum(s, ...KEY_HINTS.speed),
    weight: extractNum(s, ...KEY_HINTS.weight),
  }
}

/**
 * Deterministic 32-bit hash of a string (FNV-1a). Used to seed controlled
 * deviation so a given product always renders the same "imperfect" fingerprint
 * across reloads — chance within a designed range, never random per frame.
 */
export function hashString(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * Build the SVG polygon path for a 6-axis radar. Axis 0 points straight up; the
 * remaining axes are spaced evenly clockwise. Returns a closed path string ("Z")
 * suitable for both <path d> and CSS `d:` transitions.
 *
 * `deviation` is an optional per-axis ±offset (in 0–1 units) — the Molnár
 * deviation. Pass slug-seeded jitter to give near-identical products subtly
 * different shapes; omit it for the pure geometric rule.
 */
export function getSpecPath(
  normalized: NormalizedSpecs,
  radius: number,
  cx: number,
  cy: number,
  deviation?: Partial<Record<SpecAxis, number>>,
): string {
  const count = SPEC_AXES.length
  const points = SPEC_AXES.map((axis, i) => {
    const angle = -Math.PI / 2 + (i / count) * Math.PI * 2
    const dev = deviation?.[axis] ?? 0
    const r = clamp01(normalized[axis] + dev) * radius
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    return `${x.toFixed(2)} ${y.toFixed(2)}`
  })
  return `M ${points.join(' L ')} Z`
}
