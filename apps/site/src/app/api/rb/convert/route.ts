// src/app/api/rb/convert/route.ts
// ALLOCATION by-quantity conversion (SPEC §4.2): buyer enters a quantity at
// any packing level; the server converts up the packing profile to the
// minimum slot count. One math, two consumers — the same functions the
// reserve route (and later TOWER) uses. Display on the client is never
// authoritative.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { getTemplate } from '@/lib/rb/fixtures'
import { slotsForQuantity } from '@/lib/rb/packing'

const ConvertSchema = z.object({
  templateRef: z.string().min(3).max(40),
  quantity: z.number().int().positive().max(1_000_000),
  level: z.enum(['units', 'packets', 'packages']),
})

export async function POST(request: NextRequest) {
  try {
    const data = ConvertSchema.parse(await request.json())
    const template = getTemplate(data.templateRef)
    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada', code: 'NOT_FOUND' }, { status: 404 })
    }
    const conversion = slotsForQuantity(template, data.quantity, data.level)
    return NextResponse.json({ conversion })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 },
      )
    }
    console.error('[api/rb/convert]', error)
    return NextResponse.json({ error: 'Error interno del servidor', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
