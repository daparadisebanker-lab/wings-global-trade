// src/lib/api-errors.ts
// Typed API error contract for TOWER's route handlers (API_MAP "Contracts &
// errors"). Every route-handler response is `{ data }` on success or
// `{ error: { code, message, details? } }` on failure — raw DB/server errors
// never leave this boundary (root CLAUDE.md "Never expose raw error messages").
//
// PUBLIC CONTRACT: a sibling agent imports `apiError` + `ApiErrorCode` from this
// module for its own route handlers. Do not rename these exports or change
// `apiError`'s parameter order without checking for other callers.
import { NextResponse } from 'next/server'

/**
 * API_MAP's cross-cutting error taxonomy, plus two route-handler-only codes:
 * NOT_FOUND (a slug/brand/lane that doesn't resolve) and INTERNAL (the generic
 * "something failed server-side, nothing leaked" fallback). Server actions use
 * the API_MAP-only subset via `ActionErrorCode` in `lib/actions/result.ts`.
 */
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN_LANE'
  | 'VALIDATION'
  | 'CAPACITY_EXCEEDED'
  | 'STAGE_INVALID'
  | 'SCHEMA_MISMATCH'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'INTERNAL'

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN_LANE: 403,
  VALIDATION: 400,
  CAPACITY_EXCEEDED: 409,
  STAGE_INVALID: 409,
  SCHEMA_MISMATCH: 422,
  RATE_LIMITED: 429,
  NOT_FOUND: 404,
  INTERNAL: 500,
}

const DEFAULT_MESSAGE_BY_CODE: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: 'No autorizado.',
  FORBIDDEN_LANE: 'Sin acceso a este lane.',
  VALIDATION: 'Datos inválidos.',
  CAPACITY_EXCEEDED: 'Capacidad excedida.',
  STAGE_INVALID: 'Etapa inválida.',
  SCHEMA_MISMATCH: 'El esquema de especificación no coincide.',
  RATE_LIMITED: 'Demasiadas solicitudes.',
  NOT_FOUND: 'No encontrado.',
  INTERNAL: 'Error interno del servidor.',
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    /** Field-level detail for VALIDATION — e.g. zod's `flatten().fieldErrors`. */
    details?: Record<string, string[] | undefined>
  }
}

/**
 * Build a typed JSON error `Response`. Never pass a raw exception/DB message as
 * `message` — log it server-side (`console.error`) and either omit `message`
 * (uses the safe default copy above) or pass a short, user-facing string.
 */
export function apiError(
  code: ApiErrorCode,
  message?: string,
  details?: Record<string, string[] | undefined>,
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = {
    error: {
      code,
      message: message ?? DEFAULT_MESSAGE_BY_CODE[code],
      ...(details ? { details } : {}),
    },
  }
  return NextResponse.json(body, { status: STATUS_BY_CODE[code] })
}
