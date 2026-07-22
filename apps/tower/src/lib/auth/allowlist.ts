// src/lib/auth/allowlist.ts
// The authorized team. Anyone on this list who signs in with the shared passcode
// (auth/email-signin/route.ts) is auto-provisioned as a group admin on first
// sign-in — their auth account and tower.profiles row are created on the spot,
// no invite and no manual grant. Everyone else must be provisioned by an admin
// from Usuarios / Users before they can sign in.
//
// The real addresses are baked in here so launch is zero-config. For production
// hygiene, move them into the TOWER_ADMIN_ALLOWLIST env var (a comma-separated
// list of emails) — when it is set it takes over and nothing sensitive lives in
// the repo. Pair it with TOWER_ACCESS_PASSCODE so repo read access alone never
// grants app access.
export interface AllowlistEntry {
  email: string
  name: string
}

const TEAM: AllowlistEntry[] = [
  { email: 'daparadisebanker@gmail.com', name: 'Muaaz Muhammad' },
  { email: 'huzaifamuhammad246@gmail.com', name: 'Huzaifa Muhammad' },
  { email: 'wingsautomoviles@gmail.com', name: 'Nawaz Muhammad' },
  { email: 'saadthebest14@gmail.com', name: 'Saad Muhammad' },
  { email: 'worldwideccenterprises@gmail.com', name: 'Ahmad Ali' },
]

/** email (lowercased) → entry. Env override wins; otherwise the baked-in team. */
function adminAllowlist(): Map<string, AllowlistEntry> {
  const env = process.env.TOWER_ADMIN_ALLOWLIST?.trim()
  const entries: AllowlistEntry[] = env
    ? env
        .split(',')
        .map((raw) => raw.trim().toLowerCase())
        .filter(Boolean)
        .map((email) => ({ email, name: email.split('@')[0] ?? email }))
    : TEAM.map((t) => ({ email: t.email.toLowerCase(), name: t.name }))
  return new Map(entries.map((e) => [e.email, e]))
}

/** The allowlist entry for an email, or null if it is not authorized. */
export function isAllowlisted(email: string): AllowlistEntry | null {
  return adminAllowlist().get(email.trim().toLowerCase()) ?? null
}
