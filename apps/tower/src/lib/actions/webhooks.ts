'use server'

// src/lib/actions/webhooks.ts
// The WebhookHealth read layer (COMPONENT_TREE §6 <WebhookHealth>): revalidation
// + n8n pipeline delivery status. Group-admin only.
//
// Same admin-gated service-read shape as audit.ts / getGroupSignalDeck: resolve
// is_group_admin via the RLS-scoped client, FORBIDDEN for non-admins, then read
// tower.webhook_deliveries (service-role-written, migration/wave5-webhooks.sql)
// through the service client. Only a bounded recent window is read — never a
// full-table scan. The pure fold lives in webhooks-logic.ts.
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getIsGroupAdmin } from '@/lib/lanes/memberships'
import { fail, ok, type ActionResult } from './result'
import {
  summarizeWebhookHealth,
  type WebhookDelivery,
  type WebhookHealthSummary,
  type DeliveryDirection,
  type DeliveryStatus,
} from './webhooks-logic'

type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>

interface RawDeliveryRow {
  id: string
  source: string
  direction: string
  status: string
  reference: string | null
  detail: Record<string, unknown> | null
  occurred_at: string
}

function mapDeliveryRow(row: RawDeliveryRow): WebhookDelivery {
  return {
    id: row.id,
    source: row.source,
    direction: row.direction as DeliveryDirection,
    status: row.status as DeliveryStatus,
    reference: row.reference,
    detail: row.detail ?? {},
    occurredAt: row.occurred_at,
  }
}

const getWebhookHealthInputSchema = z.object({
  days: z.number().int().min(1).max(90).default(14),
  /** Hard cap on rows read (bounded window — never fetch-all). */
  max: z.number().int().min(1).max(1000).default(500),
})
export type GetWebhookHealthInput = z.input<typeof getWebhookHealthInputSchema>

export async function getWebhookHealth(
  input?: GetWebhookHealthInput,
): Promise<ActionResult<WebhookHealthSummary>> {
  if (!(await getIsGroupAdmin())) {
    return fail('FORBIDDEN_LANE', 'El estado de webhooks es solo para administradores del grupo / Webhook health is group-admin only')
  }

  const parsed = getWebhookHealthInputSchema.safeParse(input ?? {})
  if (!parsed.success) {
    return fail('VALIDATION', 'Parámetros inválidos / Invalid parameters', parsed.error.flatten().fieldErrors)
  }
  const { days, max } = parsed.data

  const service = createServiceClient()
  if (!service) return fail('VALIDATION', 'Servicio no disponible / Service unavailable')

  const sinceMs = Date.now() - days * 24 * 60 * 60 * 1000
  const since = new Date(sinceMs).toISOString()

  const { data, error } = await (service as ServiceClient)
    .schema('tower')
    .from('webhook_deliveries')
    .select('id,source,direction,status,reference,detail,occurred_at')
    .gte('occurred_at', since)
    .order('occurred_at', { ascending: false })
    .limit(max)

  if (error) return fail('VALIDATION', 'No se pudo leer el estado de webhooks / Could not read webhook health')

  const rows = ((data ?? []) as unknown as RawDeliveryRow[]).map(mapDeliveryRow)
  return ok(summarizeWebhookHealth(rows, { windowDays: days, recentLimit: 50 }))
}
