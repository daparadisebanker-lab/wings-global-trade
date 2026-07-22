// src/app/auth/email-signin/route.ts
// Passcode sign-in — replaces the magic-link round trip. The operator enters
// their email + the shared team passcode; if the passcode matches AND the email
// belongs to a provisioned account (an admin created their tower.profiles row),
// we mint a real Supabase session server-side (no email is sent) and drop them
// into the shell. RLS is untouched — the session is an ordinary Supabase JWT, so
// auth.uid() and every policy keep working exactly as before.
//
// Security posture (deliberate, internal tool). Removing the magic link makes the
// email the identifier and the shared passcode the secret:
//   1. the passcode gates entry (constant-time compared);
//   2. the per-email tower.profiles check bounds entry to people an admin has
//      authorized — auth-user existence alone (e.g. a leftover OTP self-signup)
//      is NOT enough;
//   3. a stranger who reaches Supabase's OTP endpoint directly still lands
//      profile-less → tower.is_group_admin() is false and every RLS policy
//      returns nothing → an empty, powerless shell.
// Hardening backlog (see the session notes): rotate/lengthen the passcode into
// TOWER_ACCESS_PASSCODE, add rate limiting, and — once external reps are migrated
// off magic links — restrict public signups at the Supabase Auth layer. Do NOT
// disable the email provider outright: generateLink() below depends on it.
import { NextResponse, type NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Shared team passcode. Prefer TOWER_ACCESS_PASSCODE in the environment; the
 *  literal fallback keeps the door working before the env var is set. Move the
 *  value fully into the environment for production hygiene. */
function expectedPasscode(): string {
  return process.env.TOWER_ACCESS_PASSCODE?.trim() || 'WGT2026'
}

/** Constant-time compare so the passcode can't be probed by response timing. */
function passcodeMatches(input: string): boolean {
  const a = Buffer.from(input)
  const b = Buffer.from(expectedPasscode())
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Bounce back to the login form with a coded, non-leaky error. 303 so the
 *  browser re-issues a GET (POST → login page). */
function back(origin: string, error: string): NextResponse {
  return NextResponse.redirect(new URL(`/login?error=${error}`, origin), { status: 303 })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { origin } = request.nextUrl

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return back(origin, 'email')
  }

  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const passcode = String(form.get('passcode') ?? '')

  if (!EMAIL_RE.test(email)) return back(origin, 'email')
  if (!passcodeMatches(passcode)) return back(origin, 'passcode')

  const service = createServiceClient()
  const supabase = await createServerSupabase()
  if (!service || !supabase) return back(origin, 'config')

  // Resolve + authorize in one step: generateLink('magiclink') both proves the
  // auth user exists (it errors otherwise) and returns a consumable email OTP.
  // No email is sent — we consume the token ourselves via verifyOtp below.
  const { data: link, error: linkError } = await service.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })
  if (linkError || !link?.user) return back(origin, 'denied')

  // Authorization gate: an admin must have provisioned this person (a
  // tower.profiles row exists). Existence in auth alone is not access.
  const { data: profile, error: profileError } = await service
    .schema('tower')
    .from('profiles')
    .select('id')
    .eq('id', link.user.id)
    .maybeSingle()
  if (profileError) return back(origin, 'config')
  if (!profile) return back(origin, 'denied')

  const otp = (link.properties as { email_otp?: string } | null)?.email_otp
  if (!otp) return back(origin, 'link')

  // Consume the OTP on the cookie-writing server client → sets the session
  // cookies (same mechanism as /auth/callback's exchangeCodeForSession).
  const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
  if (verifyError) {
    console.error('[auth/email-signin] verifyOtp failed:', verifyError.code ?? verifyError.message)
    return back(origin, 'link')
  }

  return NextResponse.redirect(new URL('/catalog', origin), { status: 303 })
}
