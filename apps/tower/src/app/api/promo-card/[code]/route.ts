// GET /api/promo-card/{code}?format=png|svg
// The programmatic share-card endpoint for the container-promotion feature
// ("a button that can create a jpg or png image … make it programmatic").
// Renders @wings/rb-core's buildPromoCardSvg for a container the caller may see
// (RLS-scoped via getContainerPromoByCode) into a 1080×1080 PNG (resvg) or the
// raw SVG. Useful for the TOWER download button and for n8n/WhatsApp automation
// that fetches the card by code. Auth is the tower session; unpromoted or
// unauthorised containers 404 through RLS.
import { NextResponse } from 'next/server'
import { Resvg } from '@resvg/resvg-js'
import { buildPromoCardSvg } from '@wings/rb-core'
import { getContainerPromoByCode } from '@/lib/actions/container-promo'
import { promoFontFiles } from '@/lib/promo/fonts'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const url = new URL(_req.url)
  const format = url.searchParams.get('format') === 'svg' ? 'svg' : 'png'

  const res = await getContainerPromoByCode(code)
  if (res.error) {
    const status = res.error.code === 'UNAUTHORIZED' ? 401 : res.error.code === 'VALIDATION' ? 400 : 404
    return NextResponse.json({ error: res.error.message }, { status })
  }

  const svg = buildPromoCardSvg(res.data.promo)
  const filename = `contenedor-${res.data.code}`

  if (format === 'svg') {
    return new NextResponse(svg, {
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}.svg"`,
      },
    })
  }

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1080 },
    font: { fontFiles: promoFontFiles(), loadSystemFonts: true, defaultFontFamily: 'Flexo' },
  })
    .render()
    .asPng()

  return new NextResponse(Buffer.from(png), {
    headers: {
      'content-type': 'image/png',
      'content-disposition': `attachment; filename="${filename}.png"`,
      'cache-control': 'no-store',
    },
  })
}
