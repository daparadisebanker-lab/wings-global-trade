// src/app/api/products/[slug]/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getProductBySlug } from '@/lib/catalog-data'

export const revalidate = 3600

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const product = await getProductBySlug(slug)
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 },
      )
    }
    return NextResponse.json({ product })
  } catch (error) {
    console.error('[api/products/[slug]]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
