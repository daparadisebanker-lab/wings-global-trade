import { EmptyState } from '@/components/ui/EmptyState'
import { ProductEditor } from '@/components/catalog/product-editor'
import { getLaneCapabilities, listEditableLanes } from '@/lib/actions/catalog'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ lane?: string }>
}) {
  const params = await searchParams
  const lanesResult = await listEditableLanes()
  const lanes = lanesResult.data ?? []

  if (lanes.length === 0) {
    return (
      <EmptyState
        tag="CAT · Nuevo producto"
        title={{ es: 'Sin lanes disponibles', en: 'No lanes available' }}
        description={{
          es: 'No tienes lanes asignadas para crear productos.',
          en: 'You have no lanes assigned to create products.',
        }}
      />
    )
  }

  const initialLaneId = params.lane && lanes.some((l) => l.laneId === params.lane) ? params.lane : lanes[0].laneId
  const capsResult = await getLaneCapabilities(initialLaneId)
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
      mode="new"
      product={null}
      laneOptions={lanes}
      initialLaneId={initialLaneId}
      capabilities={capabilities}
      initialVersions={[]}
      initialMedia={[]}
      publicSiteBaseUrl={process.env.NEXT_PUBLIC_SITE_URL}
    />
  )
}
