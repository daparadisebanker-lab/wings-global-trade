// src/app/api/categories/route.ts
import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/catalog-data'

export const revalidate = 3600

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('[api/categories]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
