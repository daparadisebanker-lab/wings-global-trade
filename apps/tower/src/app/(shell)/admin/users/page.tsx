import { EmptyState } from '@/components/ui/EmptyState'
import { UserManager } from '@/components/admin/user-manager'
import { listLanes } from '@/lib/actions/admin'
import { listRepresentedBrands } from '@/lib/actions/represented-brands'

// UserManager page. Lane columns for the membership matrix + the represented
// brands for the rep-enrollment target selector are fetched server-side
// (group-admin-gated); the user list itself refetches client-side after
// invites/edits.
export default async function AdminUsersPage() {
  const [lanesResult, brandsResult] = await Promise.all([listLanes(), listRepresentedBrands()])

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

  // Brands are a soft dependency (only the rep-enrollment selector needs them);
  // degrade to an empty list rather than blocking the whole page.
  const brands = brandsResult.error
    ? []
    : brandsResult.data.map((b) => ({ id: b.id, code: b.code, name: b.name }))

  return <UserManager lanes={lanesResult.data} brands={brands} />
}
