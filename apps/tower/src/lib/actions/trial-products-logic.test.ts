import { describe, expect, it } from 'vitest'
import {
  trialProductSchema,
  parseSpecs,
  mapTrialRow,
  buildTrialImagePath,
  isOwnTrialImagePath,
} from './trial-products-logic'

const UID = '11111111-1111-1111-1111-111111111111'
const IMG = '22222222-2222-2222-2222-222222222222'
const OTHER = '99999999-9999-9999-9999-999999999999'

describe('trialProductSchema', () => {
  it('accepts a minimal valid trial (name only)', () => {
    expect(trialProductSchema.safeParse({ name: 'Bomba' }).success).toBe(true)
  })
  it('accepts a well-formed imagePath but rejects a malformed / traversal one', () => {
    expect(trialProductSchema.safeParse({ name: 'x', imagePath: `${UID}/${IMG}.png` }).success).toBe(true)
    expect(trialProductSchema.safeParse({ name: 'x', imagePath: `${UID}/../${OTHER}/x.png` }).success).toBe(false)
    expect(trialProductSchema.safeParse({ name: 'x', imagePath: 'anything/else.txt' }).success).toBe(false)
  })
  it('rejects a non-uuid id', () => {
    expect(trialProductSchema.safeParse({ id: 'not-a-uuid', name: 'x' }).success).toBe(false)
  })
  it('rejects an empty name and over-long / too-many specs', () => {
    expect(trialProductSchema.safeParse({ name: '' }).success).toBe(false)
    expect(trialProductSchema.safeParse({ name: 'x', specs: Array.from({ length: 7 }, () => ({ label: 'a', value: 'b' })) }).success).toBe(false)
  })
})

describe('parseSpecs', () => {
  it('keeps well-formed {label,value} entries and drops the rest', () => {
    expect(
      parseSpecs([{ label: 'Caudal', value: '5 m³/h' }, { label: '', value: 'x' }, 'nope', { label: 'a' }, null]),
    ).toEqual([{ label: 'Caudal', value: '5 m³/h' }])
  })
  it('is empty for non-arrays', () => {
    expect(parseSpecs(null)).toEqual([])
    expect(parseSpecs({ a: 1 })).toEqual([])
  })
})

describe('mapTrialRow', () => {
  it('maps snake→camel and parses specs', () => {
    expect(
      mapTrialRow({
        id: 't1',
        name: 'Bomba',
        category: 'Riego',
        specs: [{ label: 'Caudal', value: '5' }],
        price_note: null,
        moq: '100',
        image_path: `${UID}/${IMG}.png`,
        created_at: 'c',
        updated_at: 'u',
      }),
    ).toEqual({
      id: 't1',
      name: 'Bomba',
      category: 'Riego',
      specs: [{ label: 'Caudal', value: '5' }],
      priceNote: null,
      moq: '100',
      imagePath: `${UID}/${IMG}.png`,
      createdAt: 'c',
      updatedAt: 'u',
    })
  })
})

describe('buildTrialImagePath', () => {
  it('builds an owner-prefixed path', () => {
    expect(buildTrialImagePath(UID, IMG, 'png')).toBe(`${UID}/${IMG}.png`)
  })
  it('rejects non-uuid segments (no attacker-chosen path)', () => {
    expect(() => buildTrialImagePath('../etc', IMG, 'png')).toThrow()
    expect(() => buildTrialImagePath(UID, 'x/y', 'png')).toThrow()
  })
})

describe('isOwnTrialImagePath', () => {
  it('is true only for a well-formed key under the caller own uuid', () => {
    expect(isOwnTrialImagePath(UID, `${UID}/${IMG}.png`)).toBe(true)
    expect(isOwnTrialImagePath(UID, `${OTHER}/${IMG}.png`)).toBe(false)
    expect(isOwnTrialImagePath('not-a-uuid', `not-a-uuid/x.png`)).toBe(false)
  })
  it('rejects path traversal that would escape the prefix or the bucket', () => {
    expect(isOwnTrialImagePath(UID, `${UID}/../${OTHER}/${IMG}.png`)).toBe(false)
    expect(isOwnTrialImagePath(UID, `${UID}/../../rep-assets/rep/${OTHER}/signature.png`)).toBe(false)
    expect(isOwnTrialImagePath(UID, `${UID}/${IMG}.png/../x.png`)).toBe(false)
    expect(isOwnTrialImagePath(UID, `${UID}/${IMG}.txt`)).toBe(false) // wrong ext
  })
})
