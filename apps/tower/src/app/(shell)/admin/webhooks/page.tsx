import { EmptyState } from '@/components/ui/EmptyState'
import { WebhookHealth } from '@/components/admin/webhook-health'
import { getWebhookHealth } from '@/lib/actions/webhooks'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// WebhookHealth (COMPONENT_TREE §6) — Wave 5. Group-admin only. Fully
// server-rendered from the bounded delivery window (getWebhookHealth gates on
// the RLS-scoped is_group_admin flag; a non-admin gets a FORBIDDEN empty
// state). No client query needed.
export const dynamic = 'force-dynamic'

const TAG = 'ADM · Webhooks'
const TITLE = { es: 'Estado de Webhooks', en: 'Webhook Health' }

export default async function WebhooksPage() {
  const result = await getWebhookHealth()

  if (result.error) {
    const copy =
      result.error.code === 'FORBIDDEN_LANE'
        ? {
            es: 'El estado de webhooks es solo para administradores del grupo.',
            en: 'Webhook health is restricted to group admins.',
          }
        : {
            es: 'No se pudo cargar el estado de webhooks. Intenta de nuevo.',
            en: 'Could not load webhook health. Please try again.',
          }
    return <EmptyState tag={TAG} title={TITLE} description={copy} />
  }

  return <WebhookHealth summary={result.data} locale={DEFAULT_LOCALE} />
}
