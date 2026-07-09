// src/lib/supabase/middleware.ts
// Session-refresh helper for Next middleware. Refreshes the Supabase auth cookie
// on every request and returns the resolved user so the middleware can protect
// the (shell) routes. When env is absent it no-ops (returns a pass-through
// response + null user) so the app still boots in a dev/preview without secrets.
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

function clean(s: string | undefined): string | undefined {
  if (!s) return s
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}

export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null }> {
  let response = NextResponse.next({ request })

  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!url || !anonKey) {
    return { response, user: null }
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // Do not run code between createServerClient and getUser() — it refreshes the
  // token and rewrites the cookies onto `response`.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}
