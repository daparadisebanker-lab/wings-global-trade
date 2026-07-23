// Trust-boundary guard for the canvas context (Fable Part B review finding 9).
// CanvasContext is CLIENT-SUPPLIED JSON that seeds a server-side compute
// (computeImportCost / computeContainerFit). The engine is deterministic and every
// COMMIT re-validates + recomputes server-side, so this is defense-in-depth — but
// we still never want a NaN/Infinity or absurd magnitude reaching decimal.js, nor
// an unknown `kind`. Reject the whole context if anything is off; the capability
// then just falls back to its defaults.
import type { CanvasContext } from './types'

/** Loose upper bound — a real FOB/freight/capacity is far under this; anything
 *  larger is a client fabricating input, so drop the context entirely. */
const MAX_MAGNITUDE = 1e12

function numbersAreSane(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false
  for (const value of Object.values(obj as Record<string, unknown>)) {
    if (typeof value === 'number' && (!Number.isFinite(value) || Math.abs(value) > MAX_MAGNITUDE)) {
      return false
    }
  }
  return true
}

/** Validate a raw client context; return it typed, or undefined to drop it. The
 *  capabilities merge it over their defaults, so a shape that passes the finiteness
 *  check but is missing fields still can't break the engine. */
export function sanitizeCanvasContext(raw: unknown): CanvasContext | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const c = raw as { kind?: unknown; inputs?: unknown; input?: unknown }
  if (c.kind === 'costing' && numbersAreSane(c.inputs)) return raw as CanvasContext
  if (c.kind === 'fit' && numbersAreSane(c.input)) return raw as CanvasContext
  return undefined
}
