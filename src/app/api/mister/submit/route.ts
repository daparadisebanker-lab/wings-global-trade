// src/app/api/mister/submit/route.ts
// POST /api/mister/submit — convert a Mister v2 session into a lead.
// Accepts contact info + sessionId. Links the lead to the existing mister_projects row.
// NO CIF data — CIF estimate flow is retired (Decision A).
// Authoritative: ENRICHED_SPEC §1.2, ai-engineer.md §8

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { insertLead } from '@/lib/leads'
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp'
import { sendEmailNotification } from '@/lib/notifications/email'
import type { MisterNotificationPayload } from '@/lib/notifications/types'

const SubmitSchema = z.object({
  sessionId: z.string().min(1).max(128),
  full_name: z.string().min(2).max(100),
  company: z.string().max(200).optional(),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
})

export async function POST(request: NextRequest) {
  try {
    const data = SubmitSchema.parse(await request.json())

    const ipCountry = request.headers.get('x-vercel-ip-country') ?? undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    const supabase = createServiceClient()

    // Fetch the existing mister_projects row to get session context
    let destinationCountry: string | null = null
    let productDescription: string | null = null
    let collectedVolume: string | null = null
    let misterProjectId: string | null = null

    if (supabase) {
      const { data: project, error } = await supabase
        .from('mister_projects')
        .select('id, collected, archetype, stage')
        .eq('session_id', data.sessionId)
        .single()

      if (error || !project) {
        console.error('[api/mister/submit] project not found for session', data.sessionId, error)
        // Continue — create lead without project reference
      } else {
        misterProjectId = project.id as string
        const collected = project.collected as Record<string, unknown>
        destinationCountry =
          (collected?.destinationCountry as string | undefined) ?? null
        productDescription =
          (collected?.notes as string | undefined) ??
          ((collected?.productInterest as string[] | undefined)?.[0] ?? null)
        collectedVolume = (collected?.volume as string | undefined) ?? null
      }
    } else {
      console.info('[api/mister/submit] (dev — no Supabase) would create lead for session:', data.sessionId)
    }

    // Insert lead
    const leadId = await insertLead({
      flow: 'mister',
      full_name: data.full_name,
      company: data.company ?? null,
      email: data.email,
      phone: data.phone,
      destination_country: destinationCountry ?? 'no especificado',
      product_name_snapshot: productDescription,
      mister_project_id: misterProjectId,
      user_agent: userAgent,
      ip_country: ipCountry,
    })

    // Link lead back to mister_projects
    if (supabase && misterProjectId) {
      await supabase
        .from('mister_projects')
        .update({ lead_id: leadId })
        .eq('id', misterProjectId)
    }

    // Notifications
    const notifPayload: MisterNotificationPayload = {
      flow: 'mister',
      full_name: data.full_name,
      company: data.company ?? null,
      destination_country: destinationCountry ?? 'no especificado',
      product_description: productDescription ?? 'consulta general',
      quantity: collectedVolume ?? 'no especificado',
      target_price_usd: null,
      cif_total_usd: null,
      free_zone: null,
      phone: data.phone,
      email: data.email,
    }
    void sendWhatsAppNotification(leadId, notifPayload)
    void sendEmailNotification(leadId, notifPayload)

    return NextResponse.json(
      {
        lead_id: leadId,
        project_id: misterProjectId,
        message:
          'Tu consulta fue enviada al equipo de Wings. Te contactaremos en las próximas 24 horas.',
      },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: err.errors },
        { status: 400 },
      )
    }
    console.error('[api/mister/submit]', err)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
