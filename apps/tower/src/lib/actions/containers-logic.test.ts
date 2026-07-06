import { describe, expect, it } from 'vitest'
import {
  buildTradeDocumentStoragePath,
  canAdvancePoStatus,
  canTransitionContainerStatus,
  computeContainerCapabilities,
  computeFillPercent,
  computeLandedCostTotal,
  computeNextContainerCode,
  landedCostPerUnitMinor,
  parseDecimalToMinor,
  sumCommittedCbm,
  wouldExceedCapacity,
} from './containers-logic'
import { decodeContainerCursor, encodeContainerCursor } from './containers-cursor'

describe('containers-logic · fill-percent computation', () => {
  it('computes a simple percentage', () => {
    expect(computeFillPercent(20, 40)).toBe(50)
    expect(computeFillPercent(0, 40)).toBe(0)
    expect(computeFillPercent(40, 40)).toBe(100)
  })

  it('clamps at 100 even if over-committed data slips through', () => {
    expect(computeFillPercent(50, 40)).toBe(100)
  })

  it('never divides by zero — non-positive capacity is 0%, not NaN/Infinity', () => {
    expect(computeFillPercent(10, 0)).toBe(0)
    expect(computeFillPercent(10, -5)).toBe(0)
  })

  it('rounds to 2 decimals', () => {
    expect(computeFillPercent(1, 3)).toBe(33.33)
  })

  it('sums only CBM-bearing commitment statuses (RESERVED/CONFIRMED/LOADED, never RELEASED)', () => {
    const commitments = [
      { cbm: 10, status: 'RESERVED' as const },
      { cbm: 5, status: 'CONFIRMED' as const },
      { cbm: 8, status: 'LOADED' as const },
      { cbm: 100, status: 'RELEASED' as const },
    ]
    expect(sumCommittedCbm(commitments)).toBe(23)
  })

  it('flags an incoming commitment that would exceed capacity (optimistic UI hint)', () => {
    expect(wouldExceedCapacity(30, 40, 5)).toBe(false)
    expect(wouldExceedCapacity(30, 40, 15)).toBe(true)
    expect(wouldExceedCapacity(30, 40, 10)).toBe(false) // exactly at capacity is allowed
  })
})

describe('containers-logic · landed cost (ADR-7 integer minor units)', () => {
  it('sums the five cost components via lib/money#addMinor', () => {
    const total = computeLandedCostTotal({
      fobMinor: 500_000,
      freightMinor: 120_000,
      insuranceMinor: 8_000,
      dutiesMinor: 45_000,
      handlingMinor: 12_000,
      currency: 'USD',
    })
    expect(total).toEqual({ minor: 685_000, currency: 'USD' })
  })

  it('rejects a non-integer component (a float touching money is a bug)', () => {
    expect(() =>
      computeLandedCostTotal({
        fobMinor: 500_000.5,
        freightMinor: 0,
        insuranceMinor: 0,
        dutiesMinor: 0,
        handlingMinor: 0,
        currency: 'USD',
      }),
    ).toThrow()
  })

  it('divides landed cost by a quantity, rounding to the nearest minor unit', () => {
    expect(landedCostPerUnitMinor(100_000, 4)).toBe(25_000)
    expect(landedCostPerUnitMinor(100_000, 3)).toBe(33_333) // 33333.33 -> 33333
  })

  it('rejects a non-positive quantity and a non-integer total', () => {
    expect(() => landedCostPerUnitMinor(100_000, 0)).toThrow()
    expect(() => landedCostPerUnitMinor(100_000, -1)).toThrow()
    expect(() => landedCostPerUnitMinor(100_000.5, 4)).toThrow()
  })
})

describe('containers-logic · decimal money input parsing', () => {
  it('parses a 2-decimal amount to integer minor units', () => {
    expect(parseDecimalToMinor('1250.50')).toBe(125_050)
    expect(parseDecimalToMinor('0')).toBe(0)
    expect(parseDecimalToMinor('42')).toBe(4_200)
    expect(parseDecimalToMinor('1.1')).toBe(110)
  })

  it('rejects negatives, garbage, and more than 2 decimals', () => {
    expect(parseDecimalToMinor('-5')).toBeNull()
    expect(parseDecimalToMinor('abc')).toBeNull()
    expect(parseDecimalToMinor('1.234')).toBeNull()
    expect(parseDecimalToMinor('')).toBeNull()
  })
})

describe('containers-logic · container code issuance (append-only)', () => {
  it('issues the next zero-padded sequence for a lane code', () => {
    expect(computeNextContainerCode('WGT/02', 0)).toBe('WGT/02-C001')
    expect(computeNextContainerCode('WGT/02', 13)).toBe('WGT/02-C014')
    expect(computeNextContainerCode('WGT/01', 99)).toBe('WGT/01-C100')
  })
})

