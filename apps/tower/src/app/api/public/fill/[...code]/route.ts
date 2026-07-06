// src/app/api/public/fill/[...code]/route.ts
// API_MAP `GET /api/public/fill/{containerCode}` — the public sites' single
// read path for a container's fill state (feeds the "Trae tu grupo" FillMeter;
// CLAUDE.md Directive 5 "the public site is a read model"). Never returns a
// container with `public_fill_visible = false` — see ../_lib/data.ts and its
// regression test.
//
// A CATCH-ALL segment, not `[code]`: container codes contain a literal `/`
// (e.g. `WGT/02-C014` — the lane code `WGT/02` is a prefix), so
// `/api/public/fill/WGT/02-C014` arrives as two path segments. A single
// `[code]` segment would only match if the caller pre-encoded the slash as
// `%2F`; `[...code]` accepts the code either way (encoded-single-segment or
// literal multi-segment) and this route rejoins the parts with `/`.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiError } from '@/lib/api-errors'
import { getContainerFillState } from '../_lib/data'

// API_MAP: "Cache: 60s. This is the single source of truth for 'Trae tu
// grupo' meters." Matches the public catalog route's revalidate window.
export const revalidate = 60

const paramsSchema = z.object({
  code: z.array(z.string().min(1)).min(1).max(4),
})

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string[] }> }) {
  try {
    const parsedParams = paramsSchema.safeParse(await params)
    if (!parsedParams.success) {
      return apiError('VALIDATION', 'Código de contenedor inválido.', parsedParams.error.flatten().fieldErrors)
    }

    // Each segment arrives URI-decoded already by Next.js; rejoin with `/` to
    // reconstruct the full container code (e.g. ['WGT', '02-C014'] -> 'WGT/02-C014').
    const code = parsedParams.data.code.join('/')

    const result = await getContainerFillState(code)
    if (!result.ok) {
      if (result.error === 'NOT_FOUND') {
        return apiError('NOT_FOUND', 'Contenedor no encontrado.')
      }
      return apiError('INTERNAL', 'No se pudo cargar el estado de llenado.')
    }

    const response = NextResponse.json({
      data: {
        code: result.data.code,
        capacity_cbm: result.data.capacityCbm,
        committed_cbm: result.data.committedCbm,
        fill_percent: result.data.fillPercent,
        status: result.data.status,
        mode: result.data.mode,
      },
    })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return response
  } catch (error) {
    console.error('[api/public/fill/[...code]]', error)
    return apiError('INTERNAL')
  }
}
