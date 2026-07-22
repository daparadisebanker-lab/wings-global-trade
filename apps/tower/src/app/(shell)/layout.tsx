import type { ReactNode } from 'react'
import { ShellChrome } from '@/components/shell/ShellChrome'
import { TowerQueryProvider } from '@/components/shell/TowerQueryProvider'
import { getLaneMemberships, getIsGroupAdmin, getHasRbMembership } from '@/lib/lanes/memberships'
import { createServerSupabase } from '@/lib/supabase/server'
import { getMyRepProfile } from '@/lib/actions/rep-profile'

/**
 * Server layout for every (shell) route. Fetches the current user + their lane
 * memberships server-side (RLS-scoped) and hands them to the client chrome. If
 * the DB isn't reachable yet (Wave-1, empty tower schema) both degrade to empty
 * — the shell renders, it never crashes. The middleware has already redirected
 * unauthenticated requests to /login before this runs.
 */
export default async function ShellLayout({ children }: { children: ReactNode }) {
  const [memberships, isGroupAdmin, hasRbMembership, repProfile] = await Promise.all([
    getLaneMemberships(),
    getIsGroupAdmin(),
    getHasRbMembership(),
    getMyRepProfile(),
  ])

  // A rep must onboard when they have a rep_profiles row (enrollment seeded it)
  // that is not yet complete (onboarded_at null). Users who were never enrolled
  // as reps have no row → no banner. Gentle prompt only, never a hard block.
  const needsOnboarding = !repProfile.error && repProfile.data != null && repProfile.data.onboardedAt == null

  let userEmail: string | null = null
  const supabase = await createServerSupabase()
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userEmail = user?.email ?? null
  }

  return (
    <TowerQueryProvider>
      <ShellChrome
        memberships={memberships}
        userEmail={userEmail}
        isGroupAdmin={isGroupAdmin}
        hasRbMembership={hasRbMembership}
        needsOnboarding={needsOnboarding}
      >
        {children}
      </ShellChrome>
    </TowerQueryProvider>
  )
}
