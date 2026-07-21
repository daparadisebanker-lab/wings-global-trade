import { EmptyState } from '@/components/ui/EmptyState'
import { ClientsWindow } from '@/components/clients'
import { listClients } from '@/lib/actions/clients'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// Clients window — the per-lane clients database over tower.accounts (RLS-scoped
// via listClients). Server-rendered; mirrors the Quotations/Signals force-dynamic
// pattern.
export const dynamic = 'force-dynamic'

const TAG = 'CLI · Clientes'
const TITLE = { es: 'Clientes', en: 'Clients' }

export default async function ClientsPage() {
  const result = await listClients()

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

  return <ClientsWindow items={result.data} locale={DEFAULT_LOCALE} />
}
