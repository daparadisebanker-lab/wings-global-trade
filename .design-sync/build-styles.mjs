// design-sync style build — compiles the REAL stylesheet for @wings/trade-ui.
//
// The package ships no CSS by design: components carry Tailwind utility
// classes compiled by apps/site, and tokens live in tokens/skeleton.css +
// packages/liveries/{wings,mister}/livery.css, all imported by the site's
// globals.css. This script runs the site's own Tailwind (its config already
// scans packages/ui/src) over globals.css, so the design-sync bundle ships
// exactly what production ships. Output: packages/ui/.ds-styles.css
// (gitignored — regenerate via this script; recorded as cfg.buildCmd).
//
// @font-face rules are STRIPPED from the compiled output — fonts are owned
// exclusively by .design-sync/fonts.css (cfg.extraFonts), which references
// the real files with relative paths so the converter copies them into
// fonts/. Three files live in a fonts/flexo/ subdir whose basenames would
// case-collide with root files when flattened (flexo-medium.ttf vs
// Flexo-Medium.ttf on a case-sensitive host) — they get renamed copies in
// .design-sync/.cache/fonts-src/.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = join(dirname(fileURLToPath(import.meta.url)), '..')
const site = join(repo, 'apps', 'site')
const out = join(repo, 'packages', 'ui', '.ds-styles.css')

execFileSync(
  'node',
  [
    join(site, 'node_modules', 'tailwindcss', 'lib', 'cli.js'),
    '-c', join(site, 'tailwind.config.ts'),
    '-i', join(site, 'src', 'app', 'globals.css'),
    '-o', out,
  ],
  { stdio: 'inherit', cwd: site },
)

const css = readFileSync(out, 'utf8').replace(/@font-face\s*\{[^}]*\}/g, '')
writeFileSync(out, css)

// Renamed copies for the fonts/flexo/ subdir (collision-safe basenames).
const fontsSrc = join(repo, '.design-sync', '.cache', 'fonts-src')
mkdirSync(fontsSrc, { recursive: true })
for (const [from, to] of [
  ['flexo/Flexo-Regular.ttf', 'Flexo-Regular-400.ttf'],
  ['flexo/Flexo-Medium.ttf', 'Flexo-Medium-500.ttf'],
  ['flexo/Flexo-Bold.ttf', 'Flexo-Bold-700.ttf'],
]) {
  copyFileSync(join(site, 'public', 'fonts', from), join(fontsSrc, to))
}
console.log(`[build-styles] wrote ${out} (${(css.length / 1024).toFixed(0)} KB, @font-face stripped) + 3 renamed flexo copies`)
