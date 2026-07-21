import { EmptyState } from '@/components/ui/EmptyState'
import { CatalogSpecView } from '@/components/catalog/catalog-browse'
import { getProduct } from '@/lib/actions/catalog'

// Read-only spec view within the pure-rep browse. `getProduct` is RLS-scoped:
// it returns only a product the caller may read (for a pure rep, a PUBLISHED
// row via tower_31). No capability lookup, no editor — a rep reads the spec,
// they never touch it.
export default async function CatalogBrowseSpecPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productResult = await getProduct(id)

  if (productResult.error) {
    return (
      <EmptyState
        tag="CAT · Ficha / Spec"
        title={{ es: 'Producto no encontrado', en: 'Product not found' }}
        description={{
          es: 'No existe o no tienes acceso a este producto.',
          en: 'It does not exist or you have no access to this product.',
        }}
      />
    )
  }

  return <CatalogSpecView product={productResult.data} />
}
