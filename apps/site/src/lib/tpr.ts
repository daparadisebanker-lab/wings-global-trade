// src/lib/tpr.ts
// TPR completeness + missing-field logic shared by chat route and client hook.

import type { TprState, TprFieldKey } from '@/types/mister'
import { MINIMUM_TPR_FIELDS, ALL_TPR_FIELDS } from '@/types/mister'
import type { TprCompleteness } from '@/types/database'

function isFilled(state: TprState, key: TprFieldKey): boolean {
  const v = state[key]
  if (v == null) return false
  if (typeof v === 'string') return v.trim().length > 0
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v).length > 0
  if (typeof v === 'number') return Number.isFinite(v)
  return Boolean(v)
}

export function missingFields(state: TprState): TprFieldKey[] {
  return ALL_TPR_FIELDS.filter((k) => !isFilled(state, k))
}

export function computeCompleteness(state: TprState): TprCompleteness {
  const allFilled = ALL_TPR_FIELDS.every((k) => isFilled(state, k))
  if (allFilled) return 'complete'
  const minFilled = MINIMUM_TPR_FIELDS.every((k) => isFilled(state, k))
  return minFilled ? 'minimum' : 'partial'
}

/** Coerce an extracted value to the correct type for its TPR field. */
export function coerceTprValue(field: TprFieldKey, value: unknown): unknown {
  switch (field) {
    case 'target_price_usd': {
      if (typeof value === 'number') return value
      if (typeof value === 'string') {
        const n = parseFloat(value.replace(/[^\d.]/g, ''))
        return Number.isFinite(n) ? n : undefined
      }
      return undefined
    }
    case 'certifications':
      if (Array.isArray(value)) return value.map(String)
      if (typeof value === 'string') return value.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      return undefined
    case 'tech_specs':
      return typeof value === 'object' && value !== null ? value : undefined
    default:
      return value == null ? undefined : String(value)
  }
}
