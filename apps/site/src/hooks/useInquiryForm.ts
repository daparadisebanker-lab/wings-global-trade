// src/hooks/useInquiryForm.ts
// The RFQ form controller now lives in @wings/trade-ui as useRFQForm (M3b). This
// wrapper preserves the app-local name + the catalog endpoint for any direct
// callers. InquiryForm renders RFQFlow directly and no longer uses this.
'use client'

import { useRFQForm } from '@wings/trade-ui'
import type { RFQSubmitResult } from '@wings/trade-ui'

export type InquirySubmitResult = RFQSubmitResult

interface UseInquiryFormArgs {
  productId?: string
  productName: string
  selectedModel?: string
}

export function useInquiryForm(args: UseInquiryFormArgs) {
  return useRFQForm({ ...args, endpoint: '/api/leads/catalog' })
}
