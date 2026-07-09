import { notFound } from 'next/navigation'
import { EmptyState } from '@/components/ui/EmptyState'
import { ContainerDetail } from '@/components/containers/container-detail'
import { getContainer, getContainerCapabilities } from '@/lib/actions/containers'

// Container detail route (COMPONENT_TREE §3 `/containers/[id]`). Server-fetches
// the container + the current user's capabilities for its lane (mirrors
// Catalog Studio's server-fetch-then-hand-off pattern), then renders the
// client-side ContainerDetail organ composition.
export default async function ContainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const containerResult = await getContainer(id)
  if (containerResult.error) {
    if (containerResult.error.code === 'VALIDATION') notFound()
    return (
      <EmptyState
        tag="CTN · Container Desk"
        title={{ es: 'Contenedor', en: 'Container' }}
        description={{
          es: 'Contenedor no encontrado o sin acceso.',
          en: 'Container not found or no access.',
        }}
      />
    )
  }

  const container = containerResult.data
  const capabilitiesResult = await getContainerCapabilities(container.laneId)
  const capabilities = capabilitiesResult.data ?? { canWrite: false, canCommit: false }

  return <ContainerDetail container={container} capabilities={capabilities} />
}
