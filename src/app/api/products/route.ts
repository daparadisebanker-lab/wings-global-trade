// src/app/api/products/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getProducts } from '@/lib/catalog-data'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') ?? undefined
    const q = searchParams.get('q') ?? undefined
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined

    const result = await getProducts({ category, q, limit, offset })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[api/products]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
