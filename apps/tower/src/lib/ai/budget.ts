// The Mister ask TIMEOUT LADDER — one source of truth for four numbers that only
// work if they stay in order.
//
// The main workflow makes up to two model calls inside a server action, and four
// independent timeouts govern it. They used to live in four files with nothing
// relating them, which is how the worst one came to be missing entirely: no
// (shell) segment declared a function budget at all, so the whole workflow
// inherited the platform default — far under what two Opus calls need — and the
// function was killed mid-call. The operator got a generic client-side failure
// with no server-side trace, because the function died before it could log one.
//
// THE INVARIANT, innermost to outermost:
//
//   askMs  <  perCallMs  <  clientWatchdogMs  <  functionSeconds × 1000
//    38s        40s             45s                    60s
//
// Each layer must give up BEFORE the one outside it, because an inner timeout
// produces a real message and an outer one produces silence:
//
//   · askMs fires        → the operator is told what went wrong, with a cause.
//   · perCallMs fires    → one call dies, the ask can still answer.
//   · clientWatchdog     → the dock frees itself; the operator sees a timeout.
//   · the FUNCTION dies  → nothing. No message, no log line, no cause. The worst
//                          outcome, so it must always be the last to happen.
//
// Read in reverse, that is why a bigger function budget is not the fix on its
// own: it only buys room for OUR deadline to fire first.
//
// budget.test.ts asserts the ordering, and asserts that every layout hosting the
// Mister dock declares a function budget large enough to sit outside it — so a
// new route group cannot silently reintroduce the original failure.

export const MISTER_BUDGET = {
  /** Wall-clock the whole ask (classify + capability) may take, server-side. */
  askMs: 38_000,
  /** Ceiling on any single model call; the ask's remaining budget shrinks it. */
  perCallMs: 40_000,
  /** The dock stops waiting and frees the composer after this. */
  clientWatchdogMs: 45_000,
  /**
   * Platform function budget, in SECONDS (Next route segment config units).
   *
   * 60 is deliberate, not arbitrary: it is the largest value valid on every
   * Vercel plan (Hobby caps at 60), so this cannot become an environment-
   * dependent failure. It also sits well outside clientWatchdogMs.
   */
  functionSeconds: 60,
} as const

/** Seconds → ms, for comparing the platform budget against the rest. */
export const FUNCTION_BUDGET_MS = MISTER_BUDGET.functionSeconds * 1_000

/**
 * The hosting plan's hard ceiling on a function, in seconds. This deployment is
 * on Vercel HOBBY, which caps every function at 60s.
 *
 * Declaring more does not buy more: two AI routes asked for 120s and silently
 * received 60, so their code was written against a budget that never existed —
 * `/api/ai/torre` in particular bounds its run by step COUNT (6 model turns) with
 * a comment claiming that fits "within maxDuration". At 60s it does not, and the
 * function is killed mid-stream: the SSE connection dies with no terminal frame,
 * so the client hangs instead of showing an error.
 *
 * Wall-clock is the only honest bound for a multi-step run, which is why
 * TORRE_RUN_BUDGET_MS exists. budget.test.ts asserts no segment ever declares
 * more than this ceiling again.
 *
 * MOVING PLANS: raising this alone is not enough — every internal budget below
 * is sized against it, so they move together or the ladder inverts.
 */
export const PLATFORM_MAX_DURATION_SECONDS = 60

/**
 * Wall-clock budget for a Torre agent run, sized so the ROUTE stops the run
 * itself with time to spare. The function has 60s; stopping at 52s leaves ~8s to
 * emit the `error` and `done` SSE frames and close the stream cleanly.
 *
 * The difference matters to the operator: our deadline ends the run with a
 * terminal frame the UI can render, while a platform kill severs the stream
 * mid-flight and the UI waits forever for a `done` that will never arrive.
 */
export const TORRE_RUN_BUDGET_MS = 52_000
