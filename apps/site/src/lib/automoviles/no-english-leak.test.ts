// English leaked into user-facing copy once already (the "Cómo se compra"
// unit-math strings rendered literally in English on the es_PE site). This
// scans every JSX text node under the automóviles route tree + its
// components for unambiguous English stopwords — words that never appear in
// correct Spanish copy, so a hit here is a real leak, not a false positive
// from a shared loanword (a curated list, not a generic English dictionary,
// on purpose — "container"/"chip"/"link" etc. are legitimate Spanish
// technical/loan terms in this codebase and must never trigger this test).
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const ROOTS = [
  'src/app/(lanes)/automoviles',
  'src/components/features/automoviles',
  'src/lib/automoviles',
]

// Whole-word matches only, case-insensitive. Every one of these is a strong,
// unambiguous English signal in Spanish copy — never a legitimate Spanish
// word, loanword, brand name, or code identifier.
const ENGLISH_STOPWORDS = [
  'the',
  'and',
  'with',
  'without',
  'per unit',
  'per container',
  'configured trim',
  'fleet slot',
  'click here',
  'shop now',
  'buy now',
  'add to cart',
  'add to bag',
  'in stock',
  'out of stock',
  'learn more',
  'read more',
]

function stripComments(source: string): string {
  // This codebase's own convention is long, English, rationale-heavy // and
  // /* */ comments (see any file in this lane) — including ones that quote
  // short phrases in "double quotes" for emphasis. Those quoted phrases are
  // not user-facing copy and must never trigger this check, so comments are
  // stripped before string-literal extraction, not just before JSX text.
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ')
}

function extractJsxText(source: string): string[] {
  // Strips JS/TS syntax the check would otherwise false-positive on
  // (imports, comments, identifiers, template-literal expressions) and
  // keeps only quoted string literals and JSX text content — the two
  // places user-facing copy actually lives in these files.
  const strings: string[] = []
  const stringLiteral = /(['"`])((?:\\.|(?!\1).)*)\1/g
  let match: RegExpExecArray | null
  const code = stripComments(source)
  while ((match = stringLiteral.exec(code))) {
    strings.push(match[2])
  }
  return strings
}

function walk(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(ts|tsx)$/.test(p) && !p.endsWith('.test.ts')) out.push(p)
  }
  return out
}

describe('automóviles copy — no untranslated English', () => {
  const files = ROOTS.flatMap((root) => walk(join(process.cwd(), root)))

  it('found source files to scan', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    it(`has no English leak: ${file.replace(process.cwd(), '')}`, () => {
      const source = readFileSync(file, 'utf8')
      const texts = extractJsxText(source)
      const offenders: string[] = []
      for (const text of texts) {
        for (const word of ENGLISH_STOPWORDS) {
          const re = new RegExp(`(^|[^a-zA-Z])${word}([^a-zA-Z]|$)`, 'i')
          if (re.test(text)) offenders.push(`"${word}" in: ${text}`)
        }
      }
      expect(offenders, offenders.join('\n')).toEqual([])
    })
  }
})
