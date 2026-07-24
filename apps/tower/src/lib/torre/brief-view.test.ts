// src/lib/torre/brief-view.test.ts
import { describe, it, expect } from 'vitest'
import {
  draftTitle,
  formatHoursReturned,
  KIND_LABEL,
  limaDayString,
  pendingDraftFrom,
  resolveBriefRole,
  SEVERITY_LABEL,
  TIME_SAVED_KIND_LABEL,
  watchSignalFromRow,
  type RawWatchSignalRow,
} from './brief-view'
import { TORRE_ARTIFACT_KINDS, type TorreArtifactPayload } from './artifacts'
import type { TorreDraftRecord } from './drafts'

describe('resolveBriefRole', () => {
  it('gives a group admin / any-lane director the director Brief (widest view)', () => {
    expect(resolveBriefRole([], true)).toBe('LANE_DIRECTOR')
    expect(resolveBriefRole(['SALES'], true)).toBe('LANE_DIRECTOR')
    expect(resolveBriefRole(['TRADE_OPS', 'LANE_DIRECTOR'], false)).toBe('LANE_DIRECTOR')
  })
  it('defaults to VIEWER when the operator holds no lane role', () => {
    expect(resolveBriefRole([], false)).toBe('VIEWER')
  })
  it('keeps a single role that already covers its responsibilities', () => {
    expect(resolveBriefRole(['SALES'], false)).toBe('SALES')
    expect(resolveBriefRole(['TRADE_OPS'], false)).toBe('TRADE_OPS')
    // a lone catalog editor has no import-ops signals — zero rules, correctly
    expect(resolveBriefRole(['CATALOG_EDITOR'], false)).toBe('CATALOG_EDITOR')
  })
  it('escalates to LANE_DIRECTOR when no single held role covers the UNION (TRADE_OPS + SALES)', () => {
    // the coverage gap the review caught: TRADE_OPS brief hides SALES commercial signals
    expect(resolveBriefRole(['SALES', 'TRADE_OPS'], false)).toBe('LANE_DIRECTOR')
  })
  it('never collapses to a NARROWER role than one held (VIEWER sees all, not CATALOG_EDITOR)', () => {
    expect(resolveBriefRole(['VIEWER', 'CATALOG_EDITOR'], false)).toBe('VIEWER')
    expect(resolveBriefRole(['CATALOG_EDITOR', 'VIEWER'], false)).toBe('VIEWER')
  })
})

describe('limaDayString', () => {
  it('returns the America/Lima calendar day (UTC-5), not the UTC day', () => {
    expect(limaDayString(Date.parse('2026-07-25T02:00:00Z'))).toBe('2026-07-24') // 21:00 Lima, prev day
    expect(limaDayString(Date.parse('2026-07-25T06:00:00Z'))).toBe('2026-07-25') // 01:00 Lima, same day
  })
})

describe('label dictionaries', () => {
  it('names every artifact kind (exhaustive), plus severities and event kinds', () => {
    for (const k of TORRE_ARTIFACT_KINDS) expect(KIND_LABEL[k]?.es).toBeTruthy()
    expect(SEVERITY_LABEL.inmediato.en).toBe('Immediate')
    expect(TIME_SAVED_KIND_LABEL.quote_run.en).toBe('quote')
  })
})

