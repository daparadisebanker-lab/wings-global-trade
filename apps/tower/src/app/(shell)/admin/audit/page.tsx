import { EmptyState } from '@/components/ui/EmptyState'
import { AuditExplorer } from '@/components/admin/audit-explorer'
import { getAuditFacets } from '@/lib/actions/audit'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// AuditExplorer (COMPONENT_TREE §6) — Wave 5. Group-admin only. Server-fetches
// the filter facets (which also proves the group-admin gate: getAuditFacets
// returns FORBIDDEN_LANE for non-admins), then hands off to the client-side,
// server-paginated AuditExplorer.
export const dynamic = 'force-dynamic'

const TAG = 'ADM · Audit'
const TITLE = { es: 'Auditoría', en: 'Audit' }

export default async function AuditPage() {
  const facetsResult = await getAuditFacets()

  if (facetsResult.error) {
    const copy =
      facetsResult.error.code === 'FORBIDDEN_LANE'
        ? {
            es: 'La auditoría es solo para administradores del grupo.',
            en: 'The audit log is restricted to group admins.',
          }
        : {
            es: 'No se pudo cargar la auditoría. Intenta de nuevo.',
            en: 'Could not load the audit log. Please try again.',
          }
    return <EmptyState tag={TAG} title={TITLE} description={copy} />
  }

  return <AuditExplorer facets={facetsResult.data} locale={DEFAULT_LOCALE} />
}
