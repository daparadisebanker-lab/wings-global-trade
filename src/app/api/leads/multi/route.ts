// src/app/api/leads/multi/route.ts
// POST /api/leads/multi — creates a single lead from a multi-product inquiry.
// Accepts a list of products and one set of contact details.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp'
import { sendEmailNotification } from '@/lib/notifications/email'
import type { CatalogNotificationPayload } from '@/lib/notifications/types'

const MultiLeadSchema = z.object({
  full_name: z.string().min(2).max(120),
  company: z.string().max(120).optional().default(''),
  email: z.string().email(),
  phone: z.string().max(30).optional().default(''),
  destination_country: z.string().min(2).max(80),
  message: z.string().max(2000).optional().default(''),
  products: z
    .array(z.object({ id: z.string().uuid(), name_es: z.string() }))
    .min(1)
    .max(10),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = MultiLeadSchema.parse(body)

    const supabase = createServiceClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servicio no disponible', code: 'SERVICE_UNAVAILABLE' },
        { status: 503 },
      )
    }

    const productNames = data.products.map((p) => p.name_es).join(', ')
    const fullMessage = [
      data.message,
      `Productos consultados: ${productNames}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        flow: 'catalog',
        full_name: data.full_name,
        company: data.company || null,
        email: data.email,
        phone: data.phone || '',
        destination_country: data.destination_country,
        product_name_snapshot: productNames,
        message: fullMessage,
        source_url: request.headers.get('referer') ?? null,
        user_agent: request.headers.get('user-agent') ?? null,
      })
      .select('id')
      .single()

    if (insertError || !lead) {
      console.error('[api/leads/multi] insert', insertError)
      return NextResponse.json(
        { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
        { status: 500 },
      )
    }

    const notificationPayload: CatalogNotificationPayload = {
      flow: 'catalog',
      full_name: data.full_name,
      company: data.company || null,
      email: data.email,
      phone: data.phone,
      destination_country: data.destination_country,
      product_name: productNames,
      quantity: `${data.products.length} modelo${data.products.length > 1 ? 's' : ''}`,
      message: fullMessage || null,
    }

    void sendWhatsAppNotification(lead.id, notificationPayload).catch((err) =>
      console.error('[api/leads/multi] whatsapp', err),
    )
    void sendEmailNotification(lead.id, notificationPayload).catch((err) =>
      console.error('[api/leads/multi] email', err),
    )

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 },
      )
    }
    console.error('[api/leads/multi]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
