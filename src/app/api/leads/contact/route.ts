// src/app/api/leads/contact/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { insertLead } from '@/lib/leads'
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp'
import { sendEmailNotification } from '@/lib/notifications/email'
import type { ContactNotificationPayload } from '@/lib/notifications/types'

const ContactLeadSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
  message: z.string().min(1).max(2000),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = ContactLeadSchema.parse(body)

    const ipCountry = request.headers.get('x-vercel-ip-country') ?? undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    const leadId = await insertLead({
      flow: 'contact',
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? 'N/A',
      destination_country: 'N/A',
      message: data.message,
      user_agent: userAgent,
      ip_country: ipCountry,
    })

    const payload: ContactNotificationPayload = {
      flow: 'contact',
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
      message: data.message,
    }
    void sendWhatsAppNotification(leadId, payload)
    void sendEmailNotification(leadId, payload)

    return NextResponse.json({ lead_id: leadId }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 },
      )
    }
    console.error('[api/leads/contact]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