describe('watchSignalFromRow', () => {
  const good: RawWatchSignalRow = {
    rule: 'demurrage',
    severity: 'inmediato',
    import_ref: 'IMP-0142',
    title: { es: 'Demora', en: 'Demurrage' },
    detail: { es: 'x', en: 'y' },
    suggested_draft: 'COMUNICACION',
  }

  it('maps a well-formed row to a WatchSignal (incl. the suggested draft)', () => {
    expect(watchSignalFromRow(good)).toEqual({
      rule: 'demurrage',
      severity: 'inmediato',
      importRef: 'IMP-0142',
      title: { es: 'Demora', en: 'Demurrage' },
      detail: { es: 'x', en: 'y' },
      suggestedDraft: 'COMUNICACION',
    })
  })

  it('drops a row with an unknown rule or severity (never rendered raw)', () => {
    expect(watchSignalFromRow({ ...good, rule: 'not-a-rule' })).toBeNull()
    expect(watchSignalFromRow({ ...good, severity: 'catastrophic' })).toBeNull()
  })

  it('drops a row whose title/detail is not a localized {es,en}', () => {
    expect(watchSignalFromRow({ ...good, title: 'plain string' })).toBeNull()
    expect(watchSignalFromRow({ ...good, detail: { es: 'only es' } })).toBeNull()
  })

  it('omits an invalid suggested_draft rather than passing it through', () => {
    const s = watchSignalFromRow({ ...good, suggested_draft: 'HOJA_COSTOS' })
    expect(s?.suggestedDraft).toBeUndefined()
    expect(watchSignalFromRow({ ...good, suggested_draft: null })?.suggestedDraft).toBeUndefined()
  })
})

describe('draftTitle', () => {
  it('uses the client name for a cotización, falling back to the product', () => {
    expect(draftTitle({ kind: 'COTIZACION', clientName: 'ACME', machine: { productName: 'Excavadora' } } as unknown as TorreArtifactPayload, 'es')).toBe('ACME')
    expect(draftTitle({ kind: 'COTIZACION', clientName: null, machine: { productName: 'Excavadora' } } as unknown as TorreArtifactPayload, 'es')).toBe('Excavadora')
  })
  it('uses the subject for a comunicación; the synthesized fallback is localized', () => {
    expect(draftTitle({ kind: 'COMUNICACION', subject: 'Su cotización', channel: 'email' } as unknown as TorreArtifactPayload, 'es')).toBe('Su cotización')
    expect(draftTitle({ kind: 'COMUNICACION', subject: null, channel: 'whatsapp' } as unknown as TorreArtifactPayload, 'es')).toBe('Comunicación · whatsapp')
    expect(draftTitle({ kind: 'COMUNICACION', subject: null, channel: 'whatsapp' } as unknown as TorreArtifactPayload, 'en')).toBe('Message · whatsapp')
  })
  it('uses the title field for the document kinds', () => {
    expect(draftTitle({ kind: 'ACTA', title: 'Acta de reunión' } as unknown as TorreArtifactPayload, 'es')).toBe('Acta de reunión')
    expect(draftTitle({ kind: 'HOJA_COSTOS', title: 'Costeo CAT 320' } as unknown as TorreArtifactPayload, 'es')).toBe('Costeo CAT 320')
  })
})

describe('pendingDraftFrom', () => {
  const record = (payload: TorreArtifactPayload): TorreDraftRecord =>
    ({ id: 'd1', kind: payload.kind, payload } as unknown as TorreDraftRecord)

  it('maps a draft to a PendingDraft with an honest approvable flag', () => {
    const clean = record({ kind: 'ACTA', title: 'A', blockers: [] } as unknown as TorreArtifactPayload)
    expect(pendingDraftFrom(clean, 'es')).toEqual({ id: 'd1', kind: 'ACTA', title: 'A', approvable: true })
  })

  it('marks a draft with an open blocker as not approvable', () => {
    const blocked = record({ kind: 'ACTA', title: 'A', blockers: [{ id: 'x', field: 'f', reason: { es: '', en: '' }, task: { es: '', en: '' } }] } as unknown as TorreArtifactPayload)
    expect(pendingDraftFrom(blocked, 'es').approvable).toBe(false)
  })

  it('respects the derived checklist blocker (a missing required doc is not approvable)', () => {
    const checklist = record({ kind: 'CHECKLIST_DOCS', title: 'C', blockers: [], items: [{ doc: 'BL', required: true, status: 'faltante' }] } as unknown as TorreArtifactPayload)
    expect(pendingDraftFrom(checklist, 'es').approvable).toBe(false)
  })
})

describe('formatHoursReturned', () => {
  it('renders one decimal with the unit', () => {
    expect(formatHoursReturned(4.2)).toBe('4.2 h')
    expect(formatHoursReturned(0)).toBe('0.0 h')
    expect(formatHoursReturned(12)).toBe('12.0 h')
  })
})
