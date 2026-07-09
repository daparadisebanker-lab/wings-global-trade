// src/lib/supabase/server.ts
// Server-side Supabase clients.
//
//  - createServerSupabase(): anon key + request cookies → the RLS-scoped client
//    used by RSCs and server actions. RLS enforces permissions; this client is
//    NOT privileged. Returns null when env is absent (degrade gracefully).
//  - createServiceClient(): service-role key, bypasses RLS. Server-only, used
//    for trusted system paths (ingest, migrations). Never import into a client
//    component. Returns null when env is absent.
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

// Strip UTF-8 BOM (U+FEFF) that PowerShell pipe encoding can inject into env vars.
function clean(s: string | undefined): string | undefined {
  if (!s) return s
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}

/**
 * RLS-scoped server client bound to the request's Supabase auth cookies.
 * Returns null when public env is missing so callers can degrade to empty state.
 */
export async function createServerSupabase(): Promise<SupabaseClient | null> {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!url || !anonKey) return null

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        // In a Server Component cookie writes throw — the middleware refreshes
        // the session, so swallowing here is safe and expected.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // no-op: session refresh happens in middleware
        }
      },
    },
  })
}

let cachedService: SupabaseClient | null = null

/** Service-role client (bypasses RLS). Server-only. Null when env is absent. */
export function createServiceClient(): SupabaseClient | null {
  if (cachedService) return cachedService

  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!url || !serviceKey) return null

  cachedService = createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cachedService
}
