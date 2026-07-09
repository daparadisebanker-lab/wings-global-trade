import { describe, expect, it } from 'vitest'
import { catalogTags, signRevalidatePayload, verifyRevalidateSignature } from './revalidate'

const SECRET = 'test-revalidate-secret'

describe('catalogTags', () => {
  it('always includes the lane tag', () => {
    expect(catalogTags('provisions')).toEqual(['catalog:lane:provisions'])
  })

  it('adds a lane-scoped product tag when productSlug is present', () => {
    expect(catalogTags('provisions', 'arabica-01')).toEqual([
      'catalog:lane:provisions',
      'catalog:product:provisions:arabica-01',
    ])
  })
})

describe('sign/verifyRevalidateSignature', () => {
  const body = JSON.stringify({ laneSlug: 'provisions', productSlug: 'arabica-01' })

  it('accepts a signature produced by signRevalidatePayload for the same body + secret', () => {
    const signature = signRevalidatePayload(body, SECRET)
    expect(verifyRevalidateSignature(body, signature, SECRET)).toBe(true)
  })

  it('rejects a tampered body', () => {
    const signature = signRevalidatePayload(body, SECRET)
    const tampered = JSON.stringify({ laneSlug: 'provisions', productSlug: 'other-product' })
    expect(verifyRevalidateSignature(tampered, signature, SECRET)).toBe(false)
  })

  it('rejects a signature produced with a different secret', () => {
    const signature = signRevalidatePayload(body, 'wrong-secret')
    expect(verifyRevalidateSignature(body, signature, SECRET)).toBe(false)
  })

  it('rejects a missing signature header', () => {
    expect(verifyRevalidateSignature(body, null, SECRET)).toBe(false)
    expect(verifyRevalidateSignature(body, undefined, SECRET)).toBe(false)
  })

  it('rejects a malformed signature header', () => {
    expect(verifyRevalidateSignature(body, 'not-a-real-signature', SECRET)).toBe(false)
    expect(verifyRevalidateSignature(body, 'sha256=short', SECRET)).toBe(false)
  })

  it('fails closed when the secret is not configured', () => {
    const signature = signRevalidatePayload(body, SECRET)
    expect(verifyRevalidateSignature(body, signature, undefined)).toBe(false)
  })

  it('signRevalidatePayload throws without a secret rather than signing insecurely', () => {
    expect(() => signRevalidatePayload(body, undefined)).toThrow()
  })
})
