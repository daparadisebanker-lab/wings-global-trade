// packages/liveries/mister/scripts/build-livery.ts
//
// Emits livery.css from ramp.ts (the only sanctioned color source) plus the
// fixed Mister brand tokens and clearspace unit b. Run via `pnpm build` in
// this package. GENERATED OUTPUT — never hand-edit livery.css.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rampColor } from '../ramp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(__dirname, '..')
const geometryPath = resolve(packageRoot, 'logo/geometry.json')
const outPath = resolve(packageRoot, 'livery.css')

// Unit b = the diameter of one core blob of the metaball M, measured once
// from the geometry master (spec/MISTER_LOGO_APPLICATION_STANDARD.md,
// "CLEARSPACE"). Recorded here, never invented — if the geometry master
// hasn't shipped its measurement yet, the build fails loudly instead of
// guessing a value.
const B_FIELD_CANDIDATES = ['b', 'unitB', 'coreBlobDiameter', 'coreDiameter'] as const

function readUnitB(): { value: number; field: string; method: string } {
  let raw: string
  try {
    raw = readFileSync(geometryPath, 'utf-8')
  } catch {
    console.error(
      `[build-livery] Missing ${geometryPath}\n` +
        '  Unit b (clearspace = diameter of one core blob of the metaball M) is ' +
        'derived from the geometry master and has not been recorded yet.\n' +
        '  Expected this file to be written by the logo-cutting task ' +
        '("Cut logo variants with recomputed viewBoxes + derive unit b").\n' +
        `  Expected shape: { "${B_FIELD_CANDIDATES[0]}": <number>, "method": <string> } ` +
        `(also accepts field names: ${B_FIELD_CANDIDATES.slice(1).join(', ')}).\n` +
        '  Refusing to invent a value — livery.css was NOT generated.',
    )
    process.exit(1)
  }

  let geometry: Record<string, unknown>
  try {
    geometry = JSON.parse(raw)
  } catch (err) {
    console.error(`[build-livery] ${geometryPath} is not valid JSON: ${(err as Error).message}`)
    process.exit(1)
  }

  for (const field of B_FIELD_CANDIDATES) {
    const value = geometry[field]
    if (typeof value === 'number' && Number.isFinite(value)) {
      const method =
        typeof geometry.method === 'string'
          ? geometry.method
          : 'measured from geometry master (method not recorded in geometry.json)'
      return { value, field, method }
    }
  }

  console.error(
    `[build-livery] ${geometryPath} exists but has none of the expected numeric ` +
      `fields (${B_FIELD_CANDIDATES.join(', ')}). Refusing to invent a value — ` +
      'livery.css was NOT generated.',
  )
  process.exit(1)
}

const { value: bValue, field: bField, method: bMethod } = readUnitB()

const RAMP_STEPS = Array.from({ length: 11 }, (_, i) => i * 10) // 0..100 step 10

const rampLines = RAMP_STEPS.map((pct) => {
  const t = pct / 100
  const hex = rampColor(t, { encodes: 'build-time scale emission' })
  return `  --mister-ramp-${pct}: ${hex};`
}).join('\n')

const generatedAt = new Date().toISOString()

const css = `/* ============================================================
   GENERATED FROM ramp.ts — DO NOT EDIT.
   Generated: ${generatedAt}
   Regenerate with: pnpm --filter @wings/livery-mister build
   ============================================================ */

/* Unit b (clearspace) = ${bValue} master-canvas units.
   Field: "${bField}" in logo/geometry.json.
   Derivation: ${bMethod}.
   spec/MISTER_LOGO_APPLICATION_STANDARD.md — CLEARSPACE:
   "Unit b = the diameter of one core blob of the metaball M". */

/* Scoped under both :root and [data-lane="mister"]: unlike the Wings house
   livery (packages/liveries/wings/livery.css, which lives at :root only
   because the current site is not yet lane-split), the Mister ramp is
   explicitly REFUSED on Wings core document surfaces
   (spec/WINGS_IMAGE_GENERATION_THESIS.md — INSTRUMENT COLOR, "refused_surfaces":
   ["wings_core", ...]). The [data-lane="mister"] scope is the containment
   mechanism that keeps these tokens off surfaces that never opted in. */
:root,
[data-lane='mister'] {
  /* --- Thermal ramp (Axis 2 — TEMPERATURE = DEMAND) --- */
${rampLines}

  /* --- Fixed Mister brand tokens (spec/MISTER_LOGO_APPLICATION_STANDARD.md — COLOR LAW) --- */
  --mister-azul: #1D83F2;
  --mister-cielo: #65AFFF;
  --mister-navy: #001E50;
  --mister-warm-white: #F8F6F0;

  /* --- Clearspace --- */
  --mister-b: ${bValue};
}
`

writeFileSync(outPath, css, 'utf-8')
console.log(`[build-livery] Wrote ${outPath}`)
