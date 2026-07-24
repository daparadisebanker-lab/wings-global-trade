// src/lib/torre/revise.test.ts
import { describe, it, expect } from 'vitest'
import { isApprovable, type CotizacionPayload, type ComunicacionPayload, type Machine } from './artifacts'
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

  it('detects added and removed terms by CONTENT (reorder is a no-op)', () => {
    const before = cotizacion({ terms: ['50% adelanto'] })
    const after = cotizacion({ terms: ['50% adelanto', 'Entrega 60 días'] })
    const changes = diffTorreArtifact(before, after)
    expect(changes).toContainEqual(expect.objectContaining({ key: 'term:Entrega 60 días', kind: 'added', after: 'Entrega 60 días' }))

    const removed = diffTorreArtifact(after, before)
    expect(removed).toContainEqual(expect.objectContaining({ key: 'term:Entrega 60 días', kind: 'removed' }))

    // a pure reorder produces NO changes (content-keyed)
    expect(diffTorreArtifact(cotizacion({ terms: ['a', 'b'] }), cotizacion({ terms: ['b', 'a'] }))).toEqual([])
  })

  it('surfaces a machine-block edit (silent no more)', () => {
    const changes = diffTorreArtifact(cotizacion(), cotizacion({ machine: { ...machine, incoterm: 'CIF' } }))
    expect(changes).toContainEqual(expect.objectContaining({ key: 'machine.incoterm', before: 'FOB', after: 'CIF', kind: 'changed' }))
  })

  it('surfaces a REMOVED source (provenance deletion is visible)', () => {
    const withSource = cotizacion({ sources: [{ kind: 'rate_table', label: 'Flete SH→CLL' }] })
    const changes = diffTorreArtifact(withSource, cotizacion({ sources: [] }))
    expect(changes).toContainEqual(expect.objectContaining({ key: 'source.0', kind: 'removed' }))
  })

  it('does NOT collapse duplicate-incoterm scenarios (deletion is visible)', () => {
    const before = cotizacion({
      scenarios: [
        { incoterm: 'FOB', landedCostMinor: 12345, unitPriceMinor: 1, confidence: 'verified' },
        { incoterm: 'FOB', landedCostMinor: 99999, unitPriceMinor: 2, confidence: 'verified' },
      ],
    })
    const after = cotizacion({ scenarios: [{ incoterm: 'FOB', landedCostMinor: 99999, unitPriceMinor: 2, confidence: 'verified' }] })
    const changes = diffTorreArtifact(before, after)
    // the second FOB.landed is a suffixed key that gets removed — not silently collapsed
    expect(changes.some((c) => c.key === 'scenario.FOB.landed#2' && c.kind === 'removed')).toBe(true)
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

  it('surfaces a REMOVED blocker on a communication (no blocker-laundering)', () => {
    const blocked = { ...comunicacion, blockers: [{ id: 'to-missing', field: 'to', reason: { es: 'falta', en: 'missing' }, task: { es: 'x', en: 'y' } }] }
    const changes = diffTorreArtifact(blocked, comunicacion) // blocker removed
    expect(changes).toContainEqual(expect.objectContaining({ key: 'blocker.to-missing', kind: 'removed' }))
  })

  it('surfaces a sideEffect edit on a communication', () => {
    const changes = diffTorreArtifact(comunicacion, { ...comunicacion, sideEffect: { es: 'Enviar a otro', en: 'Send elsewhere' } })
    expect(changes).toContainEqual(expect.objectContaining({ key: 'sideEffect', kind: 'changed' }))
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
    expect(rev.warnings).toEqual([])
  })

  it('downgrades a hand-edited verified price to estimado + adds an operator source + warns', () => {
    const original = cotizacion({ scenarios: [{ incoterm: 'FOB', landedCostMinor: 1234500, unitPriceMinor: 1500000, confidence: 'verified' }] })
    const edited = cotizacion({ scenarios: [{ incoterm: 'FOB', landedCostMinor: 1300000, unitPriceMinor: 1500000, confidence: 'verified' }] })
    const rev = reviseTorreArtifact(original, edited)
    const payload = rev.payload as typeof edited
    expect(payload.scenarios[0].confidence).toBe('estimado') // verified can't survive a manual edit
    expect(payload.sources.some((s) => s.kind === 'operator' && /manual/i.test(s.label))).toBe(true)
    expect(rev.warnings.length).toBeGreaterThan(0)
  })

  it('does NOT downgrade when the price was untouched', () => {
    const rev = reviseTorreArtifact(cotizacion(), cotizacion({ validityUntil: '2026-09-01' }))
    const payload = rev.payload as ReturnType<typeof cotizacion>
    expect(payload.scenarios[0].confidence).toBe('verified')
    expect(rev.warnings).toEqual([])
  })

  it('rejects duplicate scenario incoterms', () => {
    const dup = cotizacion({
      scenarios: [
        { incoterm: 'FOB', landedCostMinor: 1, unitPriceMinor: 2, confidence: 'verified' },
        { incoterm: 'FOB', landedCostMinor: 3, unitPriceMinor: 4, confidence: 'verified' },
      ],
    })
    expect(() => reviseTorreArtifact(cotizacion(), dup)).toThrow(/duplicate scenario incoterms/)
  })

  it('a revision that introduces a blocker is unapprovable', () => {
    const edited = cotizacion({ blockers: [{ id: 'fob-missing', field: 'fob', reason: { es: 'x', en: 'y' }, task: { es: 'a', en: 'b' } }] })
    const rev = reviseTorreArtifact(cotizacion(), edited)
    expect(isApprovable(rev.payload)).toBe(false)
  })
})
