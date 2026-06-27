// src/app/api/mister/estimate/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { calculateCIF } from '@/lib/cif-calculator'
import { parseQuantityNumeric } from '@/lib/utils'

const EstimateSchema = z.object({
  product_description: z.string().min(1),
  hs_code: z.string().optional(),
  quantity: z.string().min(1),
  quantity_units: z.string().optional(),
  target_price_usd: z.number().positive(),
  destination_country: z.string().min(2),
  destination_port: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  source_market: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = EstimateSchema.parse(body)

    const estimate = calculateCIF({
      product_description: data.product_description,
      hs_code: data.hs_code,
      quantity: data.quantity,
      quantity_units: data.quantity_units,
      quantity_numeric: parseQuantityNumeric(data.quantity),
      target_price_usd: data.target_price_usd,
      destination_country: data.destination_country,
      destination_port: data.destination_port,
      certifications: data.certifications,
      source_market: data.source_market,
    })

    return NextResponse.json({ estimate })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 },
      )
    }
    console.error('[api/mister/estimate]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
