import { EmptyState } from '@/components/ui/EmptyState'
import { TeamSpace } from '@/components/team/TeamSpace'
import { listTeamNotes, listMyMentions, listTeamRoster } from '@/lib/actions/team-space'
import { createServerSupabase } from '@/lib/supabase/server'

// Team space (WS6) — the org-wide internal note stream with @mentions raising
// in-system notifications (D3, no email). Server-fetches the stream, the caller's
// mentions and the @mention roster, then hands them to the client surface. The
// notes read is the availability probe: while tower_55 is unapplied it errors, so
// the page renders the "coming soon" state (TeamSpace hides the composer) rather
// than crashing or claiming an empty stream.
export default async function EquipoPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } }

  if (!user) {
    return (
      <EmptyState
        tag="EQP · Equipo"
        title={{ es: 'Sesión requerida', en: 'Sign-in required' }}
        description={{ es: 'Inicia sesión para ver el espacio de equipo.', en: 'Sign in to see the team space.' }}
      />
    )
  }

  const [notesResult, mentionsResult, rosterResult] = await Promise.all([
    listTeamNotes(),
    listMyMentions(),
    listTeamRoster(),
  ])

  // The notes read is the canonical probe: success (even empty) means the backend
  // is live; an error means tower_55 isn't applied yet → coming-soon.
  const available = !notesResult.error

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex flex-col gap-1 border-b border-line pb-4">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">EQP · Espacio de equipo</span>
        <h1 className="font-display text-t2 text-ink-primary">Equipo</h1>
      </header>
      <TeamSpace
        available={available}
        currentUserId={user.id}
        initialNotes={notesResult.error ? [] : notesResult.data}
        initialMentions={mentionsResult.error ? [] : mentionsResult.data}
        roster={rosterResult.error ? [] : rosterResult.data}
      />
    </div>
  )
}
