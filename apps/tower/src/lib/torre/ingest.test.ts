// src/lib/torre/ingest.test.ts
import { describe, it, expect } from 'vitest'
import type { CotizacionPayload, ComunicacionPayload, HojaCostosPayload, Machine, SopPayload } from './artifacts'
import { artifactToCorpusDoc, corpusRowsFromArtifact, type IngestMeta } from './ingest'

const machine: Machine = {
  productName: 'Grupo electrógeno', brand: 'Cummins', model: 'C150', fuelType: 'diesel',
  engineCC: 5000, incoterm: 'FOB', origin: 'china',
}
const meta: IngestMeta = { brandId: 'b1', laneId: 'l1', docId: 'draft-1', date: '2026-07-24', entityRefs: ['acc-1'] }

const cotizacion: CotizacionPayload = {
  kind: 'COTIZACION', version: 1, clientName: 'Clínica Sur', laneCode: 'WGT/01', language: 'es',
  machine, currency: 'USD', quantity: 1, validityUntil: '2026-08-15', terms: ['50% adelanto'],
  scenarios: [{ incoterm: 'FOB', landedCostMinor: 1234500, unitPriceMinor: 1500000, confidence: 'verified' }],
  sources: [], blockers: [], hojaCostosRef: null,
}
const comunicacion: ComunicacionPayload = {
  kind: 'COMUNICACION', version: 1, channel: 'email', audience: 'client', language: 'es',
  to: 'c@x.com', subject: 'Cotización lista', body: 'Estimado cliente, adjunto.', sideEffect: { es: 'x', en: 'y' },
  blockers: [], cotizacionRef: null,
}
const hoja: HojaCostosPayload = {
  kind: 'HOJA_COSTOS', version: 1, title: 'Hoja', machine, inputs: {}, result: {}, currency: 'USD',
  exchangeRate: 3.7, marginPercent: 0.18, sources: [], sensitivity: [], cautions: [], blockers: [],
}
const sop: SopPayload = { kind: 'SOP', version: 1, title: 'Alta de importación', scope: 'Ops', steps: [{ n: 1, action: 'Verificar', owner: null }], blockers: [] }

describe('artifactToCorpusDoc', () => {
  it('renders a cotización as precedent (docType, entity links, date from meta)', () => {
    const doc = artifactToCorpusDoc(cotizacion, meta)
    expect(doc).toMatchObject({ id: 'draft-1', docType: 'cotizacion', date: '2026-07-24', entityRefs: ['acc-1'] })
    expect(doc?.text).toContain('Clínica Sur')
    expect(doc?.text).toContain('50% adelanto')
  })

  it('renders a communication (subject + body)', () => {
    const doc = artifactToCorpusDoc(comunicacion, meta)
    expect(doc?.docType).toBe('comunicacion')
    expect(doc?.text).toContain('Estimado cliente')
  })

  it('renders a document artifact via its Markdown exporter', () => {
    const doc = artifactToCorpusDoc(sop, meta)
    expect(doc?.docType).toBe('sop')
    expect(doc?.text).toContain('Alta de importación')
  })

  it('does NOT ingest a HOJA_COSTOS (internal raw-number sheet, not precedent)', () => {
    expect(artifactToCorpusDoc(hoja, meta)).toBeNull()
  })
})

describe('corpusRowsFromArtifact', () => {
  it('produces knowledge_chunks insert rows with contiguous ord + provenance', () => {
    const rows = corpusRowsFromArtifact(cotizacion, meta)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.map((r) => r.chunk_ord)).toEqual(rows.map((_, i) => i))
    expect(rows.every((r) => r.brand_id === 'b1' && r.lane_id === 'l1' && r.doc_id === 'draft-1' && r.doc_type === 'cotizacion')).toBe(true)
    expect(rows.every((r) => r.entity_refs.includes('acc-1') && r.doc_date === '2026-07-24')).toBe(true)
  })

  it('is empty for a non-ingested kind (HOJA_COSTOS)', () => {
    expect(corpusRowsFromArtifact(hoja, meta)).toEqual([])
  })
})
