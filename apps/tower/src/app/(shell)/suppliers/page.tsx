import { EmptyState } from '@/components/ui/EmptyState'
import { SuppliersView } from '@/components/suppliers'
import { listSupplierOffers, listSuppliers } from '@/lib/actions/suppliers'
import { listClientBrands } from '@/lib/actions/clients'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// Supplier FOB Price Book — the offer history over tower.supplier_offers
// (RLS-scoped via listSupplierOffers). Server-rendered initial data; the
// interactive shell (SuppliersView) owns search/filter/create. Mirrors the
// Clients force-dynamic pattern (tower_60).
export const dynamic = 'force-dynamic'

const TAG = 'SUP · Proveedores'
const TITLE = { es: 'Proveedores', en: 'Suppliers' }

export default async function SuppliersPage() {
  const [offersRes, suppliersRes, brandsRes] = await Promise.all([
    listSupplierOffers(),
    listSuppliers(),
    listClientBrands(),
  ])

  if (offersRes.error) {
    return (
      <EmptyState
        tag={TAG}
        title={TITLE}
        description={{
          es: 'No se pudieron cargar las ofertas de proveedores. Intenta de nuevo.',
          en: 'Could not load supplier offers. Please try again.',
        }}
      />
    )
  }

  return (
    <SuppliersView
      initialItems={offersRes.data}
      suppliers={suppliersRes.error ? [] : suppliersRes.data}
      brands={brandsRes.error ? [] : brandsRes.data}
      locale={DEFAULT_LOCALE}
    />
  )
}
