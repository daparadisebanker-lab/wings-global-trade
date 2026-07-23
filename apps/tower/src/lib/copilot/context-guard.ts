// Trust-boundary guard for the canvas context (Fable Part B review finding 9, hardened
// per the verify pass finding 4/11). CanvasContext is CLIENT-SUPPLIED JSON that seeds a
// server-side compute (computeImportCost / computeContainerFit). The engine is
// deterministic and every COMMIT re-validates + recomputes server-side, so this is
// defense-in-depth — but decimal.js coerces numeric STRINGS ('1e99') and throws on null,
// so a type-blind range check is not enough: we reject nulls, numeric-looking strings,
// oversized strings, non-scalars, non-finite/absurd numbers, an unknown `kind`, or an
// over-large payload. On any failure the whole context is dropped and the capability
// falls back to its defaults.
import type { CanvasContext } from './types'

/** A real FOB/freight/capacity is far under this; larger = a client fabricating input. */
const MAX_MAGNITUDE = 1e12
const MAX_STRING = 200
const MAX_PAYLOAD_CHARS = 20_000

function inputsAreSafe(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false
  for (const value of Object.values(obj as Record<string, unknown>)) {
    if (value === null) return false // null poisons decimal.js
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || Math.abs(value) > MAX_MAGNITUDE) return false
    } else if (typeof value === 'string') {
      if (value.length > MAX_STRING) return false
      // Reject any numeric-looking string — a typed number ('1e99') or a poisoned
      // token ('NaN'/'Infinity') smuggled past the number branch into decimal.js.
      const t = value.trim()
      if (t !== '' && (Number.isFinite(Number(t)) || /^[-+]?(nan|infinity)$/i.test(t))) return false
    } else if (typeof value !== 'boolean' && typeof value !== 'undefined') {
      return false // objects / arrays / functions / symbols
    }
  }
  return true
}

/** Validate a raw client context; return it typed, or undefined to drop it. The
 *  capabilities merge it over their defaults, so a shape that passes but is missing
 *  fields still can't break the engine. */
export function sanitizeCanvasContext(raw: unknown): CanvasContext | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  try {
    if (JSON.stringify(raw).length > MAX_PAYLOAD_CHARS) return undefined
  } catch {
    return undefined // circular / non-serializable
  }
  const c = raw as { kind?: unknown; inputs?: unknown; input?: unknown }
  if (c.kind === 'costing' && inputsAreSafe(c.inputs)) return raw as CanvasContext
  if (c.kind === 'fit' && inputsAreSafe(c.input)) return raw as CanvasContext
  return undefined
}
