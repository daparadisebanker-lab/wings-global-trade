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

describe('reconcileWatch — idempotent + honest across runs', () => {
  const mk = (rule: WatchSignal['rule'], severity: WatchSignal['severity'] = 'medio', importRef = 'A'): WatchSignal => ({
    rule, severity, importRef, title: { es: '', en: '' }, detail: { es: '', en: '' },
  })
  const open = (rule: WatchSignal['rule'], severity: WatchSignal['severity'] = 'medio', status: 'OPEN' | 'MUTED' = 'OPEN') => ({
    key: signalKey(mk(rule)), severity, status,
  })

  it('creates only signals with no open match (no duplicate re-ping)', () => {
    const r = reconcileWatch([mk('eta-slip'), mk('rate-expiry')], [open('eta-slip')])
    expect(r.toCreate.map((s) => s.rule)).toEqual(['rate-expiry'])
    expect(r.toEscalate).toEqual([])
    expect(r.resolvedKeys).toEqual([])
  })

  it('escalates an open signal whose severity rose (the ping was going stale)', () => {
    const r = reconcileWatch([mk('eta-slip', 'alto')], [open('eta-slip', 'medio')])
    expect(r.toCreate).toEqual([])
    expect(r.toEscalate.map((s) => s.severity)).toEqual(['alto'])
  })

  it('does not escalate on same or lower severity', () => {
    expect(reconcileWatch([mk('eta-slip', 'medio')], [open('eta-slip', 'alto')]).toEscalate).toEqual([])
  })

  it('resolves an OPEN signal whose exception cleared', () => {
    const r = reconcileWatch([mk('eta-slip')], [open('eta-slip'), open('demurrage')])
    expect(r.resolvedKeys).toEqual(['A:demurrage'])
  })

  it('does NOT re-create a MUTED signal (kill switch survives reconcile), nor resolve it', () => {
    const r = reconcileWatch([mk('demurrage')], [open('demurrage', 'inmediato', 'MUTED')])
    expect(r.toCreate).toEqual([]) // muted → not recreated
    expect(r.resolvedKeys).toEqual([]) // muted → not auto-resolved even if it kept firing
  })
})

describe('robustness — malformed dates never false-fire the budget', () => {
  it('a garbage/datetime date yields NO signal (not a false inmediato)', () => {
    // a full timestamptz on arrivedOn used to make daysBetween NaN → demurrage inmediato
    expect(runWatchRules(base({ arrival: { arrivedOn: 'not-a-date', freeDays: 5 } }))).toEqual([])
    // a timestamptz is tolerated (time dropped), not NaN — 9 days over → still fires
    expect(runWatchRules(base({ arrival: { arrivedOn: '2026-07-15T08:30:00Z', freeDays: 5 } }))[0]).toMatchObject({ rule: 'demurrage', severity: 'inmediato' })
  })
})

describe('rule refinements from review', () => {
  it('demurrage pre-warns (alto) while free days are nearly out, before charges accrue', () => {
    const s = runWatchRules(base({ arrival: { arrivedOn: '2026-07-22', freeDays: 3 } }))[0] // elapsed 2, over -1
    expect(s).toMatchObject({ rule: 'demurrage', severity: 'alto' })
  })

  it('doc-deadline flags an explicit vencido even without a dueDate', () => {
    expect(runWatchRules(base({ requiredDocs: [{ doc: 'BL', status: 'vencido' }] }))[0]).toMatchObject({ severity: 'alto' })
  })

  it('margin-drift has a deadband (a hair under target does not fire)', () => {
    expect(runWatchRules(base({ margin: { current: 0.1799, target: 0.18 } }))).toEqual([]) // within 95% deadband
    expect(runWatchRules(base({ margin: { current: 0.165, target: 0.18 } }))[0]).toMatchObject({ severity: 'medio' }) // 90–95%
    expect(runWatchRules(base({ margin: { current: 0.16, target: 0.18 } }))[0]).toMatchObject({ severity: 'alto' }) // <90%
  })
})
