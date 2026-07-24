// src/lib/torre/agent/provider.ts
// Mister Torre — the REAL tool provider (C1). Implements TorreToolProvider against the
// RLS-scoped `tower` schema, so every read/write the agentic loop makes runs in the
// requesting operator's context (permissions are server-side truth, spec-torre/06).
//
// Governance:
//  · reads return only what RLS permits — the model can't see across roles;
//  · proposeQuote delegates to the SHARED quote-core (runQuoteFromSpec) — the same
//    parity-tested money pipeline as the flagship action, so no arithmetic and no
//    minor-unit conversion ever touch the model;
//  · draftMessage persists a COMUNICACION as ai_drafts DRAFT — nothing is sent.
//
// Two reads are honest interim (MOCK_CONNECTORS, sanctioned by the spec): searchKnowledge
// returns nothing until the RAG corpus exists (L6); the rest are real today.
import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { buildTorreInsert, mapTorreDraftRow, TORRE_DRAFT_SELECT_COLS, type RawTorreDraftRow } from '@/lib/torre/drafts'
import { comunicacionPayloadSchema } from '@/lib/torre/artifacts'
import { defaultLanguage } from '@/lib/torre/comms/tone'
import type { QuoteSpec } from '@/lib/torre/parse-spec'
import { runQuoteFromSpec, type QuoteCoreResult, type QuoteLaneRow, type TowerDb } from '@/lib/torre/quote-core'
import type { RateRow } from '@/lib/torre/rates'
import type { TariffPosition } from '@/lib/torre/tariff'
import type {
  CostingConfigSummary,
  ImportSummary,
  KnowledgeHit,
  MessageToolInput,
  PartySummary,
  QuoteToolInput,
  QuoteToolResult,
  TorreToolProvider,
} from './tools'

/** The operator/run context the provider is bound to (RLS already applied via `db`). */
export interface TorreProviderContext {
  laneRow: QuoteLaneRow
  today: string
  createdBy: string | null
}

// The orders status ladder → derived milestones (a real, honest get_import view).
const ORDER_STAGES = ['CONTRACTED', 'IN_PRODUCTION', 'READY', 'SHIPPED', 'DELIVERED', 'CLOSED'] as const

// ── Pure mapping helpers (unit-tested; no DB) ────────────────────────────────

/** PURE: derive milestones from an order status — done up to and including the current stage. */
export function orderMilestones(status: string): { label: string; date: string | null; done: boolean }[] {
  const idx = ORDER_STAGES.indexOf(status as (typeof ORDER_STAGES)[number])
  return ORDER_STAGES.map((label, i) => ({ label, date: null, done: idx >= 0 && i <= idx }))
}

/**
 * PURE: build the structured QuoteSpec the shared core prices from the tool input. The
 * agent supplies only product facts — freight and margin are ALWAYS null here, forcing
 * the server to source freight (rate_tables) and margin (org_rules). This is why the
 * quote-core's "indicado por el operador" provenance label can never lie on this path.
 */
export function specFromQuoteInput(input: QuoteToolInput): QuoteSpec {
  return {
    understood: true,
    productName: input.productName,
    brand: input.brand,
    model: input.model,
    fuelType: input.fuelType,
    engineCC: input.engineCC,
    origin: input.origin,
    incoterm: input.incoterm,
    scenarios: [input.incoterm],
    fob: input.fob,
    freightInternational: null, // server-sourced (rate_tables) — never agent-supplied
    quantity: input.quantity ?? null,
    clientName: input.clientName ?? null,
    language: input.language ?? null,
    marginPercent: null, // server-sourced (org_rules) — never agent-supplied
    note: '',
  }
}

/** PURE: map the shared core result into the tool-facing quote result. */
export function quoteToolResultFromCore(core: QuoteCoreResult): QuoteToolResult {
  return {
    draftIds: core.draftIds,
    approvable: core.result.approvable,
    blockers: core.result.hojaCostos.blockers.map((b) => b.reason.es),
    persisted: core.persisted,
    note: core.persistNote?.es,
  }
}

