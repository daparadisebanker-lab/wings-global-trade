import type { ReactNode } from 'react'
import type { Locale } from '@/lib/i18n'
import { QuoteProposalEditor } from '../QuoteProposalEditor'
import { ContainerFitEditor } from '../ContainerFitEditor'
import { LandedCostEditor } from '../LandedCostEditor'
import { ReverseQuoteEditor } from '../ReverseQuoteEditor'

/**
 * Optional per-capability EDITABLE surfaces for the composition canvas (Phase E
 * slice 3+). When a renderer key has an entry here, the canvas serves the editable
 * form (edit → commit / recompute) instead of the read-only thread renderer. The
 * thread stays read-only everywhere; only the canvas is a workspace. `seq` is the
 * artifact's per-session id — editors use it to persist their in-progress state to
 * the provider's canvas working memory (survives remount). Extend with one line
 * per capability that becomes editable — mirrors MISTER_RENDERERS.
 */
export const MISTER_CANVAS_EDITORS: Record<string, (data: unknown, locale: Locale, seq: number) => ReactNode> = {
  'quote-proposal': (data, locale, seq) => <QuoteProposalEditor result={data} locale={locale} seq={seq} />,
  fit: (data, locale, seq) => <ContainerFitEditor result={data} locale={locale} seq={seq} />,
  'landed-cost': (data, locale, seq) => <LandedCostEditor result={data} locale={locale} seq={seq} />,
  'reverse-quote': (data, locale, seq) => <ReverseQuoteEditor result={data} locale={locale} seq={seq} />,
}
