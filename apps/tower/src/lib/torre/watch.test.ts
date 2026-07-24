// src/lib/torre/watch.test.ts
import { describe, it, expect } from 'vitest'
import { activeRules, partitionByDelivery, reconcileWatch, runWatchRules, signalKey, triageSignals, WATCH_RULES, type WatchInput, type WatchSignal } from './watch'

const TODAY = '2026-07-24'
function base(over: Partial<WatchInput> = {}): WatchInput {
  return { importRef: 'WGT-2026-014', today: TODAY, ...over }
}

describe('watch rules', () => {
  it('exposes the eight v1 rules', () => {
    expect(WATCH_RULES.map((r) => r.id).sort()).toEqual(
      ['demurrage', 'doc-deadline', 'eta-slip', 'margin-drift', 'payment-milestone', 'quote-quiet', 'rate-expiry', 'stale-import'],
    )
  })

  it('eta-slip: fires alto for a >7-day slip, medio for smaller', () => {
    expect(runWatchRules(base({ eta: { planned: '2026-08-01', current: '2026-08-15' } }))[0]).toMatchObject({ rule: 'eta-slip', severity: 'alto' })
    expect(runWatchRules(base({ eta: { planned: '2026-08-01', current: '2026-08-04' } }))[0]).toMatchObject({ rule: 'eta-slip', severity: 'medio' })
    expect(runWatchRules(base({ eta: { planned: '2026-08-04', current: '2026-08-01' } }))).toEqual([]) // earlier ETA = no slip
  })

  it('demurrage: the seeded catch — inmediato once free days are exceeded', () => {
    const s = runWatchRules(base({ arrival: { arrivedOn: '2026-07-15', freeDays: 5 } }))
    expect(s).toHaveLength(1)
    expect(s[0]).toMatchObject({ rule: 'demurrage', severity: 'inmediato' })
    expect(s[0].detail.es).toMatch(/4 día\(s\) sobre los 5/) // 9 elapsed − 5 free = 4 over
    // still within free days → no signal
    expect(runWatchRules(base({ arrival: { arrivedOn: '2026-07-22', freeDays: 5 } }))).toEqual([])
  })

  it('doc-deadline: alto overdue, medio due-soon, bajo when pending w/o deadline', () => {
    expect(runWatchRules(base({ requiredDocs: [{ doc: 'BL', status: 'faltante', dueDate: '2026-07-20' }] }))[0]).toMatchObject({ rule: 'doc-deadline', severity: 'alto' })
    expect(runWatchRules(base({ requiredDocs: [{ doc: 'BL', status: 'faltante', dueDate: '2026-07-26' }] }))[0]).toMatchObject({ severity: 'medio' })
    expect(runWatchRules(base({ requiredDocs: [{ doc: 'BL', status: 'faltante' }] }))[0]).toMatchObject({ severity: 'bajo' })
    expect(runWatchRules(base({ requiredDocs: [{ doc: 'BL', status: 'presente' }] }))).toEqual([]) // all present → nothing
  })

  it('rate-expiry, payment, quote-quiet, margin-drift, stale-import each fire on their trigger', () => {
    expect(runWatchRules(base({ rateValidUntil: '2026-07-20' }))[0]).toMatchObject({ rule: 'rate-expiry', severity: 'medio' })
    expect(runWatchRules(base({ payment: { dueDate: '2026-07-20', paid: false } }))[0]).toMatchObject({ rule: 'payment-milestone', severity: 'alto' })
    expect(runWatchRules(base({ payment: { dueDate: '2026-07-20', paid: true } }))).toEqual([]) // paid → nothing
    expect(runWatchRules(base({ lastQuoteActivity: { sentOn: '2026-07-10', responded: false } }))[0]).toMatchObject({ rule: 'quote-quiet' })
    expect(runWatchRules(base({ margin: { current: 0.05, target: 0.18 } }))[0]).toMatchObject({ rule: 'margin-drift', severity: 'alto' })
    expect(runWatchRules(base({ margin: { current: 0.2, target: 0.18 } }))).toEqual([]) // above target → nothing
    expect(runWatchRules(base({ lastActivityOn: '2026-06-01' }))[0]).toMatchObject({ rule: 'stale-import', severity: 'medio' })
  })
})

