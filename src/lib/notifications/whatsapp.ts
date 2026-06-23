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

const DIVIDER = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

function row(label: string, value: string): string {
  return `${label.padEnd(10)}${value}`
}

function wgtRef(leadId: string): string {
  const digits = leadId.replace(/\D/g, '').slice(-4).padStart(4, '0')
  return `WGT-${digits}`
}

export function formatWhatsAppMessage(payload: NotificationPayload, leadId = ''): string {
  const ref = leadId ? wgtRef(leadId) : 'WGT-????'
  const now = new Date().toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  if (payload.flow === 'catalog') {
    return [
      'WINGS GLOBAL TRADE · NUEVA CONSULTA',
      DIVIDER,
      row('REF ·', ref),
      row('TIPO ·', 'Catálogo'),
      DIVIDER,
      row('PRODUCTO', payload.product_name),
      row('CANTIDAD', payload.quantity),
      row('DESTINO', payload.destination_country),
      payload.message ? row('MENSAJE', payload.message) : '',
      DIVIDER,
      row('CONTACTO', payload.full_name),
      row('EMPRESA', payload.company ?? '—'),
      row('TELÉFONO', payload.phone),
      row('EMAIL', payload.email),
      DIVIDER,
      row('RECIBIDO', now + ' PET'),
      'RESPUESTA ESPERADA < 24H',
    ].filter(Boolean).join('\n')
  }

  if (payload.flow === 'accio') {
    return [
      'WINGS GLOBAL TRADE · NUEVA CONSULTA',
      DIVIDER,
      row('REF ·', ref),
      row('TIPO ·', 'Accio Engine'),
      DIVIDER,
      row('PRODUCTO', payload.product_description),
      row('CANTIDAD', payload.quantity),
      row('DESTINO', payload.destination_country),
      row('PRECIO OBJ', payload.target_price_usd != null ? formatCurrency(payload.target_price_usd) : '—'),
      row('CIF EST.', payload.cif_total_usd != null ? formatCurrency(payload.cif_total_usd) : '—'),
      row('ZONA', payload.free_zone ?? '—'),
      DIVIDER,
      row('CONTACTO', payload.full_name),
      row('EMPRESA', payload.company ?? '—'),
      row('TELÉFONO', payload.phone),
      row('EMAIL', payload.email),
      DIVIDER,
      row('RECIBIDO', now + ' PET'),
      'RESPUESTA ESPERADA < 24H',
    ].join('\n')
  }

  // contact
  return [
    'WINGS GLOBAL TRADE · CONTACTO',
    DIVIDER,
    row('REF ·', ref),
    row('TIPO ·', 'Contacto directo'),
    DIVIDER,
    row('CONTACTO', payload.full_name),
    row('EMAIL', payload.email),
    row('TELÉFONO', payload.phone ?? '—'),
    DIVIDER,
    row('MENSAJE', payload.message),
    DIVIDER,
    row('RECIBIDO', now + ' PET'),
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
  const body = formatWhatsAppMessage(payload, leadId)

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
