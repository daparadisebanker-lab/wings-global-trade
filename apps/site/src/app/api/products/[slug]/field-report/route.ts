// src/app/api/products/[slug]/field-report/route.ts
// Returns the Field Report for a product (3-line technical summary for Andean market).
// Cache-first: reads from products.field_report_es. Generates via Claude on miss.
// Model: claude-haiku-4-5 — fast, cheap, appropriate for structured short-form generation.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/claude'
import type { Product } from '@/types/database'

export const runtime = 'nodejs'

const FIELD_REPORT_MODEL = 'claude-haiku-4-5'

const FIELD_REPORT_SYSTEM_PROMPT = `Eres un técnico especialista en importación de maquinaria para mercados andinos. Escribe el INFORME DE CAMPO con exactamente 3 líneas en este formato:\n[ALTITUD] nota de rendimiento en altitud con HP efectivo calculado para 3.200 msnm (HP * 0.97^floor((3200-2000)/300))\n[REGULACIÓN] norma específica aplicable (MTC/SUTRAN/INDECOPI/ZOFRATACNA) sin inventar números de resolución\n[COMPATIBILIDAD] nota sobre mantenimiento u operación en mercado andino\nUsa los valores reales de las especificaciones. Tono técnico-operativo. Sin signos de exclamación. Cada línea máx 140 chars.`

const FALLBACK_REPORT =
  '[ALTITUD] Verificar desempeño a altitud con el proveedor según especificaciones técnicas.\n[REGULACIÓN] Consultar normativa MTC/SUTRAN aplicable para homologación en mercado peruano.\n[COMPATIBILIDAD] Compatible con red de talleres especializados en maquinaria de importación.'

function buildUserPrompt(product: Product, categorySlug: string): string {
  const sourceMarket = (product.source_markets as string[] | null)?.[0] ?? 'China'
  const specsPreview = JSON.stringify(
    Object.fromEntries(Object.entries((product.specs as Record<string, unknown>) ?? {}).slice(0, 8))
  )
  return `Producto: ${product.name_es}. Specs: ${specsPreview}. Categoría: ${categorySlug}. Origen: ${sourceMarket}.`
}

function isValidReport(text: string): boolean {
  return (
    text.includes('[ALTITUD]') &&
    text.includes('[REGULACIÓN]') &&
    text.includes('[COMPATIBILIDAD]')
  )
}

async function generateFieldReport(
  product: Product,
  categorySlug: string,
): Promise<string | null> {
  const client = getAnthropicClient()
  if (!client) return null

  try {
    const response = await client.messages.create({
      model: FIELD_REPORT_MODEL,
      max_tokens: 512,
      system: FIELD_REPORT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(product, categorySlug),
        },
      ],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text.trim() : null

    if (!text || !isValidReport(text)) return null
    return text
  } catch (err) {
    console.error('[api/products/field-report] Claude error', err)
    return null
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    const SlugSchema = z.string().min(1).max(120).regex(/^[a-z0-9-]+$/)
    SlugSchema.parse(slug)

    const db = createServiceClient()
    if (!db) {
      return NextResponse.json({ report: FALLBACK_REPORT }, { status: 200 })
    }

    // Fetch product with field_report_es cache field + category for prompt context.
    const { data: productRow, error: fetchError } = await db
      .from('products')
      .select(
        'id, slug, name_es, specs, source_markets, category_id, field_report_es',
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (fetchError || !productRow) {
      return NextResponse.json(
        { error: 'Producto no encontrado', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 },
      )
    }

    // Cache hit — return immediately.
    if (productRow.field_report_es) {
      return NextResponse.json({ report: productRow.field_report_es })
    }

    // Resolve category slug for prompt context.
    const { data: categoryRow } = await db
      .from('categories')
      .select('slug')
      .eq('id', productRow.category_id)
      .single()

    const categorySlug = categoryRow?.slug ?? ''

    // Generate via Claude.
    const generated = await generateFieldReport(
      productRow as unknown as Product,
      categorySlug,
    )

    if (!generated) {
      return NextResponse.json({ report: FALLBACK_REPORT })
    }

    // Persist to cache — fire-and-forget; non-blocking.
    db.from('products')
      .update({ field_report_es: generated })
      .eq('slug', slug)
      .then(({ error }) => {
        if (error) console.error('[api/products/field-report] cache write failed', error)
      })

    return NextResponse.json({ report: generated })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Slug inválido', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    console.error('[api/products/field-report]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
