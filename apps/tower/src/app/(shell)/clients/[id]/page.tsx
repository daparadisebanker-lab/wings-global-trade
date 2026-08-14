import { EmptyState } from '@/components/ui/EmptyState'
import { ClientDetail } from '@/components/clients/ClientDetail'
import { getClient, listClientBrands, listTeamRoster } from '@/lib/actions/clients'
import { listAccountSuppliers } from '@/lib/actions/account-suppliers'
import { listRfqsForAccount, listOrdersForAccount } from '@/lib/actions/pipeline'
import { listQuotationsForAccount } from '@/lib/actions/quotations'
import { listSuppliers } from '@/lib/actions/suppliers'
import { listTasksForAccount } from '@/lib/actions/tasks'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// The client window — one client's profile plus everything running against it
// (tower_61). Server-rendered initial data; the interactive shell (ClientDetail)
// owns editing + supplier assignment. Mirrors the Clients/Suppliers
// force-dynamic pattern.
export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [clientRes, brandsRes, rosterRes, suppliersRes, assignedRes, rfqsRes, quotationsRes, ordersRes, tasksRes] =
    await Promise.all([
      getClient(id),
      listClientBrands(),
      listTeamRoster(),
      listSuppliers(),
      listAccountSuppliers(id),
      listRfqsForAccount(id),
      listQuotationsForAccount(id),
      listOrdersForAccount(id),
      listTasksForAccount(id),
    ])

  if (clientRes.error) {
    return (
      <EmptyState
        tag="CLI · Cliente"
        title={{ es: 'Cliente no encontrado', en: 'Client not found' }}
        description={{
          es: 'No existe o no tienes acceso a este cliente.',
          en: 'It does not exist or you have no access to this client.',
        }}
      />
    )
  }

  const roster = rosterRes.error ? [] : rosterRes.data
  const ownerName = clientRes.data.ownerId
    ? (roster.find((o) => o.id === clientRes.data.ownerId)?.name ?? null)
    : null

  return (
    <ClientDetail
      client={clientRes.data}
      brands={brandsRes.error ? [] : brandsRes.data}
      roster={roster}
      ownerName={ownerName}
      suppliers={suppliersRes.error ? [] : suppliersRes.data}
      initialAssignedSuppliers={assignedRes.error ? [] : assignedRes.data}
      initialRfqs={rfqsRes.error ? [] : rfqsRes.data}
      initialQuotations={quotationsRes.error ? [] : quotationsRes.data}
      initialOrders={ordersRes.error ? [] : ordersRes.data}
      initialTasks={tasksRes.error ? [] : tasksRes.data}
      locale={DEFAULT_LOCALE}
    />
  )
}
