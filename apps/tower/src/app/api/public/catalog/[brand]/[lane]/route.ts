// src/app/api/public/catalog/[brand]/[lane]/route.ts
// API_MAP `GET /api/public/catalog/{brand}/{lane}` — the public sites' single
// read path for a lane's published catalog. Published snapshots only, from
// `product_versions` (see ./../_lib/data.ts). Cursor-paginated per API_MAP
// ("all list endpoints cursor-paginated"). ISR-cached; a publish revalidates
// this route via lib/revalidate.ts.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiError } from '@/lib/api-errors'
import { paginationSchema } from '@/lib/schemas/common'
import { listPublishedProducts } from '../../_lib/data'
import { decodeCursor } from '../../_lib/pagination'

export const revalidate = 60

const paramsSchema = z.object({
  brand: z.string().min(1).max(100),
  lane: z.string().min(1).max(100),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand: string; lane: string }> },
) {
  try {
    const parsedParams = paramsSchema.safeParse(await params)
    if (!parsedParams.success) {
      return apiError('VALIDATION', 'Parámetros de ruta inválidos.', parsedParams.error.flatten().fieldErrors)
    }

    const { searchParams } = new URL(request.url)
    const parsedPagination = paginationSchema.safeParse({
      cursor: searchParams.get('cursor'),
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    })
    if (!parsedPagination.success) {
      return apiError('VALIDATION', 'Parámetros de paginación inválidos.', parsedPagination.error.flatten().fieldErrors)
    }

    const { brand, lane } = parsedParams.data
    const result = await listPublishedProducts({
      brandSlug: brand,
      laneSlug: lane,
      limit: parsedPagination.data.limit,
      cursor: decodeCursor(parsedPagination.data.cursor ?? null),
    })

    if (!result.ok) {
      if (result.error === 'BRAND_NOT_FOUND' || result.error === 'LANE_NOT_FOUND') {
        return apiError('NOT_FOUND', 'Marca o lane no encontrada.')
      }
      return apiError('INTERNAL', 'No se pudo cargar el catálogo.')
    }

    const response = NextResponse.json({ data: result.data })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return response
  } catch (error) {
    console.error('[api/public/catalog/[brand]/[lane]]', error)
    return apiError('INTERNAL')
  }
}
