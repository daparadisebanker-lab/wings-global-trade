import { redirect } from 'next/navigation'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductTable } from '@/components/catalog/product-table'
import { listEditableLanes } from '@/lib/actions/catalog'
import { getHasRbMembership } from '@/lib/lanes/memberships'

// Catalog Studio (PIM) — Wave 2. Server-fetches the lanes the current user
// can edit (RLS-mirroring `listEditableLanes`), then hands off to the
// client-side, server-paginated ProductTable.
//
// The "pure rep" persona (RB read across the catalog via tower_31, no editable
// lane) has no Studio to show, but reaches the same "Catálogo" nav item. When a
// user has zero editable lanes yet holds an RB membership, route them to the
// read-only cross-category browse instead of dead-ending on the empty state.
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ lane?: string }>
}) {
  const params = await searchParams
  const lanesResult = await listEditableLanes()

  if (lanesResult.error) {
    return (
      <EmptyState
        tag="CAT · Catalog Studio"
        title={{ es: 'Catálogo', en: 'Catalog' }}
        description={{
          es: 'No se pudo cargar el catálogo. Intenta de nuevo.',
          en: 'Could not load the catalog. Please try again.',
        }}
      />
    )
  }

  const lanes = lanesResult.data

  if (lanes.length === 0) {
    // No editable lane: a pure rep browses the published catalog read-only;
    // anyone else genuinely has nothing here yet.
    if (await getHasRbMembership()) redirect('/catalog/browse')

    return (
      <EmptyState
        tag="CAT · Catalog Studio"
        title={{ es: 'Catálogo', en: 'Catalog' }}
        description={{
          es: 'No tienes lanes asignadas todavía. Pide a un administrador que te asigne una.',
          en: 'You have no lanes assigned yet. Ask an admin to assign you one.',
        }}
      />
    )
  }

  const initialLaneId = params.lane && lanes.some((l) => l.laneId === params.lane) ? params.lane : undefined

  // `listEditableLanes` already mirrors the RLS-backed CATALOG_EDITOR/
  // LANE_DIRECTOR/group-admin boundary, so any lane it returns is one the
  // user may create in — no second capability round-trip needed here.
  return <ProductTable lanes={lanes} initialLaneId={initialLaneId} canCreateAny={lanes.length > 0} />
}
