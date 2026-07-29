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
