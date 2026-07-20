import { describe, expect, it } from 'vitest'
import {
  canTransitionRbStatus,
  computeRbCapabilities,
  contrastRatio,
  hueSeparation,
  nextRbCode,
  rbDiffMemberships,
  rbKitSchema,
  tintStrength,
  validateKit,
  type RbKit,
} from './represented-brands-logic'

describe('canTransitionRbStatus', () => {
  const kit = { kitComplete: true }
  const noKit = { kitComplete: false }

  it('moves forward along the onboarding line', () => {
    expect(canTransitionRbStatus('PROSPECT', 'NEGOTIATION', noKit)).toBe(true)
    expect(canTransitionRbStatus('SIGNED', 'ONBOARDING', noKit)).toBe(true)
  })
  it('gates BRAND_REVIEW and beyond on a complete kit', () => {
    expect(canTransitionRbStatus('ONBOARDING', 'BRAND_REVIEW', noKit)).toBe(false)
    expect(canTransitionRbStatus('ONBOARDING', 'BRAND_REVIEW', kit)).toBe(true)
    expect(canTransitionRbStatus('BRAND_REVIEW', 'LIVE', noKit)).toBe(false)
    expect(canTransitionRbStatus('BRAND_REVIEW', 'LIVE', kit)).toBe(true)
  })
  it('allows the reinstatable PAUSED<->LIVE pair (reinstate needs a kit)', () => {
    expect(canTransitionRbStatus('LIVE', 'PAUSED', kit)).toBe(true)
    expect(canTransitionRbStatus('PAUSED', 'LIVE', kit)).toBe(true)
    expect(canTransitionRbStatus('PAUSED', 'LIVE', noKit)).toBe(false)
  })
  it('permits ENDED from anywhere but never out of ENDED, and rejects no-ops/reversals', () => {
    expect(canTransitionRbStatus('LIVE', 'ENDED', kit)).toBe(true)
    expect(canTransitionRbStatus('ENDED', 'LIVE', kit)).toBe(false)
    expect(canTransitionRbStatus('LIVE', 'LIVE', kit)).toBe(false)
    expect(canTransitionRbStatus('BRAND_REVIEW', 'ONBOARDING', kit)).toBe(false)
  })
})

describe('nextRbCode', () => {
  it('mints append-only RB/xx codes', () => {
    expect(nextRbCode([])).toBe('RB/01')
    expect(nextRbCode(['RB/01', 'RB/02', 'WGT/09'])).toBe('RB/03')
  })
})

describe('colour math', () => {
  it('contrastRatio: white on black is 21, identical is 1', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0)
    expect(contrastRatio('#123456', '#123456')).toBeCloseTo(1, 5)
  })
  it('hueSeparation is symmetric and wraps', () => {
    expect(hueSeparation('#ff0000', '#00ff00')).toBeCloseTo(120, 0) // red vs green
    expect(hueSeparation('#ff0000', '#ff0000')).toBe(0)
  })
  it('tintStrength: pure white is 0, a light tint is small', () => {
    expect(tintStrength('#ffffff')).toBe(0)
    expect(tintStrength('#fbfafa')).toBeLessThan(0.04)
  })
})

const goodKit: RbKit = {
  tokens: {
    accent: '#8a5a12', // dark brass
    'accent-ink': '#ffffff',
    'accent-2': '#2f6f6a',
    ink: '#161310',
    'surface-tint': '#fbfaf8',
  },
  logo: { isologo: 'a', positivo: 'b', isotipo: 'c', sello: 'd' },
  photography: {
    hero: [
      { path: 'h1', source: 'brand_supplied' },
      { path: 'h2', source: 'brand_supplied' },
      { path: 'h3', source: 'wings_studio' },
    ],
    about: [
      { path: 'a1', source: 'brand_supplied' },
      { path: 'a2', source: 'wings_studio' },
    ],
  },
  docs: {
    mandateLetter: { path: 'm', publicCopy: false },
    usageManual: { path: 'u', publicCopy: true },
  },
}

describe('rbKitSchema', () => {
  it('accepts a complete kit and enforces the photo minimums', () => {
    expect(rbKitSchema.safeParse(goodKit).success).toBe(true)
    const thin = { ...goodKit, photography: { ...goodKit.photography, hero: goodKit.photography.hero.slice(0, 2) } }
    expect(rbKitSchema.safeParse(thin).success).toBe(false) // hero < 3
  })
})

describe('validateKit', () => {
  it('passes a legible, restrained kit', () => {
    const v = validateKit(goodKit)
    expect(v.ok).toBe(true)
    expect(v.kitComplete).toBe(true)
  })
  it('fails when accent-ink does not reach 4.5:1 on accent', () => {
    const bad = { ...goodKit, tokens: { ...goodKit.tokens, accent: '#cccccc', 'accent-ink': '#ffffff' } }
    const v = validateKit(bad)
    expect(v.ok).toBe(false)
    expect(v.errors.some((e) => e.includes('4.5:1'))).toBe(true)
  })
  it('fails a too-strong surface tint and a too-close accent hue', () => {
    expect(validateKit({ ...goodKit, tokens: { ...goodKit.tokens, 'surface-tint': '#e8d8b0' } }).ok).toBe(false)
    // accent hue within 30° of an existing accent
    expect(validateKit(goodKit, ['#8a6a20']).ok).toBe(false)
    expect(validateKit(goodKit, ['#2050ff']).ok).toBe(true)
  })
})

describe('rbDiffMemberships', () => {
  it('computes minimal add/remove keyed by brand', () => {
    const { toAdd, toRemove } = rbDiffMemberships(
      [{ brandId: 'x', role: 'BRAND_MANAGER' }],
      [
        { brandId: 'x', role: 'BRAND_MANAGER' },
        { brandId: 'y', role: 'BRAND_OPS' },
      ],
    )
    expect(toAdd).toEqual([{ brandId: 'y', role: 'BRAND_OPS' }])
    expect(toRemove).toEqual([])
  })
})

describe('computeRbCapabilities', () => {
  it('publish needs manager + complete kit (or group admin)', () => {
    expect(computeRbCapabilities(['BRAND_MANAGER'], false, true).canPublishBrand).toBe(true)
    expect(computeRbCapabilities(['BRAND_MANAGER'], false, false).canPublishBrand).toBe(false)
    expect(computeRbCapabilities([], true, false).canPublishBrand).toBe(true)
    expect(computeRbCapabilities(['BRAND_OPS'], false, true).canPublishBrand).toBe(false)
    expect(computeRbCapabilities(['BRAND_OPS'], false, true).canManageContainers).toBe(true)
  })
})
