import { describe, expect, it } from 'vitest'
import { derivePhase, reachedPhases, phaseSetFor, PHASE_SETS, planAdvancement } from './phases'
import { signCommitment, verifyCommitment, type CommitmentPayload } from './signature'

describe('derivePhase', () => {
  it('a freshly committed quote is COTIZACION_RECIBIDA', () => {
    expect(derivePhase({ quoteStatus: 'SENT' })).toBe('COTIZACION_RECIBIDA')
  })
  it('an accepted quote / created order is ACEPTADA', () => {
    expect(derivePhase({ quoteStatus: 'ACCEPTED' })).toBe('ACEPTADA')
    expect(derivePhase({ quoteStatus: 'SENT', orderStatus: 'CONTRACTED' })).toBe('ACEPTADA')
  })
  it('explicit hitos advance beyond the status-derived phase', () => {
    expect(
      derivePhase({ quoteStatus: 'ACCEPTED', orderStatus: 'CONTRACTED', milestonePhases: ['EN_ORIGEN', 'ASEGURADO', 'BL_LIBERADO'] }),
    ).toBe('BL_LIBERADO')
  })
  it('container status drives transit → nationalized', () => {
    expect(derivePhase({ quoteStatus: 'ACCEPTED', containerStatus: 'IN_TRANSIT' })).toBe('EN_TRANSITO')
    expect(derivePhase({ quoteStatus: 'ACCEPTED', containerStatus: 'ARRIVED' })).toBe('ARRIBO')
    expect(derivePhase({ quoteStatus: 'ACCEPTED', containerStatus: 'CLEARED' })).toBe('NACIONALIZADO')
  })
  it('delivered order is the terminal phase', () => {
    expect(derivePhase({ quoteStatus: 'ACCEPTED', orderStatus: 'DELIVERED', containerStatus: 'CLEARED' })).toBe('ENTREGADO')
  })
  it('takes the furthest reached phase, not the latest event', () => {
    // BL liberado recorded, but container already cleared → NACIONALIZADO wins
    expect(
      derivePhase({ quoteStatus: 'ACCEPTED', containerStatus: 'CLEARED', milestonePhases: ['BL_LIBERADO'] }),
    ).toBe('NACIONALIZADO')
  })
  it('respects the archetype phase set (CREDENTIAL skips container phases)', () => {
    // a container hito can't advance a CREDENTIAL journey past its allowed set
    expect(derivePhase({ quoteStatus: 'ACCEPTED', containerStatus: 'IN_TRANSIT' }, 'CREDENTIAL')).toBe('ACEPTADA')
    expect(phaseSetFor('CREDENTIAL')).toEqual(PHASE_SETS.CREDENTIAL)
    expect(phaseSetFor('unknown-key')).toEqual(PHASE_SETS.STANDARD_IMPORT)
  })
  it('reachedPhases always includes the base phase', () => {
    expect(reachedPhases({ quoteStatus: 'DRAFT' }).has('COTIZACION_RECIBIDA')).toBe(true)
  })
})

describe('planAdvancement (deterministic auto-advance decision)', () => {
  it('advances forward when live state outranks the cached phase', () => {
    // cache is COTIZACION_RECIBIDA but the container is already in transit
    const plan = planAdvancement('COTIZACION_RECIBIDA', { quoteStatus: 'ACCEPTED', containerStatus: 'IN_TRANSIT' })
    expect(plan).toEqual({ advance: true, fromPhase: 'COTIZACION_RECIBIDA', toPhase: 'EN_TRANSITO' })
  })

  it('is a no-op when the cache already equals the derived phase (idempotent)', () => {
    const plan = planAdvancement('EN_TRANSITO', { quoteStatus: 'ACCEPTED', containerStatus: 'IN_TRANSIT' })
    expect(plan.advance).toBe(false)
    expect(plan.toPhase).toBe('EN_TRANSITO')
  })

  it('never rewinds — a cache ahead of live state stays put', () => {
    // cache says NACIONALIZADO; live state only proves ACEPTADA → hold, do not rewind
    const plan = planAdvancement('NACIONALIZADO', { quoteStatus: 'ACCEPTED' })
    expect(plan.advance).toBe(false)
    expect(plan.toPhase).toBe('NACIONALIZADO')
  })

  it('jumps straight to the furthest reached phase (multi-step)', () => {
    const plan = planAdvancement('ACEPTADA', { quoteStatus: 'ACCEPTED', containerStatus: 'CLEARED' })
    expect(plan).toEqual({ advance: true, fromPhase: 'ACEPTADA', toPhase: 'NACIONALIZADO' })
  })

  it('honors the archetype phase set — a container hito cannot advance CREDENTIAL', () => {
    const plan = planAdvancement('ACEPTADA', { quoteStatus: 'ACCEPTED', containerStatus: 'IN_TRANSIT' }, 'CREDENTIAL')
    expect(plan.advance).toBe(false)
  })

  it('advances to the terminal phase on delivery', () => {
    const plan = planAdvancement('NACIONALIZADO', { quoteStatus: 'ACCEPTED', orderStatus: 'DELIVERED' })
    expect(plan).toEqual({ advance: true, fromPhase: 'NACIONALIZADO', toPhase: 'ENTREGADO' })
  })
})

describe('rep commitment signature', () => {
  const secret = 'test-secret'
  const payload: CommitmentPayload = { signedBy: 'rep-1', cifMinor: 9_027_000, currency: 'USD', signedAt: '2026-07-20T00:00:00Z' }

  it('verifies a signature it produced', () => {
    const c = signCommitment(payload, secret)
    expect(c.alg).toBe('HMAC-SHA256')
    expect(verifyCommitment(c, secret)).toBe(true)
  })
  it('fails if the signed figure is tampered with', () => {
    const c = signCommitment(payload, secret)
    expect(verifyCommitment({ ...c, cifMinor: 9_026_999 }, secret)).toBe(false)
  })
  it('fails under a different secret or a different rep', () => {
    const c = signCommitment(payload, secret)
    expect(verifyCommitment(c, 'other-secret')).toBe(false)
    expect(verifyCommitment({ ...c, signedBy: 'rep-2' }, secret)).toBe(false)
  })
})
