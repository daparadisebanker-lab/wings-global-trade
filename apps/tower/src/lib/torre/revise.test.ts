// src/lib/torre/revise.test.ts
import { describe, it, expect } from 'vitest'
import type { CotizacionPayload, ComunicacionPayload, Machine } from './artifacts'
import { diffTorreArtifact, reviseTorreArtifact } from './revise'

const machine: Machine = {
  productName: 'Grupo electrógeno', brand: 'Cummins', model: 'C150', fuelType: 'diesel',
  engineCC: 5000, incoterm: 'FOB', origin: 'china',
}

function cotizacion(over: Partial<CotizacionPayload> = {}): CotizacionPayload {
  return {
    kind: 'COTIZACION', version: 1, clientName: 'Clínica Sur', laneCode: 'WGT/01', language: 'es',
    machine, currency: 'USD', quantity: 1, validityUntil: '2026-08-15', terms: ['50% adelanto'],
    scenarios: [{ incoterm: 'FOB', landedCostMinor: 1234500, unitPriceMinor: 1500000, confidence: 'verified' }],
    sources: [], blockers: [], hojaCostosRef: null,
    ...over,
  }
}

const comunicacion: ComunicacionPayload = {
  kind: 'COMUNICACION', version: 1, channel: 'email', audience: 'client', language: 'es',
  to: null, subject: 'Cotización', body: 'Estimado cliente', sideEffect: { es: 'Enviar', en: 'Send' },
  blockers: [], cotizacionRef: null,
}

describe('diffTorreArtifact', () => {
  it('reports a changed scalar field with before/after', () => {
    const changes = diffTorreArtifact(cotizacion(), cotizacion({ validityUntil: '2026-09-01' }))
    expect(changes).toHaveLength(1)
    expect(changes[0]).toMatchObject({ key: 'validityUntil', before: '2026-08-15', after: '2026-09-01', kind: 'changed' })
  })

  it('formats money from minor units in the diff', () => {
    const changes = diffTorreArtifact(
      cotizacion(),
      cotizacion({ scenarios: [{ incoterm: 'FOB', landedCostMinor: 1300000, unitPriceMinor: 1500000, confidence: 'verified' }] }),
    )
    const landed = changes.find((c) => c.key === 'scenario.FOB.landed')
    expect(landed).toMatchObject({ before: '12345.00', after: '13000.00', kind: 'changed' })
  })

  it('detects added and removed terms', () => {
    const before = cotizacion({ terms: ['50% adelanto'] })
    const after = cotizacion({ terms: ['50% adelanto', 'Entrega 60 días'] })
    const changes = diffTorreArtifact(before, after)
    expect(changes).toContainEqual(expect.objectContaining({ key: 'term.1', kind: 'added', after: 'Entrega 60 días' }))

    const removed = diffTorreArtifact(after, before)
    expect(removed).toContainEqual(expect.objectContaining({ key: 'term.1', kind: 'removed', before: 'Entrega 60 días' }))
  })

  it('detects an added scenario (new incoterm)', () => {
    const after = cotizacion({
      scenarios: [
        { incoterm: 'FOB', landedCostMinor: 1234500, unitPriceMinor: 1500000, confidence: 'verified' },
        { incoterm: 'CIF', landedCostMinor: 1300000, unitPriceMinor: 1600000, confidence: 'estimado' },
      ],
    })
    const changes = diffTorreArtifact(cotizacion(), after)
    expect(changes.some((c) => c.key === 'scenario.CIF.landed' && c.kind === 'added')).toBe(true)
  })

  it('returns no changes for identical payloads', () => {
    expect(diffTorreArtifact(cotizacion(), cotizacion())).toEqual([])
  })

  it('diffs a communication body edit', () => {
    const changes = diffTorreArtifact(comunicacion, { ...comunicacion, body: 'Estimado cliente, adjunto.' })
    expect(changes).toContainEqual(expect.objectContaining({ key: 'body', kind: 'changed' }))
  })

  it('throws on a kind mismatch', () => {
    expect(() => diffTorreArtifact(cotizacion(), comunicacion)).toThrow(/kind mismatch/)
  })
})

describe('reviseTorreArtifact', () => {
  it('bumps the version past the original and returns the diff', () => {
    const rev = reviseTorreArtifact(cotizacion({ version: 1 }), cotizacion({ validityUntil: '2026-09-01' }))
    expect(rev.payload.version).toBe(2)
    expect(rev.diff).toContainEqual(expect.objectContaining({ key: 'validityUntil', kind: 'changed' }))
  })

  it('bumps from whatever the original version was', () => {
    const rev = reviseTorreArtifact(cotizacion({ version: 4 }), cotizacion({ version: 4, quantity: 2 }))
    expect(rev.payload.version).toBe(5)
  })

  it('re-validates the edited payload (a malformed edit throws)', () => {
    // scenarios must have at least one — an empty scenarios array fails the schema
    const broken = { ...cotizacion(), scenarios: [] } as unknown as CotizacionPayload
    expect(() => reviseTorreArtifact(cotizacion(), broken)).toThrow(/invalid/)
  })

  it('throws on a kind mismatch', () => {
    expect(() => reviseTorreArtifact(cotizacion(), comunicacion)).toThrow(/kind mismatch/)
  })

  it('produces an empty diff for a no-op revision (version still bumps)', () => {
    const rev = reviseTorreArtifact(cotizacion({ version: 2 }), cotizacion({ version: 2 }))
    expect(rev.diff).toEqual([])
    expect(rev.payload.version).toBe(3)
  })
})
