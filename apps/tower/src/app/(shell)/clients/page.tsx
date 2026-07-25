import { EmptyState } from '@/components/ui/EmptyState'
import { ClientsView } from '@/components/clients'
import { listClients, listClientBrands, listTeamRoster } from '@/lib/actions/clients'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// Clients CRM — the per-brand client database over tower.accounts (RLS-scoped via
// listClients). Server-rendered initial data; the interactive shell (ClientsView)
// owns create/edit/board. Mirrors the Quotations/Signals force-dynamic pattern.
export const dynamic = 'force-dynamic'

const TAG = 'CLI · Clientes'
const TITLE = { es: 'Clientes', en: 'Clients' }

export default async function ClientsPage() {
  const [result, brandsRes, rosterRes] = await Promise.all([
    listClients(),
    listClientBrands(),
    listTeamRoster(),
  ])

  if (result.error) {
    return (
      <EmptyState
        tag={TAG}
        title={TITLE}
        description={{
          es: 'No se pudieron cargar los clientes. Intenta de nuevo.',
          en: 'Could not load clients. Please try again.',
        }}
      />
    )
  }

  const roster = rosterRes.error ? [] : rosterRes.data
  const owners: Record<string, string> = Object.fromEntries(roster.map((o) => [o.id, o.name]))

  return (
    <ClientsView
      initialItems={result.data}
      brands={brandsRes.error ? [] : brandsRes.data}
      roster={roster}
      owners={owners}
      locale={DEFAULT_LOCALE}
    />
  )
}
