// src/lib/webhook-deliveries.ts
// The single writer for tower.webhook_deliveries (proposed in
// migration/wave5-webhooks.sql). Both the outbound recorder in lib/revalidate.ts
// and the inbound POST /api/hooks/revalidate-callback route land rows through
// here so the insert shape lives in one place.
//
// SERVER-ONLY: uses the service-role client. `recordWebhookDelivery` NEVER
// throws — telemetry must not break the thing it observes (same "fire-and-
// forget, errors logged not thrown" contract as triggerRevalidate). A missing
// service client or a not-yet-applied table degrades to a logged no-op.
import { createServiceClient } from '@/lib/supabase/server'
import type { DeliveryDirection, DeliveryStatus } from '@/lib/actions/webhooks-logic'

/** Source keys the app writes. `source` is validated to this shape on ingest. */
export const SOURCE_KEY_PATTERN = /^[A-Z][A-Z0-9_]{1,39}$/

export interface WebhookDeliveryInput {
  source: string
  direction: DeliveryDirection
  status: DeliveryStatus
  reference?: string | null
  /** Safe, non-PII metadata only — never a raw DB/exception string. */
  detail?: Record<string, unknown>
}

export async function recordWebhookDelivery(input: WebhookDeliveryInput): Promise<void> {
  try {
    if (!SOURCE_KEY_PATTERN.test(input.source)) {
      console.warn('[lib/webhook-deliveries] rejected malformed source', input.source)
      return
    }
    const service = createServiceClient()
    if (!service) {
      console.warn('[lib/webhook-deliveries] service client unavailable — delivery not recorded')
      return
    }
    const { error } = await service.schema('tower').from('webhook_deliveries').insert({
      source: input.source,
      direction: input.direction,
      status: input.status,
      reference: input.reference ?? null,
      detail: input.detail ?? {},
    })
    if (error) console.error('[lib/webhook-deliveries] insert failed', error.message)
  } catch (error) {
    console.error('[lib/webhook-deliveries] recordWebhookDelivery threw (swallowed)', error)
  }
}
