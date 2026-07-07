import { EmptyState } from '@/components/ui/EmptyState'
import { UserManager } from '@/components/admin/user-manager'
import { listLanes } from '@/lib/actions/admin'

// UserManager page. Lane columns for the membership matrix are fetched
// server-side (listLanes, group-admin-gated); the user list itself refetches
// client-side after invites/edits.
export default async function AdminUsersPage() {
  const lanesResult = await listLanes()

  if (lanesResult.error) {
    return (
      <EmptyState
        tag="ADM · Users"
        title={{ es: 'Usuarios', en: 'Users' }}
        description={{
          es: 'No se pudieron cargar las lanes para la matriz.',
          en: 'Could not load lanes for the matrix.',
        }}
      />
    )
  }

  return <UserManager lanes={lanesResult.data} />
}
