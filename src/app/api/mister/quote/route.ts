// src/app/api/mister/quote/route.ts
// POST /api/mister/quote — generate a prefill token for the quotation form.
// Stores collected session data with a 24h TTL.
// The /cotizar page reads the token and pre-fills the inquiry form.
// Authoritative: ai-engineer.md §8 (/api/mister/quote endpoint)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const QuoteSchema = z.object({
  sessionId: z.string().min(1).max(128),
  prefilled: z.object({
    destinationCountry: z.string().optional(),
    destinationCity: z.string().optional(),
    incoterm: z.string().optional(),
    containerType: z.string().optional(),
    volume: z.string().optional(),
    ruc: z.string().optional(),
    timeline: z.string().optional(),
    productInterest: z.array(z.string()).optional(),
    budgetBand: z.string().optional(),
    notes: z.string().optional(),
    archetype: z.string().optional(),
    productIds: z.array(z.string()).optional(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const data = QuoteSchema.parse(await request.json())

    const supabase = createServiceClient()
    if (!supabase) {
      // Dev mode — return a fake token
      const token = crypto.randomUUID()
      console.info('[api/mister/quote] (dev) quote token:', token)
      return NextResponse.json({
        formUrl: `/cotizar?token=${token}`,
        prefillToken: token,
      })
    }

    const { data: row, error } = await supabase
      .from('mister_quote_tokens')
      .insert({
        session_id: data.sessionId,
        prefill_data: data.prefilled,
      })
      .select('token')
      .single()

    if (error || !row) {
      console.error('[api/mister/quote] insert error', error)
      return NextResponse.json(
        { error: 'No se pudo generar el token de cotización.', code: 'QUOTE_ERROR' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      formUrl: `/cotizar?token=${row.token}`,
      prefillToken: row.token,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: err.errors },
        { status: 400 },
      )
    }
    console.error('[api/mister/quote]', err)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
