// src/lib/torre/documents.test.ts
import { describe, it, expect } from 'vitest'
import type { ActaPayload, ChecklistDocsPayload, ReporteEstadoPayload, SopPayload } from './artifacts'
import { isApprovable, torreArtifactPayloadSchema } from './artifacts'
import { actaMarkdown, checklistDocsMarkdown, documentFrame, documentMarkdown, reporteEstadoMarkdown, sopMarkdown } from './documents'
import { diffTorreArtifact } from './revise'

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

  it('every exporter shows a blockers section when blocked', () => {
    const blk = [{ id: 'x', field: 'y', reason: { es: 'documento pendiente', en: 'pending doc' }, task: { es: 'a', en: 'b' } }]
    expect(reporteEstadoMarkdown({ ...reporte, blockers: blk })).toContain('## Bloqueos')
    expect(checklistDocsMarkdown({ ...checklist, blockers: blk })).toContain('## Bloqueos')
    expect(actaMarkdown({ ...acta, blockers: blk })).toContain('## Bloqueos')
    expect(sopMarkdown({ ...sop, blockers: blk })).toContain('## Bloqueos')
  })

  it('escapes pipes/newlines so a doc name cannot forge table columns or headings', () => {
    const md = checklistDocsMarkdown({ ...checklist, items: [{ doc: 'Certificado | Origen\n# Forjado', required: true, status: 'presente' }] })
    expect(md).toContain('Certificado \\| Origen') // pipe escaped
    expect(md).not.toContain('\n# Forjado') // newline collapsed — no forged heading
  })
})

describe('checklist approvability (honesty)', () => {
  it('a missing REQUIRED doc makes the checklist UNAPPROVABLE (derived blocker)', () => {
    expect(isApprovable(checklist)).toBe(false) // BL required + faltante
    expect(documentFrame(checklist).approvable).toBe(false)
  })
  it('an all-present checklist is approvable', () => {
    const ok: ChecklistDocsPayload = { ...checklist, items: [{ doc: 'BL', required: true, status: 'presente' }] }
    expect(isApprovable(ok)).toBe(true)
    expect(documentFrame(ok).approvable).toBe(true)
  })
  it('a MISSING OPTIONAL doc does not block', () => {
    const optional: ChecklistDocsPayload = { ...checklist, items: [{ doc: 'Extra', required: false, status: 'faltante' }] }
    expect(isApprovable(optional)).toBe(true)
  })
})

describe('document diffs (the fourth leg, tested)', () => {
  it('a checklist status change presente→faltante shows in the diff', () => {
    const before: ChecklistDocsPayload = { ...checklist, items: [{ doc: 'BL', required: true, status: 'presente' }] }
    const after: ChecklistDocsPayload = { ...checklist, items: [{ doc: 'BL', required: true, status: 'faltante' }] }
    expect(diffTorreArtifact(before, after)).toContainEqual(expect.objectContaining({ key: 'doc:BL', kind: 'changed' }))
  })

  it('a checklist NOTE-only change is visible (not silently dropped)', () => {
    const before: ChecklistDocsPayload = { ...checklist, items: [{ doc: 'BL', required: true, status: 'presente', note: 'v1' }] }
    const after: ChecklistDocsPayload = { ...checklist, items: [{ doc: 'BL', required: true, status: 'presente', note: 'v2' }] }
    expect(diffTorreArtifact(before, after)).toContainEqual(expect.objectContaining({ key: 'doc:BL', kind: 'changed' }))
  })

  it('a SOP note-only change is visible', () => {
    const before: SopPayload = { ...sop, steps: [{ n: 1, action: 'Verificar', owner: null, note: 'antes' }] }
    const after: SopPayload = { ...sop, steps: [{ n: 1, action: 'Verificar', owner: null, note: 'después' }] }
    expect(diffTorreArtifact(before, after)).toContainEqual(expect.objectContaining({ key: 'step.1', kind: 'changed' }))
  })

  it('duplicate milestone labels do not collapse in a reporte diff', () => {
    const before: ReporteEstadoPayload = { ...reporte, milestones: [{ label: 'Hito', date: '2026-07-01', done: true }, { label: 'Hito', date: '2026-07-05', done: false }] }
    const after: ReporteEstadoPayload = { ...reporte, milestones: [{ label: 'Hito', date: '2026-07-01', done: true }] }
    const changes = diffTorreArtifact(before, after)
    expect(changes.some((c) => c.key === 'milestone:Hito#2' && c.kind === 'removed')).toBe(true)
  })
})
