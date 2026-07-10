// src/app/api/rb/reserve/route.ts
// ALLOCATION reservation (SPEC §4.3): no cart, no checkout — the action
// produces a DOCUMENTED RESERVATION LEAD. Insert-first, notify
// fire-and-forget (site notification law). Server recomputes the cascade;
// client numbers are display only.
//
// Fixture phase: slot availability checks against the fixture container and
// the allocation ledger is the lead itself. TOWER Phase 1 replaces this with
// rb_slot_allocations + row-locked subtraction; the `leads.flow` enum gains
// a dedicated value in those migrations (until then reservations ride
// 'contact' with structured context — flagged in KIT-INTAKE follow-ups).
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { insertLead } from '@/lib/leads'
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp'
import { sendEmailNotification } from '@/lib/notifications/email'
import type { ContactNotificationPayload } from '@/lib/notifications/types'
import { getBrand, getContainer, getTemplate } from '@/lib/rb/fixtures'
import { cascadeForSlots, fmt, slotsRemaining } from '@/lib/rb/packing'

const ReserveSchema = z.object({
  brand: z.string().min(2).max(40),
  containerId: z.string().min(3).max(40),
  /** 'shared' reserves slots on the filling container (availability-checked);
   *  'dedicated' is a full-container request scheduled against production —
   *  no shared fill state to race on. */
  allocation: z.enum(['shared', 'dedicated']).default('shared'),
  slots: z.number().int().min(1).max(100),
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  company: z.string().max(120).optional(),
  message: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const data = ReserveSchema.parse(await request.json())

    const brand = getBrand(data.brand)
    const container = brand ? getContainer(data.containerId) : undefined
    const template = container ? getTemplate(container.templateRef) : undefined
    if (!brand || !container || !template) {
      return NextResponse.json({ error: 'Contenedor no encontrado', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Server-side availability check — the client never decides this.
    const remaining = slotsRemaining(container)
    if (data.allocation === 'shared' && data.slots > remaining) {
      // Lost the race / over-ask → waitlist path, never a dead end (SPEC §4).
      return NextResponse.json(
        { error: 'Cupos insuficientes en este contenedor', code: 'SLOTS_UNAVAILABLE', remaining },
        { status: 409 },
      )
    }

    const cascade = cascadeForSlots(template, data.slots)
    const cascadeLine = `${cascade.slots} cupos = ${fmt(cascade.packages)} cajas = ${fmt(cascade.packets)} paquetes = ${fmt(cascade.units)} ${template.unitNamePlural} = ${fmt(cascade.kg)} kg`

    const ipCountry = request.headers.get('x-vercel-ip-country') ?? undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    const structuredMessage = [
      data.allocation === 'dedicated'
        ? `[${brand.code} ${brand.name} · CONTENEDOR COMPLETO dedicado]`
        : `[${brand.code} ${brand.name} · reserva de cupos]`,
      data.allocation === 'dedicated'
        ? `Plantilla: ${template.ref} · ${template.kindLabel} · programación contra producción`
        : `Contenedor: ${container.id} · ${template.kindLabel} · ${container.route.origin} → ${container.route.destination} · cierra ${container.closesAt}`,
      `Asignación: ${cascadeLine}`,
      data.company ? `Empresa: ${data.company}` : null,
      data.message ? `Mensaje: ${data.message}` : null,
      'Reserva documentada · sin pago en línea · vigencia 72 h',
    ]
      .filter(Boolean)
      .join('\n')

    const leadId = await insertLead({
      flow: 'contact',
      full_name: data.full_name,
      company: data.company ?? null,
      email: data.email,
      phone: data.phone,
      destination_country: 'PE',
      product_name_snapshot: `${brand.name} — reserva contenedor ${template.kind} (${brand.code})`,
      quantity: `${data.slots} cupos`,
      message: structuredMessage,
      source_url: `/marcas/${brand.slug}/contenedor`,
      user_agent: userAgent,
      ip_country: ipCountry,
    })

    const payload: ContactNotificationPayload = {
      flow: 'contact',
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      message: structuredMessage,
    }
    void sendWhatsAppNotification(leadId, payload)
    void sendEmailNotification(leadId, payload)

    return NextResponse.json(
      { lead_id: leadId, reservation: { slots: data.slots, cascade, expiresHours: 72 } },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 },
      )
    }
    console.error('[api/rb/reserve]', error)
    return NextResponse.json({ error: 'Error interno del servidor', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
