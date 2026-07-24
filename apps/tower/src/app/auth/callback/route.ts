// src/app/auth/callback/route.ts
// Server-side auth callback — the magic-link / OAuth landing point.
//
// Why this exists: emailRedirectTo used to point straight at /catalog, so the
// PKCE ?code= exchange raced the middleware auth guard (unauthenticated /catalog
// → bounced to /login before the browser client could exchange). This route
// exchanges the code server-side (the PKCE verifier lives in a cookie via
// @supabase/ssr) and only then redirects into the shell. /auth/* is already in
// the middleware's PUBLIC_PREFIXES.
//
// Also accepts token_hash+type so the Supabase email template can later switch
// to the {{ .TokenHash }} pattern (immune to open-in-a-different-browser PKCE
// failures); handled today even though the default template doesn't send it.
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Only same-origin absolute paths — never an open redirect. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/signals'
  return raw
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeNext(searchParams.get('next'))
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const supabase = await createServerSupabase()
  if (!supabase) {
    return NextResponse.redirect(new URL('/login?error=config', origin))
  }

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(new URL(next, origin))
      console.error('[auth/callback] code exchange failed:', error.code ?? error.message)
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      if (!error) return NextResponse.redirect(new URL(next, origin))
      console.error('[auth/callback] token_hash verify failed:', error.code ?? error.message)
    }
  } catch (err) {
    console.error('[auth/callback]', err)
  }

  return NextResponse.redirect(new URL('/login?error=link', origin))
}
