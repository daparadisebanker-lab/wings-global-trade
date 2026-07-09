'use server'

// src/lib/actions/session.ts
// Reference server action demonstrating the auth → (Zod) → RLS-query shape that
// every TOWER mutation follows. `whoami` performs no mutation (safe to ship in
// the scaffold); it only proves the auth gate and the ActionResult contract that
// feature-wave actions build on. Real mutations arrive with their modules.
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'

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
