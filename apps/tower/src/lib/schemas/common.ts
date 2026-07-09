// src/lib/schemas/common.ts
// Shared Zod primitives reused across TOWER server actions and forms. Domain
// schemas (product, RFQ, container, …) land with their feature waves; the spec
// JSON-Schema resolution lives in lib/archetypes.
import { z } from 'zod'

export const uuidSchema = z.string().uuid()

/** Money is integer minor units + a currency code (ADR-7). Floats are a bug. */
export const moneyMinorSchema = z.number().int()
export const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/, 'ISO-4217 code')
export const money = z.object({
  amountMinor: moneyMinorSchema,
  currency: currencyCodeSchema,
})
export type Money = z.infer<typeof money>

/** Percentages are basis points (100 bps = 1%). */
export const basisPointsSchema = z.number().int().min(0)

/** Cursor pagination — every list action is cursor-paginated (API_MAP). */
export const paginationSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(200).default(50),
})
export type Pagination = z.infer<typeof paginationSchema>
