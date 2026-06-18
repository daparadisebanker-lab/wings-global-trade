// src/lib/notifications/whatsapp.ts
// Twilio WhatsApp sender. Fire-and-forget — errors are logged, never thrown.
// In non-production environments, logs payload to console and skips Twilio.

import twilio from 'twilio'
import type { NotificationPayload } from '@/lib/notifications/types'
import { formatCurrency } from '@/lib/utils'
import { logNotification, updateLeadNotificationStatus } from '@/lib/notifications/log'

function isProduction(): boolean {
  return process.env.VERCEL_ENV === 'production'
}

export function formatWhatsAppMessage(payload: NotificationPayload): string {
  if (payload.flow === 'catalog') {
    return [
      'Nueva consulta de catálogo — Wings',
      `Nombre: ${payload.full_name}`,
      `Empresa: ${payload.company ?? '—'}`,
      `País: ${payload.destination_country}`,
      `Producto: ${payload.product_name}`,
      `Cantidad: ${payload.quantity}`,
      `WhatsApp: ${payload.phone}`,
      `Email: ${payload.email}`,
      `Mensaje: ${payload.message ?? '—'}`,
    ].join('\n')
  }

  if (payload.flow === 'accio') {
    return [
      'Nueva consulta Mister — Wings',
      `Nombre: ${payload.full_name}`,
      `Empresa: ${payload.company ?? '—'}`,
      `País destino: ${payload.destination_country}`,
      `Producto: ${payload.product_description}`,
      `Cantidad: ${payload.quantity}`,
      `Precio objetivo: ${
        payload.target_price_usd != null ? formatCurrency(payload.target_price_usd) : '—'
      }`,
      `CIF estimado: ${
        payload.cif_total_usd != null ? formatCurrency(payload.cif_total_usd) : '—'
      }`,
      `Zona franca: ${payload.free_zone ?? '—'}`,
      `WhatsApp: ${payload.phone}`,
      `Email: ${payload.email}`,
    ].join('\n')
  }

  // contact
  return [
    'Nuevo contacto — Wings',
    `Nombre: ${payload.full_name}`,
    `Email: ${payload.email}`,
    `Teléfono: ${payload.phone ?? '—'}`,
    `Mensaje: ${payload.message}`,
  ].join('\n')
}

export async function sendWhatsAppNotification(
  leadId: string,
  payload: NotificationPayload,
): Promise<void> {
  const to = process.env.WINGS_OPS_WHATSAPP
  const from = process.env.TWILIO_WHATSAPP_FROM
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const body = formatWhatsAppMessage(payload)

  if (!isProduction() || !sid || !token || !from || !to) {
    console.info('[whatsapp] (skipped — non-production or unconfigured)\n', body)
    await logNotification(leadId, 'whatsapp', 'pending', to ?? 'unconfigured', null, null, {
      body,
    })
    return
  }

  try {
    const client = twilio(sid, token)
    const result = await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body,
    })
    await logNotification(leadId, 'whatsapp', 'sent', to, result.sid)
    await updateLeadNotificationStatus(leadId, 'whatsapp', new Date().toISOString())
  } catch (error) {
    console.error('[whatsapp] send failed', error)
    await logNotification(leadId, 'whatsapp', 'failed', to, null, String(error))
    await updateLeadNotificationStatus(leadId, 'whatsapp', null, String(error))
  }
}
