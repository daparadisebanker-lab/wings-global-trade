import { EmptyState } from '@/components/ui/EmptyState'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import { listPipelineLanes } from '@/lib/actions/pipeline'

// Pipeline (CRM) — Wave 3. Server-fetches the lanes the current user can work
// Pipeline in (`listPipelineLanes`: SALES/LANE_DIRECTOR/group-admin — NOT
// catalog's CATALOG_EDITOR-inclusive set, since lib/rbac.ts only ever shows
// the Pipeline nav item to SALES/LANE_DIRECTOR), then hands off to the
// client-side PipelineBoard (columns = archetype stage set of the active
// lane, per COMPONENT_TREE §2).
export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ lane?: string }>
}) {
  const params = await searchParams
  const lanesResult = await listPipelineLanes()

  if (lanesResult.error) {
    return (
      <EmptyState
        tag="PIP · Pipeline"
        title={{ es: 'Pipeline', en: 'Pipeline' }}
        description={{
          es: 'No se pudo cargar el pipeline. Intenta de nuevo.',
          en: 'Could not load the pipeline. Please try again.',
        }}
      />
    )
  }

  const lanes = lanesResult.data

  if (lanes.length === 0) {
    return (
      <EmptyState
        tag="PIP · Pipeline"
        title={{ es: 'Pipeline', en: 'Pipeline' }}
        description={{
          es: 'No tienes lanes asignadas todavía. Pide a un administrador que te asigne una.',
          en: 'You have no lanes assigned yet. Ask an admin to assign you one.',
        }}
      />
    )
  }

  const initialLaneId = params.lane && lanes.some((l) => l.laneId === params.lane) ? params.lane : undefined

  return <PipelineBoard lanes={lanes} initialLaneId={initialLaneId} />
}
