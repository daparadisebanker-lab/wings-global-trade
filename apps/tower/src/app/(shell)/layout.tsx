import type { ReactNode } from 'react'
import { ShellChrome } from '@/components/shell/ShellChrome'
import { TowerQueryProvider } from '@/components/shell/TowerQueryProvider'
import { getLaneMemberships, getIsGroupAdmin, getHasRbMembership } from '@/lib/lanes/memberships'
import { createServerSupabase } from '@/lib/supabase/server'
import { getMyRepProfile } from '@/lib/actions/rep-profile'
import { getMentionStatus } from '@/lib/actions/team-space'

/**
 * Function budget for every (shell) route — and, critically, for the SERVER
 * ACTIONS invoked from them, which run in this segment's function rather than in
 * a route of their own.
 *
 * Mister's dock is global chrome, so `askMister` runs here. Every AI *route*
 * (/api/ai/*) already declares 30–120s; the action path declared nothing and so
 * inherited the platform default, far below what two Opus calls need. The
 * function is then killed mid-call: no message, no log line, no cause — a hard
 * ceiling no application tuning can lift. Verified in the build output
 * (.next/server/functions-config-manifest.json): this export propagates to all
 * 31 child pages of the group.
 *
 * ── This number MUST be a literal. ──
 * Next static-analyses the export; `MISTER_BUDGET.functionSeconds` fails the
 * build with "Unsupported node type MemberExpression". So the one rung of the
 * timeout ladder that matters most is the one that cannot be imported from it.
 * That is exactly why lib/ai/budget.test.ts parses this file and asserts the
 * value still sits outside the client watchdog — the test is the only thing
 * keeping these two in step.
 *
 * 60, not more: it is the largest value valid on every Vercel plan (Hobby caps
 * at 60), so this can never become an environment-dependent failure.
 */
export const maxDuration = 60

/**
 * Server layout for every (shell) route. Fetches the current user + their lane
 * memberships server-side (RLS-scoped) and hands them to the client chrome. If
 * the DB isn't reachable yet (Wave-1, empty tower schema) both degrade to empty
 * — the shell renders, it never crashes. The middleware has already redirected
 * unauthenticated requests to /login before this runs.
 */
export default async function ShellLayout({ children }: { children: ReactNode }) {
  const [memberships, isGroupAdmin, hasRbMembership, repProfile, mentionStatus] = await Promise.all([
    getLaneMemberships(),
    getIsGroupAdmin(),
    getHasRbMembership(),
    getMyRepProfile(),
    getMentionStatus(),
  ])

  // A rep must onboard when they have a rep_profiles row (enrollment seeded it)
  // that is not yet complete (onboarded_at null). Users who were never enrolled
  // as reps have no row → no banner. Gentle prompt only, never a hard block.
  const needsOnboarding = !repProfile.error && repProfile.data != null && repProfile.data.onboardedAt == null

  // Prefer the rep's display name over their raw account email in the shell
  // identity. Empty/whitespace-only names fall through to the email.
  const rawName = repProfile.error ? null : repProfile.data?.displayName ?? null
  const userName = rawName && rawName.trim() ? rawName.trim() : null
  // The rep's role/title (rail identity, under their name). Null when unset.
  const repTitle = repProfile.error ? null : repProfile.data?.title ?? null

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
        userName={userName}
        userEmail={userEmail}
        repTitle={repTitle}
        teamSpaceEnabled={mentionStatus.available}
        unreadMentions={mentionStatus.unread}
        isGroupAdmin={isGroupAdmin}
        hasRbMembership={hasRbMembership}
        needsOnboarding={needsOnboarding}
      >
        {children}
      </ShellChrome>
    </TowerQueryProvider>
  )
}
