'use server'

// src/lib/actions/session.ts
// Reference server action demonstrating the auth → (Zod) → RLS-query shape that
// every TOWER mutation follows. `whoami` performs no mutation (safe to ship in
// the scaffold); it only proves the auth gate and the ActionResult contract that
// feature-wave actions build on. Real mutations arrive with their modules.
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'

/**
 * Sign the caller out: clear the Supabase auth cookies, then send them to /login.
 * A void server action (redirect() throws NEXT_REDIRECT internally) so it binds
 * directly to a <form action={signOut}> — no client fetch, works with JS off. In
 * a Server Action the SSR client's cookie writes succeed (unlike an RSC render),
 * so the session is genuinely cleared before the redirect. Safe when auth is not
 * configured: it simply lands on /login.
 *
 * scope:'local' — sign out ONLY this browser/session, never the operator's other
 * devices (F-UM-2). A rep signing out on their desk machine keeps their phone
 * session; least-surprise for an internal tool, and never a silent global revoke.
 *
 * We deliberately do NOT clear the client `tower-recents` trail on sign-out
 * (F-UM-3): it is per-browser and un-clearable from a server action anyway, and
 * wiping it would erase the SAME operator's next-session recap. Its labels are
 * module + short-id only and all underlying records stay RLS-guarded.
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase()
  if (supabase) await supabase.auth.signOut({ scope: 'local' })
  redirect('/login')
}

export async function whoami(): Promise<ActionResult<{ userId: string; email: string | null }>> {
  // 1 · auth
  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  // 2 · (Zod parse of input — no input here) · 3 · RLS-scoped query (none here)
  return ok({ userId: user.id, email: user.email ?? null })
}
