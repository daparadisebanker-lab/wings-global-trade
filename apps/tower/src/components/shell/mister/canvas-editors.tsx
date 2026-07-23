import type { ReactNode } from 'react'
import type { Locale } from '@/lib/i18n'
import { QuoteProposalEditor } from '../QuoteProposalEditor'
import { ContainerFitEditor } from '../ContainerFitEditor'
import { LandedCostEditor } from '../LandedCostEditor'

/**
 * Optional per-capability EDITABLE surfaces for the composition canvas (Phase E
 * slice 3+). When a renderer key has an entry here, the canvas serves the editable
 * form (edit → commit / recompute) instead of the read-only thread renderer. The
 * thread stays read-only everywhere; only the canvas is a workspace. Extend with
 * one line per capability that becomes editable — mirrors MISTER_RENDERERS.
 */
export const MISTER_CANVAS_EDITORS: Record<string, (data: unknown, locale: Locale) => ReactNode> = {
  'quote-proposal': (data, locale) => <QuoteProposalEditor result={data} locale={locale} />,
  fit: (data, locale) => <ContainerFitEditor result={data} locale={locale} />,
  'landed-cost': (data, locale) => <LandedCostEditor result={data} locale={locale} />,
}
