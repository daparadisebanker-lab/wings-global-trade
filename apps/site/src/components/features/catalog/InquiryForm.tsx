// src/components/features/catalog/InquiryForm.tsx
// Wings adapter over the shared @wings/trade-ui RFQFlow organ (M3b). All form
// markup/logic live in the organ; this supplies Wings config only (endpoint,
// countries, storage key, toast, success state). Output identical to the
// pre-extraction InquiryForm.
'use client'

import type { Product } from '@/types/database'
import { useToast } from '@/components/ui/toast'
import { DESTINATION_COUNTRIES } from '@/components/ui/select'
import { InquirySuccess } from '@/components/features/catalog/InquirySuccess'
import { RFQFlow } from '@wings/trade-ui'

interface InquiryFormProps {
  product: Product
  selectedVariant?: string
  onSuccess?: () => void
}

export function InquiryForm({ product, selectedVariant, onSuccess }: InquiryFormProps) {
  const { toast } = useToast()
  return (
    <RFQFlow
      productId={product.id}
      productName={product.name_es}
      productSlug={product.slug}
      selectedVariant={selectedVariant}
      countries={DESTINATION_COUNTRIES}
      endpoint="/api/leads/catalog"
      storageKeyPrefix="wings_inquiry_"
      notify={(message, type) => toast(message, type)}
      renderSuccess={() => <InquirySuccess productName={product.name_es} />}
      onSuccess={onSuccess}
    />
  )
}
