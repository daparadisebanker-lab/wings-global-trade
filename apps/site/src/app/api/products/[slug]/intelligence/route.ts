// src/app/api/products/[slug]/intelligence/route.ts
// Returns the Trade Intelligence Line for a product.
// Cache-first: reads from products.trade_intelligence. Generates via Claude on miss.
// Model: claude-haiku-4-5 — fast, cheap, appropriate for single-line generation.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/claude'
import type { Product } from '@/types/database'

export const runtime = 'nodejs'

const INTELLIGENCE_MODEL = 'claude-haiku-4-5'

const INTELLIGENCE_SYSTEM_PROMPT = `Eres un analista de inteligencia comercial especializado en mercados de importación latinoamericanos, zonas francas (ZOFRATACNA en Perú, ZOFRI en Chile) y compras B2B de maquinaria y vehículos comerciales.

Tu tarea: escribir UNA sola línea de inteligencia de mercado para un producto específico. La línea debe sonar como si viniera de alguien que trabaja operativamente en ZOFRATACNA o ZOFRI — no de un redactor de marketing.

Reglas estrictas:
- Una sola línea. Máximo 120 caracteres.
- En español. Tono: operativo, directo, de insider.
- Usa datos específicos cuando puedas inferirlos: zona franca, año, segmento, HS, ruta.
- Menciona ZOFRATACNA si el mercado típico es Perú/Bolivia; ZOFRI si es Chile/otros.
- Sin signos de exclamación. Sin lenguaje de marketing ("el mejor", "garantizamos").
- Si el producto tiene modelos específicos con alta rotación, menciona el modelo.
- Ejemplos del tono correcto:
  "Modelo con mayor demanda en importaciones de mini camiones, ZOFRATACNA 2023."
  "Cosechadora autopropulsada — HS 8433.51 — exonerada de arancel bajo Ley Agraria Perú."
  "Alta rotación en rutas Callao–La Paz vía Desaguadero; 40HC estándar para este equipo."
  "Preferido en licitaciones municipales Chile por homologación Euro V — HS 8702.10."

FORMATO REQUERIDO: Comienza tu respuesta con exactamente un tag de tipo seguido de un espacio. El tag debe ser uno de: TENDENCIA | DEMANDA | REGULACIÓN | RUTA | ZONA FRANCA. Luego el texto de inteligencia. Termina con ' · Q[N] [YYYY]' donde N es el trimestre actual y YYYY es el año. Ejemplo: 'DEMANDA Alta rotación mini camiones 4x4 ZOFRATACNA · Q2 2026'. Máximo 140 caracteres totales incluyendo el tag y la fecha.`

// Static fallbacks used when Claude is unavailable — same values as component fallback.
const CATEGORY_FALLBACK: Record<string, string> = {
  'maquinaria-agricola': 'Segmento de mayor crecimiento en importaciones vía ZOFRATACNA, Q4 2023.',
  camiones: 'Modelo con mayor rotación en operaciones de última milla, ZOFRATACNA 2023.',
  buses: 'Alta demanda en rutas interprovinciales de sierra central, 2023–2024.',
  'equipo-industrial': 'Activo en operaciones de zona franca Chile y Perú, 2023.',
}

const DEFAULT_FALLBACK =
  'Origen verificado · Documentación completa · Disponible vía zona franca.'

function buildUserPrompt(product: Product, categorySlug: string): string {
  const topSpecs = Object.entries(product.specs ?? {})
    .slice(0, 5)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')

  const sourceMarket = product.source_markets?.[0] ?? 'China'

  return `Producto: ${product.name_es}. Categoría: ${categorySlug}. Origen: ${sourceMarket}. Especificaciones clave: ${topSpecs || 'no especificadas'}. Genera la línea de inteligencia comercial.`
}

async function generateIntelligence(
  product: Product,
  categorySlug: string,
): Promise<string | null> {
  const client = getAnthropicClient()
  if (!client) return null

  try {
    const response = await client.messages.create({
      model: INTELLIGENCE_MODEL,
      max_tokens: 128,
      system: INTELLIGENCE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(product, categorySlug),
        },
      ],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text.trim() : null

    if (!text || text.length > 160 || !/^(TENDENCIA|DEMANDA|REGULACIÓN|RUTA|ZONA FRANCA)\s/.test(text)) return null
    return text
  } catch (err) {
    console.error('[api/products/intelligence] Claude error', err)
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
      return NextResponse.json(
        { intelligence: DEFAULT_FALLBACK },
        { status: 200 },
      )
    }

    // Fetch product with trade_intelligence cache field + category for fallback key.
    const { data: productRow, error: fetchError } = await db
      .from('products')
      .select(
        'id, slug, name_es, specs, source_markets, category_id, trade_intelligence',
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
    if (productRow.trade_intelligence) {
      return NextResponse.json({ intelligence: productRow.trade_intelligence })
    }

    // Resolve category slug for fallback and prompt context.
    const { data: categoryRow } = await db
      .from('categories')
      .select('slug')
      .eq('id', productRow.category_id)
      .single()

    const categorySlug = categoryRow?.slug ?? ''

    // Generate via Claude.
    const generated = await generateIntelligence(
      productRow as unknown as Product,
      categorySlug,
    )

    if (!generated) {
      const fallback =
        CATEGORY_FALLBACK[categorySlug] ?? DEFAULT_FALLBACK
      return NextResponse.json({ intelligence: fallback })
    }

    // Persist to cache — fire-and-forget; non-blocking.
    db.from('products')
      .update({ trade_intelligence: generated })
      .eq('slug', slug)
      .then(({ error }) => {
        if (error) console.error('[api/products/intelligence] cache write failed', error)
      })

    return NextResponse.json({ intelligence: generated })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Slug inválido', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    console.error('[api/products/intelligence]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
