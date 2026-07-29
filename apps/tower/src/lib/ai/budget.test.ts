// Guards the Mister timeout ladder (budget.ts).
//
// The original failure was not a wrong number — it was a MISSING one: no (shell)
// segment declared a function budget, so the product's main workflow inherited
// the platform default and its function was killed mid-call. Nothing failed, no
// type caught it, and the only symptom was a generic client-side error with no
// server-side trace.
//
// The ladder cannot be enforced by types, because `maxDuration` must be a LITERAL
// in the layout — Next static-analyses it and rejects an imported constant
// ("Unsupported node type MemberExpression"). So the rung that matters most is
// the one that cannot import from the single source of truth. These tests are
// what keep them in step: they parse the layout and compare it to the ladder.

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FUNCTION_BUDGET_MS, MISTER_BUDGET } from './budget'

const APP_DIR = fileURLToPath(new URL('../../app', import.meta.url))

/** Every layout.tsx under src/app. */
function findLayouts(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) findLayouts(full, out)
    else if (entry === 'layout.tsx') out.push(full)
  }
  return out
}

/** Layouts that mount the Mister dock — i.e. whose segment hosts `askMister`. */
function dockHostingLayouts(): string[] {
  return findLayouts(APP_DIR).filter((f) => {
    const src = readFileSync(f, 'utf8')
    return /<ShellChrome|<MisterProvider/.test(src)
  })
}

/** The literal `export const maxDuration = N`, or null when absent. */
function declaredMaxDuration(file: string): number | null {
  const m = readFileSync(file, 'utf8').match(/export\s+const\s+maxDuration\s*=\s*(\d+)/)
  return m ? Number(m[1]) : null
}

describe('the Mister timeout ladder', () => {
  it('gives up innermost-first, so a failure always has a cause attached', () => {
    // Each layer must fire BEFORE the one outside it. An inner timeout returns a
    // real message; the outermost (the platform killing the function) returns
    // nothing at all, so it must always be last.
    expect(MISTER_BUDGET.askMs).toBeLessThan(MISTER_BUDGET.perCallMs)
    expect(MISTER_BUDGET.perCallMs).toBeLessThan(MISTER_BUDGET.clientWatchdogMs)
    expect(MISTER_BUDGET.clientWatchdogMs).toBeLessThan(FUNCTION_BUDGET_MS)
  })

  it('leaves the server enough margin to answer before the dock stops listening', () => {
    // If these converge, the operator gets the dock's generic timeout instead of
    // the server's message naming the cause (rate limit vs. slow vs. bad payload).
    expect(MISTER_BUDGET.clientWatchdogMs - MISTER_BUDGET.askMs).toBeGreaterThanOrEqual(5_000)
  })

  it('stays inside the smallest function budget any Vercel plan allows', () => {
    // Hobby caps maxDuration at 60s. A larger value would work in one environment
    // and be silently clamped in another — the worst kind of production bug.
    expect(MISTER_BUDGET.functionSeconds).toBeLessThanOrEqual(60)
  })
})

describe('every segment that hosts the Mister dock declares a function budget', () => {
  const layouts = dockHostingLayouts()

  it('finds the dock mounted somewhere (else this suite is silently vacuous)', () => {
    expect(layouts.length).toBeGreaterThan(0)
  })

  it.each(layouts.map((f) => [f.slice(APP_DIR.length) || f, f]))(
    'app%s declares maxDuration outside the whole ladder',
    (_label, file) => {
      const declared = declaredMaxDuration(file as string)

      // THE ORIGINAL BUG: absent entirely, so the platform default applied.
      expect(
        declared,
        'This layout mounts the Mister dock, so askMister runs in its function. ' +
          'Without an explicit maxDuration it inherits the platform default and is ' +
          'killed mid-call — no message, no log line. Add: export const maxDuration = ' +
          `${MISTER_BUDGET.functionSeconds}  (it must be a LITERAL; Next rejects an imported constant.)`,
      ).not.toBeNull()

      expect(
        (declared as number) * 1_000,
        `maxDuration=${declared}s must exceed the client watchdog ` +
          `(${MISTER_BUDGET.clientWatchdogMs / 1000}s) so OUR timeout fires first.`,
      ).toBeGreaterThan(MISTER_BUDGET.clientWatchdogMs)
    },
  )
})
