// Pins the public-asset passthrough in createRbAssetDownloadUrl: a same-origin
// public path (a leading-slash web asset served from apps/tower/public, e.g. a
// seeded Áladín logo) is returned unchanged — no bucket, no signing, no manager
// gate — while a scheme/host-bearing or protocol-relative path is NEVER echoed.
// Both asserted branches return before any Supabase/service call, so no mocks.
import { describe, it, expect } from 'vitest'
import { createRbAssetDownloadUrl } from './represented-brands-media'

const BRAND_ID = '00000000-0000-0000-0000-000000000001'

describe('createRbAssetDownloadUrl · public-path passthrough', () => {
  it('returns a same-origin public path unchanged', async () => {
    const res = await createRbAssetDownloadUrl(BRAND_ID, { path: '/brands/aladin/isologo.svg' })
    expect(res.error).toBeUndefined()
    expect(res.data?.signedUrl).toBe('/brands/aladin/isologo.svg')
  })

  it('validates the brand id before doing anything', async () => {
    const res = await createRbAssetDownloadUrl('not-a-uuid', { path: '/brands/aladin/isologo.svg' })
    expect(res.error?.code).toBe('VALIDATION')
  })

  it('never echoes a protocol-relative //host path through the passthrough', async () => {
    // '//evil.example/x' starts with '/' but is excluded by the `!startsWith("//")`
    // guard, so it is NOT returned verbatim (it falls through to the authz gate).
    const res = await createRbAssetDownloadUrl(BRAND_ID, { path: '//evil.example/x.svg' })
    expect(res.data?.signedUrl).not.toBe('//evil.example/x.svg')
  })
})
