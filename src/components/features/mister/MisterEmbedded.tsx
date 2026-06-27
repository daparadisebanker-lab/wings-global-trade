// src/components/features/mister/MisterEmbedded.tsx
// Self-contained embedded Mister for /mister/page.tsx.
// Wraps MisterProvider + MisterWindow in embedded mode.
// No launcher in embedded mode — the window is always visible.
// Source: builder-mister-v2-20260627.md FINISH block
'use client'

import { MisterProvider } from '@/components/features/mister/MisterProvider'
import { MisterWindow } from '@/components/features/mister/MisterWindow'

interface Props {
  currentPage?: string
  currentProductId?: string | null
}

export function MisterEmbedded({ currentPage = '/mister', currentProductId = null }: Props) {
  return (
    <MisterProvider
      locale="es-PE"
      currentPage={currentPage}
      currentProductId={currentProductId}
    >
      <MisterWindow mode="embedded" />
    </MisterProvider>
  )
}