/** Build the RLS-scoped provider for one run. */
export function createTorreProvider(db: TowerDb, ctx: TorreProviderContext): TorreToolProvider {
  const brandId = ctx.laneRow.brand_id

  return {
    async getImport({ importId }): Promise<ImportSummary | null> {
      const { data } = await db
        .from('orders')
        .select('id,status,incoterm,accounts(name),lanes(code)')
        .eq('brand_id', brandId) // brand-scope for parity with the other reads (RLS + brand)
        .eq('id', importId)
        .maybeSingle()
      if (!data) return null
      const row = data as {
        id: string
        status: string
        incoterm: string | null
        accounts: { name: string | null } | { name: string | null }[] | null
        lanes: { code: string | null } | { code: string | null }[] | null
      }
      const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)
      return {
        id: row.id,
        ref: row.id, // full id so get_import(ref) round-trips (the id IS the reference)
        status: row.status,
        laneCode: one(row.lanes)?.code ?? null,
        clientName: one(row.accounts)?.name ?? null,
        milestones: orderMilestones(row.status),
        openIssues: row.status === 'CANCELLED' ? ['Orden cancelada'] : [],
      }
    },

    async getParties({ kind, id, query }): Promise<PartySummary[]> {
      const table = kind === 'client' ? 'accounts' : 'suppliers'
      let q = db.from(table).select('id,name,country').eq('brand_id', brandId).limit(10)
      if (id) q = q.eq('id', id)
      // strip LIKE wildcards so `query:"%"` can't smuggle a list-everything match
      else if (query) q = q.ilike('name', `%${query.replace(/[%_]/g, '')}%`)
      const { data } = await q
      return ((data ?? []) as { id: string; name: string; country: string | null }[]).map((r) => ({
        id: r.id,
        name: r.name,
        kind,
        country: r.country,
        preferences: [],
        recentImports: [],
      }))
    },

    async getRates(): Promise<RateRow[]> {
      // Return all brand+lane rate rows; the tool formatter applies the criteria filter.
      const { data } = await db
        .from('rate_tables')
        .select('kind,route,mode,container_type,rate_minor,currency,valid_from,valid_to,source')
        .eq('brand_id', brandId)
        .or(`lane_id.eq.${ctx.laneRow.id},lane_id.is.null`)
      return ((data ?? []) as Array<{
        kind: 'FREIGHT' | 'INSURANCE'
        route: string
        mode: 'SEA' | 'AIR' | 'LAND'
        container_type: string | null
        rate_minor: number
        currency: string
        valid_from: string
        valid_to: string | null
        source: string | null
      }>).map((r) => ({
        kind: r.kind,
        route: r.route,
        mode: r.mode,
        containerType: r.container_type,
        rateMinor: r.rate_minor,
        currency: r.currency,
        validFrom: r.valid_from,
        validTo: r.valid_to,
        source: r.source,
      }))
    },

    async getTariff(): Promise<TariffPosition[]> {
      const { data } = await db
        .from('tariff_positions')
        .select('hs_code,description,keywords,duty_bps,iva_bps,verified_at')
        .eq('brand_id', brandId)
        .order('hs_code')
      return ((data ?? []) as Array<{
        hs_code: string
        description: string
        keywords: string[] | null
        duty_bps: number
        iva_bps: number
        verified_at: string | null
      }>).map((r) => ({
        hsCode: r.hs_code,
        description: r.description,
        keywords: r.keywords ?? [],
        dutyBps: r.duty_bps,
        ivaBps: r.iva_bps,
        verifiedAt: r.verified_at,
      }))
    },

    async getCostingConfig(): Promise<CostingConfigSummary> {
      const { data: config } = await db
        .from('costing_config')
        .select('igv_bps,percepcion_bps,insurance_bps,version')
        .eq('brand_id', brandId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()
      const c = config as { igv_bps: number; percepcion_bps: number; insurance_bps: number; version: number } | null
      const { data: adv } = await db.from('ad_valorem_rates').select('hs_prefix,bps').eq('brand_id', brandId)
      const defaultRow = ((adv ?? []) as { hs_prefix: string; bps: number }[]).find((r) => r.hs_prefix === '')
      return {
        igvRate: (c?.igv_bps ?? 1800) / 10_000,
        percepcionRate: (c?.percepcion_bps ?? 350) / 10_000,
        insuranceRate: (c?.insurance_bps ?? 150) / 10_000,
        exchangeRate: 3.7, // MOCK_CONNECTORS: referential TC, no live feed
        adValoremDefault: defaultRow ? defaultRow.bps / 10_000 : null,
        sources: [
          { label: `costing_config${c ? ` v${c.version}` : ' (default)'}` },
          { label: 'TC referencial 3.70 (mock)' },
        ],
      }
    },

    async searchKnowledge(): Promise<KnowledgeHit[]> {
      // Interim: the RAG corpus (pgvector) lands in L6. No corpus → no precedents (honest).
      return []
    },

    async proposeQuote(input: QuoteToolInput): Promise<QuoteToolResult> {
      const core = await runQuoteFromSpec(db, ctx.laneRow, specFromQuoteInput(input), {
        today: ctx.today,
        persist: true,
        createdBy: ctx.createdBy,
        hsCodeHint: input.hsCode,
      })
      return quoteToolResultFromCore(core)
    },

    async draftMessage(input: MessageToolInput): Promise<{ draftId: string }> {
      const payload = comunicacionPayloadSchema.parse({
        kind: 'COMUNICACION',
        channel: input.channel,
        audience: input.audience,
        // one source of truth (tone.ts). The tool resolves this before calling us; this is a
        // defensive fallback for a direct caller — either way the rule lives in ONE place.
        language: input.language ?? defaultLanguage(input.audience),
        to: input.to ?? null,
        subject: input.subject ?? null,
        body: input.body,
        sideEffect: input.sideEffect,
        blockers: [],
      })
      const row = buildTorreInsert(payload, {
        brandId,
        laneId: ctx.laneRow.id,
        confidence: 0.7,
        model: INTELLIGENCE_MODELS.reason,
        createdBy: ctx.createdBy,
      })
      const { data, error } = await db.from('ai_drafts').insert(row).select(TORRE_DRAFT_SELECT_COLS).single()
      if (error || !data) throw new Error('No se pudo guardar el borrador (permisos)')
      const mapped = mapTorreDraftRow(data as unknown as RawTorreDraftRow)
      if (!mapped) throw new Error('Borrador inválido')
      return { draftId: mapped.id }
    },
  }
}
