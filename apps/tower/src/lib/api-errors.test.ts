import { describe, expect, it } from 'vitest'
import { apiError } from './api-errors'

describe('apiError', () => {
  it('maps each code to its HTTP status and default Spanish copy', async () => {
    const res = apiError('VALIDATION')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({ error: { code: 'VALIDATION', message: 'Datos inválidos.' } })
  })

  it('never leaks a raw message unless explicitly passed', async () => {
    const res = apiError('INTERNAL')
    const body = await res.json()
    expect(body.error.message).toBe('Error interno del servidor.')
  })

  it('accepts a custom message and field-level details', async () => {
    const res = apiError('VALIDATION', 'Falló la validación.', { laneSlug: ['Requerido'] })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      error: {
        code: 'VALIDATION',
        message: 'Falló la validación.',
        details: { laneSlug: ['Requerido'] },
      },
    })
  })

  it.each([
    ['UNAUTHORIZED', 401],
    ['FORBIDDEN_LANE', 403],
    ['CAPACITY_EXCEEDED', 409],
    ['STAGE_INVALID', 409],
    ['SCHEMA_MISMATCH', 422],
    ['RATE_LIMITED', 429],
    ['NOT_FOUND', 404],
    ['INTERNAL', 500],
  ] as const)('%s -> %i', (code, status) => {
    expect(apiError(code).status).toBe(status)
  })
})
