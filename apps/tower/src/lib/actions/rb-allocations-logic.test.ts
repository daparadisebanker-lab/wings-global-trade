import { describe, expect, it } from 'vitest'
import {
  canTransitionAllocationStatus,
  isRbAllocationStatus,
  nextAllocationStatuses,
  RB_ALLOCATION_STATUSES,
} from './rb-allocations-logic'

describe('canTransitionAllocationStatus', () => {
  it('advances forward along the commitment line', () => {
    expect(canTransitionAllocationStatus('RESERVED', 'CONFIRMED')).toBe(true)
    expect(canTransitionAllocationStatus('CONFIRMED', 'LOADED')).toBe(true)
    expect(canTransitionAllocationStatus('LOADED', 'RELEASED')).toBe(true)
  })
  it('allows the RESERVED→RELEASED expiry/cancel shortcut', () => {
    expect(canTransitionAllocationStatus('RESERVED', 'RELEASED')).toBe(true)
  })
  it('rejects skips over a stage', () => {
    expect(canTransitionAllocationStatus('RESERVED', 'LOADED')).toBe(false)
    expect(canTransitionAllocationStatus('CONFIRMED', 'RELEASED')).toBe(false)
  })
  it('rejects every reversal', () => {
    expect(canTransitionAllocationStatus('CONFIRMED', 'RESERVED')).toBe(false)
    expect(canTransitionAllocationStatus('LOADED', 'CONFIRMED')).toBe(false)
    expect(canTransitionAllocationStatus('RELEASED', 'LOADED')).toBe(false)
    expect(canTransitionAllocationStatus('RELEASED', 'RESERVED')).toBe(false)
  })
  it('treats RELEASED as terminal and rejects no-ops', () => {
    for (const s of RB_ALLOCATION_STATUSES) {
      expect(canTransitionAllocationStatus('RELEASED', s)).toBe(false)
      expect(canTransitionAllocationStatus(s, s)).toBe(false)
    }
  })
})

describe('nextAllocationStatuses', () => {
  it('lists exactly the legal onward flips', () => {
    expect(nextAllocationStatuses('RESERVED')).toEqual(['CONFIRMED', 'RELEASED'])
    expect(nextAllocationStatuses('CONFIRMED')).toEqual(['LOADED'])
    expect(nextAllocationStatuses('LOADED')).toEqual(['RELEASED'])
    expect(nextAllocationStatuses('RELEASED')).toEqual([])
  })
})

describe('isRbAllocationStatus', () => {
  it('guards the shipped 4-state enum', () => {
    expect(isRbAllocationStatus('RESERVED')).toBe(true)
    expect(isRbAllocationStatus('LOADED')).toBe(true)
    expect(isRbAllocationStatus('SHIPPED')).toBe(false)
    expect(isRbAllocationStatus('reserved')).toBe(false)
  })
})
