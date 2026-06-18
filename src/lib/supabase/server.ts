// src/lib/supabase/server.ts
// Server-side client using the service role key. Used ONLY in API routes.
// Bypasses RLS — never import this into client components.

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

// Strip UTF-8 BOM (U+FEFF) that PowerShell pipe encoding can inject into env vars.
function clean(s: string | undefined): string | undefined {
  if (!s) return s
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}

let cached: SupabaseClient | null = null

/**
 * Returns a service-role Supabase client, or null when env vars are absent.
 * Callers must handle the null case (e.g. dev without a live database).
 */
export function createServiceClient(): SupabaseClient | null {
  if (cached) return cached

  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!url || !serviceKey) {
    return null
  }

  cached = createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

export function isServiceConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}
