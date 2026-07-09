import { describe, expect, it } from 'vitest'
import {
  LANE_ROLES,
  isLaneRole,
  canTransitionLaneStatus,
  nextLaneStatuses,
  canTransitionBrandStatus,
  suggestLanePrefix,
  nextLaneCode,
  diffMemberships,
  slugify,
  SLUG_RE,
  LANE_CODE_PREFIX_RE,
  type MembershipKey,
} from './admin-logic'

describe('admin-logic · lane roles', () => {
  it('exposes exactly the five DB membership roles (no group admin)', () => {
    expect([...LANE_ROLES]).toEqual(['LANE_DIRECTOR', 'CATALOG_EDITOR', 'TRADE_OPS', 'SALES', 'VIEWER'])
    expect(LANE_ROLES).not.toContain('GROUP_ADMIN')
  })
  it('isLaneRole guards against unknown values', () => {
    expect(isLaneRole('LANE_DIRECTOR')).toBe(true)
    expect(isLaneRole('lane_director')).toBe(false)
    expect(isLaneRole('ADMIN')).toBe(false)
  })
})

describe('admin-logic · lane status (OPENING → ACTIVE → ARCHIVED, forward-only)', () => {
  it('permits strictly forward flips, including the skip', () => {
    expect(canTransitionLaneStatus('OPENING', 'ACTIVE')).toBe(true)
    expect(canTransitionLaneStatus('ACTIVE', 'ARCHIVED')).toBe(true)
    expect(canTransitionLaneStatus('OPENING', 'ARCHIVED')).toBe(true)
  })
  it('rejects reversals and no-ops', () => {
    expect(canTransitionLaneStatus('ACTIVE', 'OPENING')).toBe(false)
    expect(canTransitionLaneStatus('ARCHIVED', 'ACTIVE')).toBe(false)
    expect(canTransitionLaneStatus('ACTIVE', 'ACTIVE')).toBe(false)
  })
  it('offers only legal next states; ARCHIVED is terminal', () => {
    expect(nextLaneStatuses('OPENING')).toEqual(['ACTIVE', 'ARCHIVED'])
    expect(nextLaneStatuses('ACTIVE')).toEqual(['ARCHIVED'])
    expect(nextLaneStatuses('ARCHIVED')).toEqual([])
  })
})

describe('admin-logic · brand status (retire, never delete)', () => {
  it('flips between ACTIVE and RETIRED but never a no-op', () => {
    expect(canTransitionBrandStatus('ACTIVE', 'RETIRED')).toBe(true)
    expect(canTransitionBrandStatus('RETIRED', 'ACTIVE')).toBe(true)
    expect(canTransitionBrandStatus('ACTIVE', 'ACTIVE')).toBe(false)
  })
})

describe('admin-logic · lane code allocation (append-only WGT/NN)', () => {
  it('derives the prefix from an existing brand code first', () => {
    expect(suggestLanePrefix('wings', ['WGT/01', 'WGT/02'])).toBe('WGT')
    expect(suggestLanePrefix('aladin', ['ALD/01'])).toBe('ALD')
  })
  it('falls back to a known-brand hint, then to slug letters', () => {
    expect(suggestLanePrefix('wings', [])).toBe('WGT')
    expect(suggestLanePrefix('aladin', [])).toBe('ALD')
    expect(suggestLanePrefix('medical', [])).toBe('MED')
    expect(suggestLanePrefix('x', [])).toBe('XX')
  })
  it('allocates the next zero-padded code for the prefix only', () => {
    expect(nextLaneCode([], 'WGT')).toBe('WGT/01')
    expect(nextLaneCode(['WGT/01', 'WGT/02'], 'WGT')).toBe('WGT/03')
    // codes of other brands never affect this brand's numbering
    expect(nextLaneCode(['WGT/01', 'ALD/01', 'ALD/02'], 'ALD')).toBe('ALD/03')
    // append-only: a gap left by an archived lane is NOT reused
    expect(nextLaneCode(['WGT/01', 'WGT/05'], 'WGT')).toBe('WGT/06')
  })
  it('crosses into three digits past 99', () => {
    expect(nextLaneCode(['WGT/99'], 'WGT')).toBe('WGT/100')
  })
  it('validates prefix format', () => {
    expect(LANE_CODE_PREFIX_RE.test('WGT')).toBe(true)
    expect(LANE_CODE_PREFIX_RE.test('W')).toBe(false)
    expect(LANE_CODE_PREFIX_RE.test('wgt')).toBe(false)
    expect(LANE_CODE_PREFIX_RE.test('TOOLONG')).toBe(false)
  })
})

describe('admin-logic · membership grid diff', () => {
  const a: MembershipKey = { laneId: 'l1', role: 'CATALOG_EDITOR' }
  const b: MembershipKey = { laneId: 'l1', role: 'SALES' }
  const c: MembershipKey = { laneId: 'l2', role: 'VIEWER' }

  it('computes minimal add/remove', () => {
    const { toAdd, toRemove } = diffMemberships([a, b], [a, c])
    expect(toAdd).toEqual([c])
    expect(toRemove).toEqual([b])
  })
  it('is a no-op when current equals desired', () => {
    const { toAdd, toRemove } = diffMemberships([a, b], [b, a])
    expect(toAdd).toEqual([])
    expect(toRemove).toEqual([])
  })
  it('de-duplicates a doubled desired cell (never a duplicate insert)', () => {
    const { toAdd } = diffMemberships([], [a, { ...a }])
    expect(toAdd).toEqual([a])
  })
  it('removes everything when the desired grid is cleared', () => {
    const { toAdd, toRemove } = diffMemberships([a, b, c], [])
    expect(toAdd).toEqual([])
    expect(toRemove).toEqual([a, b, c])
  })
})

describe('admin-logic · slug', () => {
  it('kebab-cases and strips diacritics', () => {
    expect(slugify('Máquinas Pesadas')).toBe('maquinas-pesadas')
    expect(slugify('  Trade & Co  ')).toBe('trade-co')
  })
  it('SLUG_RE accepts kebab-case, rejects otherwise', () => {
    expect(SLUG_RE.test('machinery')).toBe(true)
    expect(SLUG_RE.test('med-clinical')).toBe(true)
    expect(SLUG_RE.test('Machinery')).toBe(false)
    expect(SLUG_RE.test('a--b')).toBe(false)
  })
})
