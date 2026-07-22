import type { ReactNode } from 'react'
import type { Locale } from '@/lib/i18n'
import type { ContainerFitResult } from '@/lib/copilot/container-fit'
import type { ReverseQuoteData } from '@/lib/copilot/capabilities/reverse-quote'
import { FitArtifact } from './FitArtifact'
import { CostArtifact } from './CostArtifact'
import { ReverseQuoteArtifact } from './ReverseQuoteArtifact'
import { SupplierExtractArtifact } from './SupplierExtractArtifact'
import { ProposalArtifact } from './ProposalArtifact'
import { QuoteProposalArtifact } from './QuoteProposalArtifact'
import { DocumentsArtifact } from './DocumentsArtifact'

/**
 * Maps a CopilotResult.renderer key → the component that draws it. The built-in
 * 'text' renderer is handled inline by the dock (plain bubble). Every other
 * capability registers one line here.
 *
 * INTEGRATION (parallel builds): a capability author ships their renderer
 * component next to this file; the integrator adds the one line that wires it —
 * so parallel work never collides on the capability modules themselves.
 */
export const MISTER_RENDERERS: Record<string, (data: unknown, locale: Locale) => ReactNode> = {
  fit: (data, locale) => <FitArtifact fit={data as ContainerFitResult} locale={locale} />,
  'landed-cost': (data, locale) => <CostArtifact result={data} locale={locale} />,
  'reverse-quote': (data, locale) => <ReverseQuoteArtifact result={data as ReverseQuoteData} locale={locale} />,
  'supplier-extract': (data, locale) => <SupplierExtractArtifact result={data} locale={locale} />,
  proposal: (data, locale) => <ProposalArtifact result={data} locale={locale} />,
  'quote-proposal': (data, locale) => <QuoteProposalArtifact result={data} locale={locale} />,
  documents: (data, locale) => <DocumentsArtifact result={data} locale={locale} />,
}
