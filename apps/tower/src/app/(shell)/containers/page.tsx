import { EmptyState } from '@/components/ui/EmptyState'
import { ContainerBoard } from '@/components/containers/container-board'
import { getContainerCapabilities, listContainerLanes } from '@/lib/actions/containers'

// Container Desk (ERP) — Wave 3. Server-fetches the lanes the current user
// can see (mirrors Catalog Studio's page.tsx shape), resolves write
// capability for the initial lane, then hands off to the client-side,
// server-paginated ContainerBoard.
export default async function ContainersPage({
  searchParams,
}: {
  searchParams: Promise<{ lane?: string }>
}) {
  const params = await searchParams
  const lanesResult = await listContainerLanes()

  if (lanesResult.error) {
    return (
      <EmptyState
        tag="CTN · Container Desk"
        title={{ es: 'Contenedores', en: 'Containers' }}
        description={{
          es: 'No se pudieron cargar los contenedores. Intenta de nuevo.',
          en: 'Could not load containers. Please try again.',
        }}
      />
    )
  }

  const lanes = lanesResult.data

  if (lanes.length === 0) {
    return (
      <EmptyState
        tag="CTN · Container Desk"
        title={{ es: 'Contenedores', en: 'Containers' }}
        description={{
          es: 'No tienes lanes asignadas todavía. Pide a un administrador que te asigne una.',
          en: 'You have no lanes assigned yet. Ask an admin to assign you one.',
        }}
      />
    )
  }

  const initialLaneId = params.lane && lanes.some((l) => l.laneId === params.lane) ? params.lane : lanes[0]?.laneId

  const capabilities = initialLaneId ? await getContainerCapabilities(initialLaneId) : null
  const canOpenContainer = Boolean(capabilities?.data?.canWrite)

  return (
    <ContainerBoard
      lanes={lanes.map((l) => ({ laneId: l.laneId, laneCode: l.laneCode, laneName: l.laneName }))}
      initialLaneId={initialLaneId}
      canOpenContainer={canOpenContainer}
    />
  )
}
