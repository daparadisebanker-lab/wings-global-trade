// src/lib/supabase/server.ts
// Server-side client using the service role key. Used ONLY in API routes.
// Bypasses RLS — never import this into client components.

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/**
 * Returns a service-role Supabase client, or null when env vars are absent.
 * Callers must handle the null case (e.g. dev without a live database).
 */
export function createServiceClient(): SupabaseClient | null {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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
