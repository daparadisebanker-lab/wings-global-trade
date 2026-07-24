// src/lib/torre/brief.test.ts
import { describe, it, expect } from 'vitest'
import { buildMorningBrief, productivitySummary, timeSavedEvent, timeSavedEventsFromApprovals, type BriefInput, type PendingDraft } from './brief'
import type { WatchSignal } from './watch'

function sig(rule: WatchSignal['rule'], severity: WatchSignal['severity'], importRef = 'A'): WatchSignal {
  return { rule, severity, importRef, title: { es: '', en: '' }, detail: { es: '', en: '' } }
}
const draft = (over: Partial<PendingDraft> = {}): PendingDraft => ({ id: 'd1', kind: 'COTIZACION', title: 'Q', approvable: true, ...over })

function input(over: Partial<BriefInput> = {}): BriefInput {
  return { role: 'TRADE_OPS', date: '2026-07-24', signals: [], pendingDrafts: [], ...over }
}

describe('buildMorningBrief — role scoping', () => {
  it('shows an ops role its ops signals, not commercial ones', () => {
    const b = buildMorningBrief(input({ role: 'TRADE_OPS', signals: [sig('demurrage', 'inmediato'), sig('quote-quiet', 'medio')] }))
    const rules = [...b.urgent, ...b.attention].map((s) => s.rule)
    expect(rules).toContain('demurrage')
    expect(rules).not.toContain('quote-quiet') // SALES concern, filtered out for ops
  })

  it('shows SALES its commercial signals, not ops noise', () => {
    const b = buildMorningBrief(input({ role: 'SALES', signals: [sig('demurrage', 'inmediato'), sig('quote-quiet', 'medio'), sig('margin-drift', 'alto')] }))
    const rules = [...b.urgent, ...b.attention].map((s) => s.rule)
    expect(rules.sort()).toEqual(['margin-drift', 'quote-quiet'])
  })

  it('VIEWER sees everything (read-only)', () => {
    const b = buildMorningBrief(input({ role: 'VIEWER', signals: [sig('demurrage', 'inmediato'), sig('quote-quiet', 'medio')] }))
    expect([...b.urgent, ...b.attention]).toHaveLength(2)
  })
})

describe('buildMorningBrief — bands & stillness', () => {
  it('puts inmediato in urgent and the rest in attention, ranked', () => {
    const b = buildMorningBrief(input({ signals: [sig('demurrage', 'inmediato'), sig('eta-slip', 'medio'), sig('doc-deadline', 'alto')] }))
    expect(b.urgent.map((s) => s.rule)).toEqual(['demurrage'])
    expect(b.attention.map((s) => s.severity)).toEqual(['alto', 'medio']) // ranked
  })

  it('only surfaces approvable drafts', () => {
    const b = buildMorningBrief(input({ pendingDrafts: [draft({ approvable: true }), draft({ id: 'd2', approvable: false })] }))
    expect(b.drafts).toHaveLength(1)
    expect(b.drafts[0].id).toBe('d1')
  })

  it('is quiet when nothing needs the operator', () => {
    expect(buildMorningBrief(input()).quiet).toBe(true)
    expect(buildMorningBrief(input({ signals: [sig('demurrage', 'inmediato')] })).quiet).toBe(false)
  })

  it('mastheads per cadence', () => {
    expect(buildMorningBrief(input({ cadence: 'morning' })).masthead.en).toMatch(/Good morning/)
    expect(buildMorningBrief(input({ cadence: 'friday' })).masthead.en).toMatch(/Week in review/)
    expect(buildMorningBrief(input({ cadence: 'month-end' })).masthead.es).toMatch(/Cierre del mes/)
  })

  it('never fabricates telemetry — undefined when not supplied, on ANY cadence', () => {
    expect(buildMorningBrief(input({ cadence: 'morning' })).telemetry).toBeUndefined()
    expect(buildMorningBrief(input({ cadence: 'friday' })).telemetry).toBeUndefined() // no "0 hours" lie
    const withData = buildMorningBrief(input({ cadence: 'friday', telemetry: { hoursReturned: 4.2, draftsApproved: 8, signalsResolved: 3 } }))
    expect(withData.telemetry?.hoursReturned).toBe(4.2)
  })
})

describe('RULE_ROLES totality', () => {
  it('every watch rule reaches at least one role (nothing orphaned)', () => {
    const rules: WatchSignal['rule'][] = ['eta-slip', 'doc-deadline', 'demurrage', 'rate-expiry', 'payment-milestone', 'quote-quiet', 'margin-drift', 'stale-import']
    for (const rule of rules) {
      // LANE_DIRECTOR covers all 8, so a director brief surfaces every rule
      const b = buildMorningBrief(input({ role: 'LANE_DIRECTOR', signals: [{ rule, severity: 'alto', importRef: 'A', title: { es: '', en: '' }, detail: { es: '', en: '' } }] }))
      expect([...b.urgent, ...b.attention]).toHaveLength(1)
    }
  })
})

describe('productivity telemetry', () => {
  it('sums minutes into hours returned + counts', () => {
    const s = productivitySummary([
      timeSavedEvent('quote_run'), // 25
      timeSavedEvent('draft_approved'), // 8
      timeSavedEvent('draft_approved'), // 8
      timeSavedEvent('signal_resolved'), // 5
    ])
    expect(s.hoursReturned).toBe(0.8) // 46 min → 0.766 → 0.8
    expect(s.draftsApproved).toBe(2)
    expect(s.signalsResolved).toBe(1)
  })

  it('honors a per-event override', () => {
    expect(productivitySummary([timeSavedEvent('quote_run', 60)]).hoursReturned).toBe(1)
  })

  it('is zero for an empty period', () => {
    expect(productivitySummary([])).toEqual({ hoursReturned: 0, draftsApproved: 0, signalsResolved: 0 })
  })
})

describe('timeSavedEventsFromApprovals', () => {
  it('maps each approved artifact to one kind-appropriate event', () => {
    const events = timeSavedEventsFromApprovals(['COTIZACION', 'ACTA', 'COMUNICACION', 'HOJA_COSTOS'])
    expect(events.map((e) => e.kind)).toEqual(['quote_run', 'doc_generated', 'draft_approved', 'draft_approved'])
  })

  it('rolls up into hours returned via productivitySummary', () => {
    const s = productivitySummary(timeSavedEventsFromApprovals(['COTIZACION', 'COTIZACION', 'SOP']))
    // 25 + 25 + 12 = 62 min → 1.0h
    expect(s.hoursReturned).toBe(1)
  })

  it('skips unknown kinds', () => {
    expect(timeSavedEventsFromApprovals(['NOT_A_KIND' as never])).toEqual([])
  })
})
