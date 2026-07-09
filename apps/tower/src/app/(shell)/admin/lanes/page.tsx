import { EmptyState } from '@/components/ui/EmptyState'
import { LaneRegistry } from '@/components/admin/lane-registry'
import { listBrands } from '@/lib/actions/admin'

// LaneRegistry page. Brands (for the register form's tenant select) are fetched
// server-side; the lanes table itself refetches client-side after register/flip.
export default async function AdminLanesPage() {
  const brandsResult = await listBrands()

  if (brandsResult.error) {
    return (
      <EmptyState
        tag="ADM · Lanes"
        title={{ es: 'Lanes', en: 'Lanes' }}
        description={{
          es: 'No se pudieron cargar las marcas.',
          en: 'Could not load brands.',
        }}
      />
    )
  }

  return <LaneRegistry brands={brandsResult.data} />
}
