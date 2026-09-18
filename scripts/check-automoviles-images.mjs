// scripts/check-automoviles-images.mjs
//
// Guardrail against the exact regression this lane already shipped once:
// an <img>/<Image> receiving an empty or dangling src. Two checks, both hard
// failures — never a soft warning that gets ignored:
//
//   1. No product's `images` array may contain an empty/falsy string. An
//      unphotographed nameplate ships `images: []` (zero entries) — that is
//      the honest, deliberate INTERIM_TYPOGRAPHIC state (root CLAUDE.md §4
//      Phase 0·Q5) every VehicleCard fallback already renders around. A
//      non-empty array with a blank entry is not that — it is exactly the
//      "empty src" defect this script exists to catch before it ships again.
//   2. Every local (`/images/...`) path an `images` array DOES list must
//      resolve to a real file under apps/site/public. A remote (Supabase
//      storage) URL is not checked here — that's a runtime concern, not a
//      build-time one.
//
// Coverage (how many of the N nameplates have real photography) is reported
// but never fails the build — that number is expected to be less than 100%
// for as long as this lane stays typography-and-spec-led for the rest.
//
// Run: node scripts/check-automoviles-images.mjs
import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SEED_PATH = join(ROOT, 'apps/site/src/data/seed.json')
const PUBLIC_DIR = join(ROOT, 'apps/site/public')

const seed = JSON.parse(readFileSync(SEED_PATH, 'utf8'))
const category = seed.categories.find((c) => c.slug === 'automoviles')

if (!category) {
  console.error(`FAIL — no "automoviles" category found in ${SEED_PATH}`)
  process.exit(1)
}

const products = seed.products.filter((p) => p.category_id === category.id)

let failures = 0
let withPhotography = 0

for (const p of products) {
  const images = Array.isArray(p.images) ? p.images : []

  const blanks = images.filter((src) => typeof src !== 'string' || src.trim() === '')
  if (blanks.length > 0) {
    console.error(`✗ EMPTY SRC   ${p.slug}  (${blanks.length} blank entr${blanks.length === 1 ? 'y' : 'ies'} in images[])`)
    failures++
  }

  const localPaths = images.filter((src) => typeof src === 'string' && src.startsWith('/'))
  for (const src of localPaths) {
    const onDisk = join(PUBLIC_DIR, src)
    if (!existsSync(onDisk)) {
      console.error(`✗ MISSING FILE  ${p.slug}  ${src}  (not found at ${onDisk})`)
      failures++
    }
  }

  if (images.length > 0 && blanks.length === 0) withPhotography++
}

console.log(
  `\ncheck-automoviles-images — ${products.length} nameplates, ${withPhotography} with real photography, ${products.length - withPhotography} typography-led (interim, expected).\n`,
)

if (failures) {
  console.error(`FAIL — ${failures} image reference problem(s) above. Fix before shipping — never ship an empty or dangling src.`)
  process.exit(1)
}

console.log('PASS — every referenced image resolves; no empty src anywhere.')
