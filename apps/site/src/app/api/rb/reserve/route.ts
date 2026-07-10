// src/app/api/rb/reserve/route.ts
// ALLOCATION reservation (SPEC §4.3): no cart, no checkout — the action
// produces a DOCUMENTED RESERVATION: a row-locked slot allocation in
// tower.rb_slot_allocations (72 h expiry, self-healing subtraction) plus a
// lead. Insert-first, notify fire-and-forget (site notification law). All
// authoritative math and availability decisions are server-side.
//
// Order of writes: lead first (contact context must never be lost), then the
// atomic allocation RPC. If the RPC loses the race → 409 waitlist; the lead
// remains as the waitlist record, and the notification says so.
// leads.flow rides 'contact' until a dedicated enum value ships with the
// TOWER UI wave.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { insertLead } from '@/lib/leads'
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp'
import { sendEmailNotification } from '@/lib/notifications/email'
import type { ContactNotificationPayload } from '@/lib/notifications/types'
import { getBrand } from '@/lib/rb/fixtures'
import { getRbContainerById, getRbTemplateByRef, reserveRbSlots } from '@/lib/rb/data'
import { cascadeForSlots, fmt, slotsRemaining } from '@/lib/rb/packing'

const ReserveSchema = z.object({
  brand: z.string().min(2).max(40),
  containerId: z.string().min(3).max(40),
  /** 'shared' reserves slots on the filling container (row-locked,
   *  availability-checked); 'dedicated' is a full-container request scheduled
   *  against production — no shared fill state to race on. */
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
    const container = brand ? await getRbContainerById(data.containerId) : null
    const template = container ? await getRbTemplateByRef(container.templateRef) : null
    if (!brand || !container || !template) {
      return NextResponse.json({ error: 'Contenedor no encontrado', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Fast pre-check for honest UX; the RPC re-checks under a row lock.
    const remaining = slotsRemaining(container)
    if (data.allocation === 'shared' && data.slots > remaining) {
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
        : `Contenedor: ${container.code ?? container.id} · ${template.kindLabel} · ${container.route.origin} → ${container.route.destination} · cierra ${container.closesAt}`,
      `Asignación: ${cascadeLine}`,
      data.company ? `Empresa: ${data.company}` : null,
      data.message ? `Mensaje: ${data.message}` : null,
      'Reserva documentada · sin pago en línea · vigencia 72 h',
    ]
      .filter(Boolean)
      .join('\n')

    // 1 · Lead first — the contact context is never lost, even if the
    //     allocation loses the race (the lead then IS the waitlist record).
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

    // 2 · Atomic allocation (shared only) — row lock in tower.rb_reserve.
    let allocationId: string | undefined
    let waitlisted = false
    if (data.allocation === 'shared') {
      const result = await reserveRbSlots({
        containerId: container.id,
        slots: data.slots,
        leadId,
        quantityUnits: cascade.units,
      })
      if (!result.ok) {
        if (result.reason === 'insufficient' || result.reason === 'closed') {
          waitlisted = true
        } else {
          return NextResponse.json({ error: 'Contenedor no encontrado', code: 'NOT_FOUND' }, { status: 404 })
        }
      } else {
        allocationId = result.allocationId
      }
    }

    // 3 · Notify — fire-and-forget, with the real outcome stated.
    const payload: ContactNotificationPayload = {
      flow: 'contact',
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      message: `${structuredMessage}\nESTADO: ${
        waitlisted
          ? 'LISTA DE ESPERA — cupos insuficientes al confirmar'
          : data.allocation === 'dedicated'
            ? 'SOLICITUD DE CONTENEDOR DEDICADO'
            : `RESERVADO (72 h) · asignación ${allocationId ?? ''}`
      }`,
    }
    void sendWhatsAppNotification(leadId, payload)
    void sendEmailNotification(leadId, payload)

    if (waitlisted) {
      return NextResponse.json(
        {
          error: 'Cupos insuficientes en este contenedor',
          code: 'SLOTS_UNAVAILABLE',
          lead_id: leadId,
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        lead_id: leadId,
        allocation_id: allocationId ?? null,
        reservation: { slots: data.slots, cascade, expiresHours: 72 },
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
    console.error('[api/rb/reserve]', error)
    return NextResponse.json({ error: 'Error interno del servidor', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
