// src/lib/notifications/email.ts
// Resend email sender. Fire-and-forget — errors are logged, never thrown.
// In non-production environments, logs payload to console and skips Resend.

import { Resend } from 'resend'
import type { NotificationPayload } from '@/lib/notifications/types'
import { formatCurrency } from '@/lib/utils'
import { logNotification, updateLeadNotificationStatus } from '@/lib/notifications/log'

const FROM = 'Wings Global Trade <noreply@wingsglobaltrade.com>'

function isProduction(): boolean {
  return process.env.VERCEL_ENV === 'production'
}

export function formatEmailSubject(payload: NotificationPayload): string {
  if (payload.flow === 'catalog') {
    return `Nueva consulta: ${payload.product_name} — ${payload.destination_country}`
  }
  if (payload.flow === 'accio') {
    return `Nueva consulta Accio: ${payload.product_description} × ${payload.quantity} — ${payload.destination_country}`
  }
  return `Nuevo contacto: ${payload.full_name}`
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 12px;font-family:monospace;color:#6B7280;background:#F8F6F0;border:1px solid #E5E7EB;">${label}</td><td style="padding:8px 12px;color:#001E50;border:1px solid #E5E7EB;">${escapeHtml(
    value,
  )}</td></tr>`
}

export function renderLeadEmailHtml(payload: NotificationPayload): string {
  let rows = ''
  if (payload.flow === 'catalog') {
    rows = [
      row('Nombre', payload.full_name),
      row('Empresa', payload.company ?? '—'),
      row('País', payload.destination_country),
      row('Producto', payload.product_name),
      row('Cantidad', payload.quantity),
      row('WhatsApp', payload.phone),
      row('Email', payload.email),
      row('Mensaje', payload.message ?? '—'),
    ].join('')
  } else if (payload.flow === 'accio') {
    rows = [
      row('Nombre', payload.full_name),
      row('Empresa', payload.company ?? '—'),
      row('País destino', payload.destination_country),
      row('Producto', payload.product_description),
      row('Cantidad', payload.quantity),
      row(
        'Precio objetivo',
        payload.target_price_usd != null ? formatCurrency(payload.target_price_usd) : '—',
      ),
      row('CIF estimado', payload.cif_total_usd != null ? formatCurrency(payload.cif_total_usd) : '—'),
      row('Zona franca', payload.free_zone ?? '—'),
      row('WhatsApp', payload.phone),
      row('Email', payload.email),
    ].join('')
  } else {
    rows = [
      row('Nombre', payload.full_name),
      row('Email', payload.email),
      row('Teléfono', payload.phone ?? '—'),
      row('Mensaje', payload.message),
    ].join('')
  }

  return `<!DOCTYPE html><html lang="es"><body style="margin:0;padding:24px;background:#F8F6F0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:4px;overflow:hidden;">
    <div style="background:#001E50;color:#F8F6F0;padding:20px 24px;">
      <h1 style="margin:0;font-size:20px;">Wings Global Trade</h1>
      <p style="margin:4px 0 0;color:#C4933F;font-size:13px;">${escapeHtml(formatEmailSubject(payload))}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
    <div style="padding:16px 24px;color:#6B7280;font-size:12px;">Precisión. Proximidad. Confianza.</div>
  </div></body></html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendEmailNotification(
  leadId: string,
  payload: NotificationPayload,
): Promise<void> {
  const to = process.env.WINGS_OPS_EMAIL
  const apiKey = process.env.RESEND_API_KEY
  const subject = formatEmailSubject(payload)

  if (!isProduction() || !apiKey || !to) {
    console.info(`[email] (skipped — non-production or unconfigured)\nSubject: ${subject}`)
    await logNotification(leadId, 'email', 'pending', to ?? 'unconfigured', null, null, {
      subject,
    })
    return
  }

  try {
    const resend = new Resend(apiKey)
    const result = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html: renderLeadEmailHtml(payload),
    })
    if (result.error) throw new Error(result.error.message)
    await logNotification(leadId, 'email', 'sent', to, result.data?.id ?? null)
    await updateLeadNotificationStatus(leadId, 'email', new Date().toISOString())
  } catch (error) {
    console.error('[email] send failed', error)
    await logNotification(leadId, 'email', 'failed', to, null, String(error))
    await updateLeadNotificationStatus(leadId, 'email', null, String(error))
  }
}
