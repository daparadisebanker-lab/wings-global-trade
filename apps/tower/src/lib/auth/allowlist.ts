// src/lib/auth/allowlist.ts
// The authorized team, configured ENTIRELY via the TOWER_ADMIN_ALLOWLIST env var
// — no addresses live in the repo. Anyone on the list who signs in with the
// shared passcode is auto-provisioned as a group admin on first sign-in.
//
// Format: a comma-separated list of emails, each optionally "email:Display Name"
// (the name only seeds a brand-new profile on first sign-in; a plain email falls
// back to the address's local part, and an existing profile's name is preserved).
//   e.g.  "a@x.com, b@x.com:Beta User"
//
// When the var is unset the list is empty: no one is auto-provisioned, and only
// already-provisioned users (added by an admin from Usuarios / Users) can sign in.
export interface AllowlistEntry {
  email: string
  name: string
}

/** email (lowercased) → entry, parsed from TOWER_ADMIN_ALLOWLIST. */
function adminAllowlist(): Map<string, AllowlistEntry> {
  const env = process.env.TOWER_ADMIN_ALLOWLIST?.trim()
  if (!env) return new Map()
  const entries: AllowlistEntry[] = env
    .split(',')
    .map((raw) => {
      // Emails never contain ':', so the first ':' cleanly splits an optional name.
      const idx = raw.indexOf(':')
      const email = (idx === -1 ? raw : raw.slice(0, idx)).trim().toLowerCase()
      const name = (idx === -1 ? '' : raw.slice(idx + 1)).trim() || (email.split('@')[0] ?? email)
      return { email, name }
    })
    .filter((e) => e.email.length > 0)
  return new Map(entries.map((e) => [e.email, e]))
}

/** The allowlist entry for an email, or null if it is not authorized. */
export function isAllowlisted(email: string): AllowlistEntry | null {
  return adminAllowlist().get(email.trim().toLowerCase()) ?? null
}
