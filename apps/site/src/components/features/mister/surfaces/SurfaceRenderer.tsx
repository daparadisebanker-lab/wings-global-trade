// src/components/features/mister/surfaces/SurfaceRenderer.tsx
// Dispatches a MisterSurface to the correct surface component.
// Discriminates on surface.type; narrows payload via type assertion.
// The server guarantees payload type matches surface type.
'use client'

import type {
  MisterSurface,
  ProductSurface,
  ComparisonSurface,
  MoqSurface,
  DocumentSurface,
  ContactSurface,
  WaterfallSurface,
  IndexComparisonView,
  QuotationFormSurface,
  ContainerOfferSurface,
} from '@/types/mister'
import { ProductCard } from './ProductCard'
import { ComparisonView } from './ComparisonView'
import { SpecSheet } from './SpecSheet'
import { MoqTable } from './MoqTable'
import { LandedCostWaterfall } from './LandedCostWaterfall'
import { IndexComparison } from './IndexComparison'
import { DocumentLink } from './DocumentLink'
import { ContactCard } from './ContactCard'
import { QuotationFormCTA } from './QuotationFormCTA'
import { ContainerOfferCard } from './ContainerOfferCard'

interface Props {
  surface: MisterSurface
}

export function SurfaceRenderer({ surface }: Props) {
  switch (surface.type) {
    case 'product':
      return <ProductCard payload={surface.payload as ProductSurface} />
    case 'comparison':
      // Discriminate: if it has `scenarios`, it's an IndexComparisonView
      if (
        surface.payload !== null &&
        typeof surface.payload === 'object' &&
        'scenarios' in (surface.payload as object)
      ) {
        return <IndexComparison payload={surface.payload as IndexComparisonView} />
      }
      return <ComparisonView payload={surface.payload as ComparisonSurface} />
    case 'specs':
      return <SpecSheet payload={surface.payload as Record<string, string>} />
    case 'moq':
      return <MoqTable payload={surface.payload as MoqSurface} />
    case 'waterfall':
      return <LandedCostWaterfall payload={surface.payload as WaterfallSurface} />
    case 'document':
      return <DocumentLink payload={surface.payload as DocumentSurface} />
    case 'contact':
      return <ContactCard payload={surface.payload as ContactSurface} />
    case 'quotation_form': {
      const qfPayload = surface.payload as QuotationFormSurface
      return <QuotationFormCTA summaryFields={qfPayload?.summaryFields} />
    }
    case 'container_offer':
      return <ContainerOfferCard payload={surface.payload as ContainerOfferSurface} />
    default:
      return null
  }
}
