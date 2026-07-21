import { describe, expect, it } from 'vitest'
import {
  buildRepSignaturePath,
  repProfileUpdateSchema,
  E164_REGEX,
  REP_ASSET_BUCKET,
} from './rep-profile-logic'

const UUID = '11111111-1111-4111-8111-111111111111'

describe('buildRepSignaturePath', () => {
  it('builds a deterministic rep/{userId}/signature.{ext} path', () => {
    expect(buildRepSignaturePath(UUID, 'svg')).toBe(`rep/${UUID}/signature.svg`)
    expect(buildRepSignaturePath(UUID, 'png')).toBe(`rep/${UUID}/signature.png`)
  })
  it('always yields exactly three path segments (no traversal surface)', () => {
    expect(buildRepSignaturePath(UUID, 'png').split('/')).toHaveLength(3)
  })
  it('throws on a non-uuid userId so a segment can never be attacker-chosen', () => {
    expect(() => buildRepSignaturePath('../evil', 'svg')).toThrow()
    expect(() => buildRepSignaturePath('not-a-uuid', 'png')).toThrow()
    expect(() => buildRepSignaturePath('', 'svg')).toThrow()
  })
})

describe('REP_ASSET_BUCKET', () => {
  it('is the private rep-assets bucket', () => {
    expect(REP_ASSET_BUCKET).toBe('rep-assets')
  })
})

describe('E164_REGEX', () => {
  it('accepts well-formed E.164 numbers', () => {
    expect(E164_REGEX.test('+51987654321')).toBe(true)
    expect(E164_REGEX.test('+14155552671')).toBe(true)
  })
  it('rejects malformed numbers', () => {
    expect(E164_REGEX.test('51987654321')).toBe(false) // no '+'
    expect(E164_REGEX.test('+0123456789')).toBe(false) // leading zero country digit
    expect(E164_REGEX.test('+123')).toBe(false) // too short
    expect(E164_REGEX.test('+1 415 555 2671')).toBe(false) // spaces
  })
})

describe('repProfileUpdateSchema', () => {
  it('accepts a full valid payload', () => {
    const r = repProfileUpdateSchema.safeParse({
      display_name: 'Ana Vega',
      title: 'Trade Manager',
      whatsapp_e164: '+51987654321',
      whatsapp_label: 'Lima desk',
    })
    expect(r.success).toBe(true)
  })
  it('accepts an empty payload and explicit nulls (fields optional/nullable)', () => {
    expect(repProfileUpdateSchema.safeParse({}).success).toBe(true)
    expect(
      repProfileUpdateSchema.safeParse({ display_name: null, whatsapp_e164: null }).success,
    ).toBe(true)
  })
  it('rejects a non-E.164 whatsapp number', () => {
    const r = repProfileUpdateSchema.safeParse({ whatsapp_e164: '987-654-321' })
    expect(r.success).toBe(false)
  })
})
