// src/app/auth/email-signin/route.ts
// Passcode sign-in — replaces the magic-link round trip. The operator enters
// their email + the shared team passcode; if the passcode matches AND the email
// is authorized, we mint a real Supabase session server-side (no email is sent)
// and drop them into the shell. RLS is untouched — the session is an ordinary
// Supabase JWT, so auth.uid() and every policy keep working exactly as before.
//
// Two authorization paths:
//   1. Allowlisted team (lib/auth/allowlist.ts) → auto-provisioned as a group
//      admin on first sign-in: their auth account + tower.profiles row are
//      created on the spot. This is the "enter your email and you're in" path.
//   2. Anyone else → must already have a tower.profiles row (an admin added them
//      from Usuarios / Users). Existence in auth alone is not access.
//
// Security posture (deliberate, internal tool). Removing the magic link makes the
// email the identifier and the shared passcode the secret. To reach admin you
// need BOTH the passcode AND an allowlisted address. A stranger who reaches
// Supabase's OTP endpoint directly still lands profile-less → tower.is_group_admin()
// is false and every RLS policy returns nothing → an empty, powerless shell.
// Hardening backlog: move the passcode + allowlist into the environment
// (TOWER_ACCESS_PASSCODE / TOWER_ADMIN_ALLOWLIST) so repo access alone is not app
// access, lengthen the passcode, and add rate limiting. Do NOT disable the email
// provider outright — generateLink() below depends on it.
import { NextResponse, type NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { isAllowlisted } from '@/lib/auth/allowlist'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Shared team passcode. Prefer TOWER_ACCESS_PASSCODE in the environment; the
 *  literal fallback keeps the door working before the env var is set. */
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

  const allow = isAllowlisted(email)

  // Resolve the auth user. generateLink('magiclink') both proves the user exists
  // (it errors otherwise) and returns a consumable email OTP — no email is sent.
  let link = await service.auth.admin.generateLink({ type: 'magiclink', email })
  if (link.error || !link.data?.user) {
    // No account yet. Only an allowlisted first-timer may be created on sign-in.
    if (!allow) return back(origin, 'denied')
    const created = await service.auth.admin.createUser({ email, email_confirm: true })
    if (created.error || !created.data?.user) {
      console.error('[auth/email-signin] createUser failed:', created.error?.message)
      return back(origin, 'link')
    }
    link = await service.auth.admin.generateLink({ type: 'magiclink', email })
    if (link.error || !link.data?.user) return back(origin, 'link')
  }
  const userId = link.data?.user?.id
  if (!userId) return back(origin, 'link')

  if (allow) {
    // Auto-provision as group admin. Preserve an existing display name; only
    // seed the name when the profile is first created.
    const { data: existing, error: readError } = await service
      .schema('tower')
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    if (readError) return back(origin, 'config')
    const write = existing
      ? await service.schema('tower').from('profiles').update({ is_group_admin: true }).eq('id', userId)
      : await service
          .schema('tower')
          .from('profiles')
          .insert({ id: userId, full_name: allow.name, is_group_admin: true })
    if (write.error) {
      console.error('[auth/email-signin] profile provision failed:', write.error.message)
      return back(origin, 'config')
    }
  } else {
    // Not allowlisted → an admin must have provisioned them (profile exists).
    const { data: profile, error: profileError } = await service
      .schema('tower')
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    if (profileError) return back(origin, 'config')
    if (!profile) return back(origin, 'denied')
  }

  const otp = (link.data.properties as { email_otp?: string } | null)?.email_otp
  if (!otp) return back(origin, 'link')

  // Consume the OTP on the cookie-writing server client → sets the session
  // cookies (same mechanism as /auth/callback's exchangeCodeForSession).
  const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
  if (verifyError) {
    console.error('[auth/email-signin] verifyOtp failed:', verifyError.code ?? verifyError.message)
    return back(origin, 'link')
  }

  // /signals is the post-login home (P7 operations cockpit) — matches the
  // middleware and /auth/callback destinations.
  return NextResponse.redirect(new URL('/signals', origin), { status: 303 })
}
