import { EmptyState } from '@/components/ui/EmptyState'
import { BacklogView } from '@/components/backlog'
import { listTasks } from '@/lib/actions/tasks'
import { listClients, listClientBrands, listTeamRoster } from '@/lib/actions/clients'
import { whoami } from '@/lib/actions/session'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// Backlog — every open task across the caller's clients, over tower.tasks (live
// with RLS + audit since Wave 1, wired into the app for the first time here).
// Server-rendered initial data; the interactive shell (BacklogView) owns
// create/status changes. Mirrors the Clients/Suppliers force-dynamic pattern.
export const dynamic = 'force-dynamic'

const TAG = 'BKL · Backlog'
const TITLE = { es: 'Backlog', en: 'Backlog' }

export default async function BacklogPage() {
  const [tasksRes, whoRes, clientsRes, brandsRes, rosterRes] = await Promise.all([
    listTasks(),
    whoami(),
    listClients(),
    listClientBrands(),
    listTeamRoster(),
  ])

  if (tasksRes.error || whoRes.error) {
    return (
      <EmptyState
        tag={TAG}
        title={TITLE}
        description={{
          es: 'No se pudo cargar el backlog. Intenta de nuevo.',
          en: 'Could not load the backlog. Please try again.',
        }}
      />
    )
  }

  return (
    <BacklogView
      initialTasks={tasksRes.data}
      currentUserId={whoRes.data.userId}
      roster={rosterRes.error ? [] : rosterRes.data}
      brands={brandsRes.error ? [] : brandsRes.data}
      clients={
        clientsRes.error
          ? []
          : clientsRes.data.map((c) => ({ id: c.id, name: c.name, brandName: c.brandName }))
      }
      locale={DEFAULT_LOCALE}
    />
  )
}
