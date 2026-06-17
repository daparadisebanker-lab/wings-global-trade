// src/lib/supabase/client.ts
// Browser client using the public anon key. Read-only access to
// `categories` and `products` (enforced by RLS). Never used for writes.

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are not configured.')
  }

  return createBrowserClient(url, anonKey)
}

/** True when the public Supabase config is present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
