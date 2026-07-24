// src/lib/torre/documents.test.ts
import { describe, it, expect } from 'vitest'
import type { ActaPayload, ChecklistDocsPayload, ReporteEstadoPayload, SopPayload } from './artifacts'
import { torreArtifactPayloadSchema } from './artifacts'
import { actaMarkdown, checklistDocsMarkdown, documentFrame, documentMarkdown, reporteEstadoMarkdown, sopMarkdown } from './documents'

const reporte: ReporteEstadoPayload = {
  kind: 'REPORTE_ESTADO', version: 1, title: 'Estado WGT-2026-014', importRef: 'WGT-2026-014',
  status: 'EN_TRANSITO', asOf: '2026-07-24', summary: 'En tránsito, ETA Callao 08-05.',
  milestones: [{ label: 'Booking', date: '2026-07-01', done: true }, { label: 'ETA', date: null, done: false }],
  risks: [{ severity: 'media', note: 'Posible demora naviera' }], nextActions: ['Confirmar BL'],
  sources: [{ kind: 'precedent', label: 'Orden' }], blockers: [],
}
const checklist: ChecklistDocsPayload = {
  kind: 'CHECKLIST_DOCS', version: 1, title: 'Docs WGT-2026-014', importRef: 'WGT-2026-014', stage: 'EMBARQUE',
  items: [
    { doc: 'BL', required: true, status: 'faltante' },
    { doc: 'Factura comercial', required: true, status: 'presente' },
  ],
  blockers: [],
}
const acta: ActaPayload = {
  kind: 'ACTA', version: 1, title: 'Kickoff', date: '2026-07-24', attendees: ['Muaaz', 'Ops'],
  decisions: [{ topic: 'Incoterm', decision: 'FOB', owner: 'Muaaz' }],
  actionItems: [{ task: 'Enviar cotización', owner: 'Redactor', due: '2026-07-26' }], blockers: [],
}
const sop: SopPayload = {
  kind: 'SOP', version: 1, title: 'Alta de importación', scope: 'Ops',
  steps: [{ n: 2, action: 'Crear orden', owner: null }, { n: 1, action: 'Verificar cotización', owner: 'Ops' }], blockers: [],
}

describe('document schemas validate through the union', () => {
  it('all four parse', () => {
    for (const p of [reporte, checklist, acta, sop]) {
      expect(torreArtifactPayloadSchema.safeParse(p).success).toBe(true)
    }
  })
})

describe('documentFrame', () => {
  it('brands Wings by default, no endorsement', () => {
    const f = documentFrame(reporte)
    expect(f).toMatchObject({ brand: 'Wings Global Trade', kind: 'REPORTE_ESTADO', title: 'Estado WGT-2026-014', version: 1, approvable: true, endorsement: null })
  })
  it('marks a blocked document unapprovable', () => {
    const f = documentFrame({ ...reporte, blockers: [{ id: 'x', field: 'y', reason: { es: 'a', en: 'b' }, task: { es: 'c', en: 'd' } }] })
    expect(f.approvable).toBe(false)
  })
})

describe('markdown exporters', () => {
  it('reporte_estado shows milestones, risks and next actions', () => {
    const md = reporteEstadoMarkdown(reporte)
    expect(md).toContain('# Estado WGT-2026-014')
    expect(md).toContain('- [x] Booking (2026-07-01)')
    expect(md).toContain('- [ ] ETA')
    expect(md).toContain('**MEDIA** — Posible demora naviera')
    expect(md).toContain('- Confirmar BL')
  })

  it('checklist marks a missing required doc and warns', () => {
    const md = checklistDocsMarkdown(checklist)
    expect(md).toContain('| BL | Sí | ✗ faltante |')
    expect(md).toContain('Faltan 1 documento(s) obligatorio(s)')
  })

  it('acta lists decisions and action items', () => {
    const md = actaMarkdown(acta)
    expect(md).toContain('**Incoterm:** FOB _(Muaaz)_')
    expect(md).toContain('- [ ] Enviar cotización — **Redactor** (vence 2026-07-26)')
  })

  it('sop renders steps in numeric order regardless of input order', () => {
    const md = sopMarkdown(sop)
    expect(md.indexOf('1. Verificar cotización')).toBeLessThan(md.indexOf('2. Crear orden'))
  })

  it('documentMarkdown dispatches by kind and rejects non-documents', () => {
    expect(documentMarkdown(acta)).toContain('Kickoff')
    expect(() => documentMarkdown({ kind: 'COMUNICACION' } as never)).toThrow(/not a document/)
  })
})
