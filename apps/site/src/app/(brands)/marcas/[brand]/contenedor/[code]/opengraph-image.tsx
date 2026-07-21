// src/app/(brands)/marcas/[brand]/contenedor/[code]/opengraph-image.tsx
// The share/OG image for a promoted container's public landing page — the exact
// URL the TOWER share card + WhatsApp copy point to (containerListingUrl:
// /marcas/{brand}/contenedor/{code}). When that link unfurls, it shows the
// @wings/rb-core brand share card (1080×1080): "the preview card does half the
// selling before the tap" (SPEC §4.2-A).
//
// Public-safe by construction: it renders ONLY what getActiveContainer resolves
// from public.rb_active_containers, which already gates to promo_active +
// OPEN/FILLING + LIVE brand (tower_33) — exactly the page's own data fetch. No
// promoted container → 404, so nothing private ever unfurls. The SVG is
// rasterized with resvg (kept external in next.config), the same pipeline as
// apps/tower's /api/promo-card route.
import { Resvg } from '@resvg/resvg-js'
import { buildPromoCardSvg } from '@wings/rb-core'
import { getBrand } from '@/lib/rb/fixtures'
import { getActiveContainer } from '@/lib/rb/data'
import { activeContainerToPromo } from '@/lib/rb/promoCard'
import { promoFontFiles } from '@/lib/promo/fonts'

// Fill state must be fresh — a stale «quedan 3» is what destroys the trust the
// card exists to build (SPEC §2.7④).
export const dynamic = 'force-dynamic'
// resvg is a native addon → Node runtime, never edge.
export const runtime = 'nodejs'

export const alt = 'Contenedor activo — Wings Global Trade'
export const size = { width: 1080, height: 1080 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ brand: string; code: string }> }) {
  const { brand: slug, code } = await params
  const brand = getBrand(slug)
  const container = brand ? await getActiveContainer(slug, code) : null

  // No publicly-promoted container at this URL → no share card.
  if (!container) return new Response(null, { status: 404 })

  const svg = buildPromoCardSvg(activeContainerToPromo(container))
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: size.width },
    font: { fontFiles: promoFontFiles(), loadSystemFonts: true, defaultFontFamily: 'Flexo' },
  })
    .render()
    .asPng()

  return new Response(new Uint8Array(png), {
    headers: {
      'content-type': 'image/png',
      // Match the page's 60s fill-state staleness rule (SPEC §2.7④).
      'cache-control': 'public, max-age=60',
    },
  })
}
