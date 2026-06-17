// src/app/api/leads/catalog/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { insertLead } from '@/lib/leads'
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp'
import { sendEmailNotification } from '@/lib/notifications/email'
import type { CatalogNotificationPayload } from '@/lib/notifications/types'

const CatalogLeadSchema = z.object({
  full_name: z.string().min(2).max(100),
  company: z.string().max(200).optional(),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  destination_country: z.string().min(2).max(100),
  product_id: z.string().uuid().optional(),
  product_name: z.string().min(1).max(200),
  quantity: z.string().min(1).max(100),
  message: z.string().max(2000).optional(),
  source_url: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CatalogLeadSchema.parse(body)

    const ipCountry = request.headers.get('x-vercel-ip-country') ?? undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    // 1. Insert lead FIRST — must succeed.
    const leadId = await insertLead({
      flow: 'catalog',
      full_name: data.full_name,
      company: data.company ?? null,
      email: data.email,
      phone: data.phone,
      destination_country: data.destination_country,
      product_id: data.product_id ?? null,
      product_name_snapshot: data.product_name,
      quantity: data.quantity,
      message: data.message ?? null,
      source_url: data.source_url ?? null,
      user_agent: userAgent,
      ip_country: ipCountry,
    })

    // 2 + 3. Fire-and-forget notifications.
    const payload: CatalogNotificationPayload = {
      flow: 'catalog',
      full_name: data.full_name,
      company: data.company ?? null,
      destination_country: data.destination_country,
      product_name: data.product_name,
      quantity: data.quantity,
      phone: data.phone,
      email: data.email,
      message: data.message ?? null,
    }
    void sendWhatsAppNotification(leadId, payload)
    void sendEmailNotification(leadId, payload)

    return NextResponse.json(
      {
        lead_id: leadId,
        message:
          'Consulta recibida. El equipo de Wings se comunicará contigo en las próximas 24 horas.',
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 },
      )
    }
    console.error('[api/leads/catalog]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
