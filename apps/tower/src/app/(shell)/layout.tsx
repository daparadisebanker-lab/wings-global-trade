import type { ReactNode } from 'react'
import { ShellChrome } from '@/components/shell/ShellChrome'
import { getLaneMemberships, getIsGroupAdmin, getHasRbMembership } from '@/lib/lanes/memberships'
import { createServerSupabase } from '@/lib/supabase/server'

/**
 * Server layout for every (shell) route. Fetches the current user + their lane
 * memberships server-side (RLS-scoped) and hands them to the client chrome. If
 * the DB isn't reachable yet (Wave-1, empty tower schema) both degrade to empty
 * — the shell renders, it never crashes. The middleware has already redirected
 * unauthenticated requests to /login before this runs.
 */
export default async function ShellLayout({ children }: { children: ReactNode }) {
  const [memberships, isGroupAdmin, hasRbMembership] = await Promise.all([
    getLaneMemberships(),
    getIsGroupAdmin(),
    getHasRbMembership(),
  ])

  let userEmail: string | null = null
  const supabase = await createServerSupabase()
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userEmail = user?.email ?? null
  }

  return (
    <ShellChrome
      memberships={memberships}
      userEmail={userEmail}
      isGroupAdmin={isGroupAdmin}
      hasRbMembership={hasRbMembership}
    >
      {children}
    </ShellChrome>
  )
}
