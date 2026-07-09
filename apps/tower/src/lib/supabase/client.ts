// src/lib/supabase/client.ts
// Browser (anon) Supabase client. All access is RLS-scoped — RLS is the entire
// permission system (CLAUDE.md Directive 1). Never used for privileged writes;
// mutations go through server actions.
import { createBrowserClient } from '@supabase/ssr'

// Strip UTF-8 BOM (U+FEFF) that PowerShell pipe encoding can inject into env vars.
function clean(s: string | undefined): string | undefined {
  if (!s) return s
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}

export function createClient() {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

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
