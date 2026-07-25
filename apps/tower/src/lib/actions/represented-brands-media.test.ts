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

  it('accepts the seeded logo + hero asset paths', async () => {
    for (const p of [
      '/brands/aladin/isologo.svg',
      '/brands/aladin/positivo.svg',
      '/brands/aladin/hero-rolls.jpeg',
      '/brands/aladin/hero-bamboo.jpeg',
    ]) {
      const res = await createRbAssetDownloadUrl(BRAND_ID, { path: p })
      expect(res.data?.signedUrl).toBe(p)
    }
  })

  it('never echoes an off-origin or malformed path through the passthrough', async () => {
    // Each of these would resolve off-origin (or is otherwise unsafe) and MUST NOT be
    // returned verbatim — the strict /brands/{slug}/{file.ext} allowlist rejects them,
    // so they fall through to the gated storage path (which returns something else).
    const bypasses = [
      '//evil.example/x.svg', //            protocol-relative authority
      '/\\evil.example/x.svg', //           backslash → parser treats as //
      '/\t/evil.example/x.svg', //          tab is stripped by the URL parser
      '/brands/aladin/../../etc/passwd', // traversal, no image ext
      '/brands/aladin/logo.svg?x=1', //     query string
      '/brands/aladin/logo.svg#f', //       fragment
      '/other/aladin/logo.svg', //          wrong prefix
      '/brands/aladin/logo.txt', //         disallowed extension
      'https://evil.example/x.svg', //      absolute URL
    ]
    for (const p of bypasses) {
      const res = await createRbAssetDownloadUrl(BRAND_ID, { path: p })
      expect(res.data?.signedUrl, `must not echo ${JSON.stringify(p)}`).not.toBe(p)
    }
  })
})
