// src/app/api/mister/estimate/route.ts
// RETIRED — CIF estimate endpoint removed per ENRICHED_SPEC Decision A.
// Mister v2 never renders absolute prices or CIF figures.
// See: spec/ENRICHED_SPEC.md §1.2 and §1.3

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'El estimador CIF ha sido retirado. Mister v2 utiliza rangos indexados, no cifras absolutas. Para una cotización real, usa POST /api/mister/quote.',
      code: 'RETIRED',
      replacement: '/api/mister/quote',
    },
    { status: 410 },
  )
}
