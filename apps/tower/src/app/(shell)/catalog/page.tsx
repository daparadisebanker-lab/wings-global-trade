import { EmptyState } from '@/components/ui/EmptyState'
import { ProductTable } from '@/components/catalog/product-table'
import { listEditableLanes } from '@/lib/actions/catalog'

// Catalog Studio (PIM) — Wave 2. Server-fetches the lanes the current user
// can edit (RLS-mirroring `listEditableLanes`), then hands off to the
// client-side, server-paginated ProductTable.
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
