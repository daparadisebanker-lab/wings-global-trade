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
  categorySlug?: string
  selectedVariant?: string
  onSuccess?: () => void
}

// Categories where personal-use and business/fleet buyers are both legitimate —
// the RFQ form asks which, up front, instead of presuming a bulk order.
const DUAL_BUYER_CATEGORIES = new Set(['automoviles'])

export function InquiryForm({ product, categorySlug, selectedVariant, onSuccess }: InquiryFormProps) {
  const { toast } = useToast()
  const isDualBuyer = Boolean(categorySlug && DUAL_BUYER_CATEGORIES.has(categorySlug))
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
      showBuyerType={isDualBuyer}
      quantityPlaceholder={isDualBuyer ? 'Ej: 1' : undefined}
    />
  )
}
