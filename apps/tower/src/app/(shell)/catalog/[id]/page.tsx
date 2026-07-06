import { EmptyState } from '@/components/ui/EmptyState'
import { ProductEditor } from '@/components/catalog/product-editor'
import { getLaneCapabilities, getProduct, getProductVersions } from '@/lib/actions/catalog'
import { listMedia } from '@/lib/actions/media'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [productResult, versionsResult, mediaResult] = await Promise.all([
    getProduct(id),
    getProductVersions(id),
    listMedia(id),
  ])

  if (productResult.error) {
    return (
      <EmptyState
        tag="CAT · Producto"
        title={{ es: 'Producto no encontrado', en: 'Product not found' }}
        description={{
          es: 'No existe o no tienes acceso a este producto.',
          en: 'It does not exist or you have no access to this product.',
        }}
      />
    )
  }

  const product = productResult.data
  const capsResult = await getLaneCapabilities(product.laneId)
  const capabilities = capsResult.data ?? {
    canCreate: false,
    canEdit: false,
    canSubmitForReview: false,
    canPublish: false,
    canRetire: false,
    canRollback: false,
  }

  return (
    <ProductEditor
      mode="edit"
      product={product}
      laneOptions={[]}
      capabilities={capabilities}
      initialVersions={versionsResult.data ?? []}
      initialMedia={mediaResult.data ?? []}
      publicSiteBaseUrl={process.env.NEXT_PUBLIC_SITE_URL}
    />
  )
}
