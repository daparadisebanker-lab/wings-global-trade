// src/app/api/mister/submit/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { insertLead } from '@/lib/leads'
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp'
import { sendEmailNotification } from '@/lib/notifications/email'
import type { MisterNotificationPayload } from '@/lib/notifications/types'
import { computeCompleteness, missingFields } from '@/lib/tpr'
import type { TprState } from '@/types/mister'

const SubmitSchema = z.object({
  full_name: z.string().min(2).max(100),
  company: z.string().max(200).optional(),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  tpr: z.object({
    product_description: z.string().min(1),
    hs_code: z.string().optional(),
    quantity: z.string().min(1),
    target_price_usd: z.number().optional(),
    destination_country: z.string().min(2),
    destination_port: z.string().optional(),
    certifications: z.array(z.string()).optional(),
    tech_specs: z.record(z.string()).optional(),
    packaging_requirements: z.string().optional(),
    delivery_timeline: z.string().optional(),
  }),
  estimate: z
    .object({
      free_zone: z.string(),
      cif_total_usd: z.number(),
      duty_amount_usd: z.number(),
      free_zone_savings_pct: z.number(),
    })
    .optional(),
  conversation_snapshot: z
    .array(z.object({ role: z.string(), content: z.string(), timestamp: z.string() }))
    .default([]),
  session_id: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const data = SubmitSchema.parse(await request.json())
    const tpr = data.tpr as TprState & {
      product_description: string
      quantity: string
      destination_country: string
    }

    const ipCountry = request.headers.get('x-vercel-ip-country') ?? undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    // 1. Insert mister_projects record.
    let projectId = crypto.randomUUID()
    const supabase = createServiceClient()
    if (supabase) {
      const { data: project, error } = await supabase
        .from('mister_projects')
        .insert({
          product_description: tpr.product_description,
          hs_code: tpr.hs_code ?? null,
          quantity: tpr.quantity,
          target_price_usd: tpr.target_price_usd ?? null,
          destination_country: tpr.destination_country,
          destination_port: tpr.destination_port ?? null,
          certifications: tpr.certifications ?? [],
          tech_specs: tpr.tech_specs ?? {},
          packaging_requirements: tpr.packaging_requirements ?? null,
          delivery_timeline: tpr.delivery_timeline ?? null,
          free_zone: data.estimate?.free_zone ?? null,
          cif_total_usd: data.estimate?.cif_total_usd ?? null,
          duty_amount_usd: data.estimate?.duty_amount_usd ?? null,
          free_zone_savings_pct: data.estimate?.free_zone_savings_pct ?? null,
          estimate_generated_at: data.estimate ? new Date().toISOString() : null,
          completeness: computeCompleteness(tpr),
          missing_fields: missingFields(tpr),
          conversation_turns: data.conversation_snapshot.length,
          conversation_snapshot: data.conversation_snapshot,
          session_ref: data.session_id,
        })
        .select('id')
        .single()

      if (error || !project) {
        throw new Error(`mister_projects insert failed: ${error?.message ?? 'unknown'}`)
      }
      projectId = project.id as string
    } else {
      console.info('[api/mister/submit] (dev — no Supabase) project:', projectId)
    }

    // 2. Insert lead linked to the project.
    const leadId = await insertLead({
      flow: 'mister',
      full_name: data.full_name,
      company: data.company ?? null,
      email: data.email,
      phone: data.phone,
      destination_country: tpr.destination_country,
      product_name_snapshot: tpr.product_description,
      quantity: tpr.quantity,
      mister_project_id: projectId,
      user_agent: userAgent,
      ip_country: ipCountry,
    })

    // 3. Notifications.
    const payload: MisterNotificationPayload = {
      flow: 'mister',
      full_name: data.full_name,
      company: data.company ?? null,
      destination_country: tpr.destination_country,
      product_description: tpr.product_description,
      quantity: tpr.quantity,
      target_price_usd: tpr.target_price_usd ?? null,
      cif_total_usd: data.estimate?.cif_total_usd ?? null,
      free_zone: data.estimate?.free_zone ?? null,
      phone: data.phone,
      email: data.email,
    }
    void sendWhatsAppNotification(leadId, payload)
    void sendEmailNotification(leadId, payload)

    return NextResponse.json(
      {
        lead_id: leadId,
        project_id: projectId,
        message:
          'Tu consulta fue enviada al equipo de Wings. Te contactaremos en las próximas 24 horas.',
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
    console.error('[api/mister/submit]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
