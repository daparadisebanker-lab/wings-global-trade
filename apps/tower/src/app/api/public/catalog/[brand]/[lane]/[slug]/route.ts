// src/app/api/public/catalog/[brand]/[lane]/[slug]/route.ts
// One published product snapshot, by slug — the site's product-detail read path
// (sibling of the lane-list route; both share ../../_lib/data.ts). Published
// only: a DRAFT/IN_REVIEW/RETIRED product resolves to 404, never a body.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiError } from '@/lib/api-errors'
import { getPublishedProductBySlug } from '../../../_lib/data'

export const revalidate = 60

const paramsSchema = z.object({
  brand: z.string().min(1).max(100),
  lane: z.string().min(1).max(100),
  slug: z.string().min(1).max(200),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ brand: string; lane: string; slug: string }> },
) {
  try {
    const parsed = paramsSchema.safeParse(await params)
    if (!parsed.success) {
      return apiError('VALIDATION', 'Parámetros de ruta inválidos.', parsed.error.flatten().fieldErrors)
    }

    const result = await getPublishedProductBySlug({
      brandSlug: parsed.data.brand,
      laneSlug: parsed.data.lane,
      productSlug: parsed.data.slug,
    })

    if (!result.ok) {
      if (result.error === 'UNAVAILABLE') return apiError('INTERNAL', 'No se pudo cargar el producto.')
      return apiError('NOT_FOUND', 'Producto no encontrado.')
    }

    const response = NextResponse.json({ data: result.data })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return response
  } catch (error) {
    console.error('[api/public/catalog/[brand]/[lane]/[slug]]', error)
    return apiError('INTERNAL')
  }
}
