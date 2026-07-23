// Capability: the Mister Torre QUOTE RUN, conversational edition. From a plain
// sentence ("cotiza una excavadora CAT 320 FOB 78,400 a 18% para Provemaq") it
// PREVIEWS the linked hoja_costos + cotizacion pair + cover comunicacion, rendered
// on the cockpit canvas. This is compute-only (Directive 7): it never persists.
// Persisting the reviewable pair is the runTorreQuote server action (lib/actions/
// torre-quote.ts), which resolves the lane's real costing_config; this preview uses
// the app's STANDARD Peru-SUNAT defaults, and says so ("tasas estándar").
//
// Every number comes from computeImportCost via buildQuoteRun (Directive 3); the
// model only parses the sentence (extractQuoteSpec).
import type { IntelligenceClient } from '@/lib/ai/client'
import { COST_DEFAULTS } from './landed-cost'
import { extractQuoteSpec } from '@/lib/torre/parse-spec'
import { assembleQuoteRunInput, buildQuoteRun, type QuoteRunContext } from '@/lib/torre/quote-run'
import type { SourceRef } from '@/lib/torre/artifacts'
import { textResult, type Capability, type CopilotResult } from '../types'

/** What the 'torre-quote' renderer receives: the artifact pair + the parsed spec. */
export interface TorreQuoteRenderData {
  result: ReturnType<typeof buildQuoteRun>
  standardRates: boolean
}

export const quoteRunCapability: Capability = {
  id: 'quote-run',
  router: {
    description:
      'Armar una COTIZACIÓN mayorista completa (hoja de costos interna + cotización al cliente) desde una frase: equipo, valor FOB/CIF, incoterm y margen. Corre el motor SUNAT.',
    examples: [
      'Cotiza una excavadora CAT 320 FOB 78,400 diésel a 18% de margen para Provemaq',
      'Ármame la cotización de un montacargas 14,000 FOB, flete 1,600, 18%',
      'Quote a diesel generator CIF 8,500 at 15% margin for Andes Machinery, in English',
    ],
  },
  async run(client: IntelligenceClient, text: string): Promise<CopilotResult> {
    const spec = await extractQuoteSpec(client, text)
    if (!spec.understood) {
      return textResult(
        spec.note ||
          'Dime el equipo y su valor FOB (o CIF), el incoterm y el margen, y te armo la cotización. / Give me the equipment and its FOB (or CIF) value, incoterm and margin, and I’ll build the quote.',
      )
    }

    // Standard-defaults context (no lane): mirrors what CostCalculator / the other
    // copilot cost capabilities use. The persisted run uses the lane's config.
    const today = new Date().toISOString().slice(0, 10)
    const ctx: QuoteRunContext = {
      laneCode: null,
      igvRate: COST_DEFAULTS.igvRate,
      percepcionRate: COST_DEFAULTS.percepcionRate,
      insuranceRate: COST_DEFAULTS.insuranceRate,
      adValoremRate: COST_DEFAULTS.adValoremRate,
      exchangeRate: COST_DEFAULTS.exchangeRate,
      marginDefault: 0.18,
      freightSource: spec.freightInternational != null ? { kind: 'operator', label: 'Flete indicado' } : null,
      tariffSource: { kind: 'tariff_position', label: 'Ad Valorem 0% (estándar)' } satisfies SourceRef,
      trmSource: { kind: 'org_rule', label: `TC ${COST_DEFAULTS.exchangeRate.toFixed(2)} (estándar)` },
      marginSource: { kind: 'org_rule', label: 'Margen por defecto 18%' },
      validityDays: 15,
      today,
      defaultClientName: spec.clientName,
      defaultLanguage: spec.language ?? 'es',
    }

    const result = buildQuoteRun(assembleQuoteRunInput(spec, ctx))
    const note = spec.note || 'Vista previa con tasas estándar — guarda para revisión con las tasas de la lane.'
    const data: TorreQuoteRenderData = { result, standardRates: true }
    return { renderer: 'torre-quote', note, data }
  },
}