describe('containers-logic · container status pipeline (forward-only)', () => {
  it('allows forward moves, including skips', () => {
    expect(canTransitionContainerStatus('OPEN', 'FILLING')).toBe(true)
    expect(canTransitionContainerStatus('OPEN', 'BOOKED')).toBe(true)
    expect(canTransitionContainerStatus('FILLING', 'CLOSED')).toBe(true)
  })

  it('rejects backward moves and no-ops', () => {
    expect(canTransitionContainerStatus('BOOKED', 'OPEN')).toBe(false)
    expect(canTransitionContainerStatus('OPEN', 'OPEN')).toBe(false)
    expect(canTransitionContainerStatus('CLOSED', 'ARRIVED')).toBe(false)
  })
})

describe('containers-logic · PO status pipeline', () => {
  it('allows forward progression', () => {
    expect(canAdvancePoStatus('ISSUED', 'CONFIRMED')).toBe(true)
    expect(canAdvancePoStatus('CONFIRMED', 'QC_PENDING')).toBe(true)
  })

  it('rejects backward moves', () => {
    expect(canAdvancePoStatus('QC_PENDING', 'CONFIRMED')).toBe(false)
  })

  it('allows cancellation from any non-terminal state, never from SHIPPED or CANCELLED', () => {
    expect(canAdvancePoStatus('ISSUED', 'CANCELLED')).toBe(true)
    expect(canAdvancePoStatus('QC_PENDING', 'CANCELLED')).toBe(true)
    expect(canAdvancePoStatus('SHIPPED', 'CANCELLED')).toBe(false)
    expect(canAdvancePoStatus('CANCELLED', 'CANCELLED')).toBe(false)
  })

  it('a shipped or cancelled PO can never advance further', () => {
    expect(canAdvancePoStatus('SHIPPED', 'CONFIRMED')).toBe(false)
    expect(canAdvancePoStatus('CANCELLED', 'CONFIRMED')).toBe(false)
  })
})

describe('containers-logic · capabilities (presentation-only, mirrors RLS + the SQL fn guard)', () => {
  it('no memberships and not a group admin → nothing', () => {
    expect(computeContainerCapabilities([], false)).toEqual({ canWrite: false, canCommit: false })
  })

  it('TRADE_OPS can write and commit', () => {
    expect(computeContainerCapabilities(['TRADE_OPS'], false)).toEqual({ canWrite: true, canCommit: true })
  })

  it('LANE_DIRECTOR can write and commit', () => {
    expect(computeContainerCapabilities(['LANE_DIRECTOR'], false)).toEqual({ canWrite: true, canCommit: true })
  })

  it('SALES can commit CBM but cannot write (open/PO/QC/documents)', () => {
    expect(computeContainerCapabilities(['SALES'], false)).toEqual({ canWrite: false, canCommit: true })
  })

  it('CATALOG_EDITOR/VIEWER get neither', () => {
    expect(computeContainerCapabilities(['CATALOG_EDITOR'], false)).toEqual({ canWrite: false, canCommit: false })
    expect(computeContainerCapabilities(['VIEWER'], false)).toEqual({ canWrite: false, canCommit: false })
  })

  it('a group admin gets everything even with zero membership rows', () => {
    expect(computeContainerCapabilities([], true)).toEqual({ canWrite: true, canCommit: true })
  })
})

describe('containers-logic · cursor pagination', () => {
  it('round-trips a cursor through encode/decode', () => {
    const cursor = { createdAt: '2026-07-06T12:00:00.000Z', id: 'abc-123' }
    expect(decodeContainerCursor(encodeContainerCursor(cursor))).toEqual(cursor)
  })

  it('decodes null/undefined/garbage safely to null', () => {
    expect(decodeContainerCursor(null)).toBeNull()
    expect(decodeContainerCursor(undefined)).toBeNull()
    expect(decodeContainerCursor('not-base64-json')).toBeNull()
  })
})

describe('containers-logic · trade document storage path convention', () => {
  it('produces a stable, sanitized, kind-scoped path', () => {
    const path = buildTradeDocumentStoragePath({
      brandSlug: 'wings',
      laneSlug: 'machinery',
      containerCode: 'WGT/01-C014',
      kind: 'BL',
      fileName: 'Bill of Lading (final) #1.pdf',
    })
    expect(path).toMatch(/^wings\/machinery\/WGT-01-C014\/bl\/\d+-bill-of-lading--final---1\.pdf$/)
  })
})