describe('triageSignals', () => {
  const mk = (rule: WatchSignal['rule'], severity: WatchSignal['severity'], importRef = 'A'): WatchSignal => ({
    rule, severity, importRef, title: { es: '', en: '' }, detail: { es: '', en: '' },
  })

  it('ranks most-severe first, deterministically', () => {
    const out = triageSignals([mk('stale-import', 'bajo'), mk('demurrage', 'inmediato'), mk('eta-slip', 'medio')])
    expect(out.map((s) => s.severity)).toEqual(['inmediato', 'medio', 'bajo'])
  })

  it('de-dups by (import, rule) keeping the most severe', () => {
    const out = triageSignals([mk('eta-slip', 'medio'), mk('eta-slip', 'alto')])
    expect(out).toHaveLength(1)
    expect(out[0].severity).toBe('alto')
  })
})

describe('partitionByDelivery — the interruption budget', () => {
  const mk = (severity: WatchSignal['severity'], importRef = 'A', rule: WatchSignal['rule'] = 'demurrage'): WatchSignal => ({
    rule, severity, importRef, title: { es: '', en: '' }, detail: { es: '', en: '' },
  })

  it('only inmediato interrupts in real time; the rest batch to the Brief', () => {
    const { realtime, brief } = partitionByDelivery([mk('inmediato'), mk('alto', 'A', 'payment-milestone'), mk('bajo', 'A', 'rate-expiry')])
    expect(realtime.map((s) => s.severity)).toEqual(['inmediato'])
    expect(brief.map((s) => s.severity).sort()).toEqual(['alto', 'bajo'])
  })

  it('caps real-time pings per import (≤1 by default), demoting the excess to the Brief', () => {
    const { realtime, brief } = partitionByDelivery([mk('inmediato', 'A', 'demurrage'), mk('inmediato', 'A', 'payment-milestone')])
    expect(realtime).toHaveLength(1)
    expect(brief).toHaveLength(1) // second inmediato on the same import batches
  })

  it('lets different imports each fire one real-time ping', () => {
    const { realtime } = partitionByDelivery([mk('inmediato', 'A'), mk('inmediato', 'B')])
    expect(realtime).toHaveLength(2)
  })
})

describe('kill switches (activeRules)', () => {
  it('drops disabled rules so they never fire', () => {
    const rules = activeRules(['demurrage'])
    expect(rules.map((r) => r.id)).not.toContain('demurrage')
    // a snapshot that WOULD trigger demurrage now yields nothing from the filtered set
    expect(runWatchRules(base({ arrival: { arrivedOn: '2026-07-01', freeDays: 5 } }), rules)).toEqual([])
  })
})

describe('reconcileWatch — idempotent across runs', () => {
  const mk = (rule: WatchSignal['rule'], importRef = 'A'): WatchSignal => ({
    rule, severity: 'medio', importRef, title: { es: '', en: '' }, detail: { es: '', en: '' },
  })

  it('creates only signals with no open match (no duplicate re-ping)', () => {
    const detected = [mk('eta-slip'), mk('rate-expiry')]
    const open = new Set([signalKey(mk('eta-slip'))]) // eta-slip already open
    const r = reconcileWatch(detected, open)
    expect(r.toCreate.map((s) => s.rule)).toEqual(['rate-expiry'])
    expect(r.resolvedKeys).toEqual([])
  })

  it('resolves an open signal whose exception cleared', () => {
    const detected = [mk('eta-slip')]
    const open = [signalKey(mk('eta-slip')), signalKey(mk('demurrage'))] // demurrage no longer detected
    const r = reconcileWatch(detected, open)
    expect(r.toCreate).toEqual([])
    expect(r.resolvedKeys).toEqual(['A:demurrage'])
  })
})
