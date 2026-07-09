// src/lib/actions/result.ts
// The shared result contract for every TOWER server action.
//
// THE MUTATION LAW (CLAUDE.md Directives 1 & API_MAP): server actions are the
// ONLY mutation path, and each one is shaped:
//
//     auth  →  Zod parse  →  RLS-scoped query
//
// Actions never gate access with `if (role === …)`. RLS is the permission system;
// when Postgres refuses a row the query returns nothing (or errors), and the
// action surfaces FORBIDDEN_LANE. The UI hides what RLS forbids — it never
// enforces. Feature waves (Catalog Studio, Pipeline, Container Desk, …) add the
// concrete actions from API_MAP.md; this module defines the shape they return.

/** Typed error codes — mirror API_MAP.md "Contracts & errors". */
export type ActionErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN_LANE'
  | 'VALIDATION'
  | 'CAPACITY_EXCEEDED'
  | 'STAGE_INVALID'
  | 'SCHEMA_MISMATCH'
  | 'RATE_LIMITED'

export interface ActionError {
  code: ActionErrorCode
  message: string
  /** Field-level detail for VALIDATION (never a raw DB error). */
  details?: Record<string, string[]>
}

export type ActionResult<T> = { data: T; error?: never } | { data?: never; error: ActionError }

export function ok<T>(data: T): ActionResult<T> {
  return { data }
}

export function fail(
  code: ActionErrorCode,
  message: string,
  details?: Record<string, string[]>,
): ActionResult<never> {
  return { error: { code, message, ...(details ? { details } : {}) } }
}
