import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Public paths that never require a session.
const PUBLIC_PREFIXES = ['/login', '/auth']

/**
 * Refresh the Supabase session on every request and protect the (shell) routes:
 * an unauthenticated request to anything but a public path is redirected to
 * /login. When Supabase env is absent (dev/preview without secrets) updateSession
 * no-ops and returns a null user — we let the request through so the scaffold
 * still boots and renders (memberships degrade to empty).
 *
 * The reverse also holds: a request that ALREADY carries a valid session should
 * never be shown the login form. The middleware refreshes the session on every
 * request, so a returning operator is recognised silently — landing on /login is
 * bounced straight into the app. That is what makes "sign in once, stay in" true;
 * you never re-request a magic link while the session is alive.
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  // Only guard when auth is actually configured — otherwise the whole app would
  // be an unreachable redirect loop in an unconfigured environment.
  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  if (authConfigured && !user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Already signed in and sitting on the login screen → recognise the user and
  // send them into the app. Scoped to /login only, never /auth/* (the callback
  // must run to complete the PKCE exchange even while a session is settling).
  // Carry the freshly-refreshed auth cookies onto the redirect so the hop never
  // drops the session it just renewed.
  if (authConfigured && user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/signals'
    url.search = ''
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  return response
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
