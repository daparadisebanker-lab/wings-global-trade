// src/lib/notifications/log.ts
// Helpers for writing to notification_log and updating lead notification status.
// All functions are best-effort and never throw.

import type { NotificationChannel, NotificationStatus } from '@/types/database'
import { createServiceClient } from '@/lib/supabase/server'

export async function logNotification(
  leadId: string,
  channel: NotificationChannel,
  status: NotificationStatus,
  recipient: string,
  providerId?: string | null,
  errorMessage?: string | null,
  payload?: Record<string, unknown>,
): Promise<void> {
  const supabase = createServiceClient()
  if (!supabase) return
  try {
    await supabase.from('notification_log').insert({
      lead_id: leadId,
      channel,
      status,
      recipient,
      provider_id: providerId ?? null,
      error_message: errorMessage ?? null,
      payload: payload ?? {},
      attempts: 1,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
  } catch (error) {
    console.error('[notifications/log] logNotification', error)
  }
}

export async function updateLeadNotificationStatus(
  leadId: string,
  channel: NotificationChannel,
  sentAt: string | null,
  errorMessage?: string | null,
): Promise<void> {
  const supabase = createServiceClient()
  if (!supabase) return
  try {
    const patch =
      channel === 'whatsapp'
        ? { whatsapp_sent_at: sentAt, whatsapp_error: errorMessage ?? null }
        : { email_sent_at: sentAt, email_error: errorMessage ?? null }
    await supabase.from('leads').update(patch).eq('id', leadId)
  } catch (error) {
    console.error('[notifications/log] updateLeadNotificationStatus', error)
  }
}
