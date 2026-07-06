// src/app/api/mister/chat/route.ts
// DEPRECATED — replaced by /api/mister (POST) in Mister v2.
// This route is preserved only for any remaining legacy references.
// New clients must call POST /api/mister instead.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Este endpoint ha sido reemplazado. Usa POST /api/mister para el flujo Mister v2.',
      code: 'DEPRECATED',
      replacement: '/api/mister',
    },
    { status: 410 },
  )
}
