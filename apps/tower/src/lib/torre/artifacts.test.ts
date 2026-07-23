// src/lib/torre/artifacts.test.ts
import { describe, it, expect } from 'vitest'
import {
  isApprovable,
  blockersOf,
  parseTorreArtifact,
  torreArtifactPayloadSchema,
  hojaCostosPayloadSchema,
  CONFIDENCE_STATES,
  CONFIDENCE_LABEL,
  type Blocker,
  type CotizacionPayload,
} from './artifacts'

const blocker: Blocker = {
  id: 'fob-missing',
  field: 'fob',
  reason: { es: 'x', en: 'x' },
  task: { es: 'y', en: 'y' },
}

const validCotizacion: CotizacionPayload = {
  kind: 'COTIZACION',
  version: 1,
  clientName: 'Provemaq',
  laneCode: 'WGT/01',
  language: 'es',
  machine: {
    productName: 'Excavadora',
    brand: 'CAT',
    model: '320',
    fuelType: 'diesel',
    engineCC: 6600,
    incoterm: 'FOB',
    origin: 'china',
  },
  currency: 'USD',
  scenarios: [{ incoterm: 'FOB', landedCostMinor: 8_501_400, unitPriceMinor: 11_837_349, confidence: 'verified' }],
  quantity: 1,
  validityUntil: '2026-08-07',
  terms: ['t'],
  sources: [{ kind: 'engine', label: 'Motor SUNAT' }],
  blockers: [],
  hojaCostosRef: null,
}

describe('artifact approvability law', () => {
  it('a payload with zero blockers is approvable', () => {
    expect(isApprovable(validCotizacion)).toBe(true)
    expect(blockersOf(validCotizacion)).toHaveLength(0)
  })

  it('any open blocker makes it unapprovable (constitutional)', () => {
    expect(isApprovable({ ...validCotizacion, blockers: [blocker] })).toBe(false)
  })

  it('a missing blockers field is treated as none', () => {
    expect(isApprovable({})).toBe(true)
  })
})

describe('schema validation round-trips JSONB', () => {
  it('validates a well-formed cotizacion', () => {
    expect(torreArtifactPayloadSchema.safeParse(validCotizacion).success).toBe(true)
    expect(parseTorreArtifact(validCotizacion)?.kind).toBe('COTIZACION')
  })

  it('accepts a null scenario price (a blocked scenario renders "—")', () => {
    const blocked = {
      ...validCotizacion,
      scenarios: [{ incoterm: 'FOB' as const, landedCostMinor: null, unitPriceMinor: null, confidence: 'requiere_verificacion' as const }],
    }
    expect(torreArtifactPayloadSchema.safeParse(blocked).success).toBe(true)
  })

  it('rejects a non-Torre / malformed payload', () => {
    expect(parseTorreArtifact({ kind: 'TRIAGE' })).toBeNull()
    expect(parseTorreArtifact({ kind: 'COTIZACION' })).toBeNull() // missing required fields
    expect(parseTorreArtifact(null)).toBeNull()
  })

  it('rejects a hoja_costos missing its result trace', () => {
    const bad = { kind: 'HOJA_COSTOS', title: 'x' }
    expect(hojaCostosPayloadSchema.safeParse(bad).success).toBe(false)
  })
})

describe('confidence vocabulary', () => {
  it('has a bilingual label for every state', () => {
    for (const s of CONFIDENCE_STATES) {
      expect(CONFIDENCE_LABEL[s].es.length).toBeGreaterThan(0)
      expect(CONFIDENCE_LABEL[s].en.length).toBeGreaterThan(0)
    }
  })
})
