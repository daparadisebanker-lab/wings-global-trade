// scripts/swap-test.mjs
// Swap-test harness for @wings/trade-ui organs (ecosystem §4 QA-6).
//
// The full QA-6 renders each organ under the Wings livery and a synthetic test
// livery; an organ passes only if it renders correctly from tokens alone. This
// script implements the two statically-enforceable halves of that gate and
// itemizes the visual-rerender part as debt:
//
//   1. HARD GATE — packages never import from apps/* (nor via @/ alias). Fails CI.
//   2. TOKEN AUDIT — reports raw hex literals in organ source. During the
//      zero-change migration these are inherited verbatim from the app and are
//      NOT auto-failed; they are the token-purity debt to burn down before a lane
//      other than Wings consumes the organ.
//
// Run: node scripts/swap-test.mjs
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const ROOT = 'packages/ui/src'

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(ts|tsx)$/.test(p)) out.push(p)
  }
  return out
}

const files = walk(ROOT)
const appImport = /from\s+['"](@\/|.*\/apps\/)/
const rawHex = /#[0-9A-Fa-f]{3,8}\b/g

let hardFailures = 0
const debt = []

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  src.split('\n').forEach((line, i) => {
    if (appImport.test(line)) {
      console.error(`✗ APP IMPORT  ${f}:${i + 1}  ${line.trim()}`)
      hardFailures++
    }
    const hexes = line.match(rawHex)
    if (hexes) debt.push(`  ${f}:${i + 1}  ${hexes.join(', ')}`)
  })
}

console.log(`\nswap-test — scanned ${files.length} organ source files\n`)

if (debt.length) {
  console.log(`token-purity debt (raw hex inherited from the app, ${debt.length} lines):`)
  console.log(debt.join('\n'))
  console.log('')
}

if (hardFailures) {
  console.error(`FAIL — ${hardFailures} forbidden app import(s). Organs must consume tokens + props only.`)
  process.exit(1)
}

console.log('PASS — no app imports. (Token-purity debt above is tracked, not blocking, during the zero-change migration.)')
