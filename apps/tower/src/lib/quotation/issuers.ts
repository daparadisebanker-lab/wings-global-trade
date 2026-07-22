// src/lib/quotation/issuers.ts
// The issuer-intelligence layer. A quotation/proforma is issued by ONE of the
// group's legal entities, and WHICH entity — together with all of its printed
// data (legal name, tax id, address, banking, default ports/terms, tax posture,
// document language) — is a deterministic function of the DESTINATION the goods
// are quoted to. Callao/Perú → Wings Global Trade S.A.C. (Perú). Iquique/Chile
// (the ZOFRI free-zone route that serves Bolivian buyers) → Import-Export
// Shining Star Ltda (Chile).
//
// Before this file the whole stack hardcoded a single issuer (WINGS_ISSUER /
// WINGS_EXPORTER / DEFAULT_BANKING / DEFAULT_PROFORMA_TERMS). Those constants
// still exist and are UNCHANGED; WINGS_PE below is composed from them, so the
// default path renders byte-for-byte what it did before. New entities are added
// to ISSUER_REGISTRY, never by forking the document code (same "one box, many
// liveries" law the lanes follow).
//
// No money math lives here (Directive 3 / ADR-7): tax posture is expressed as a
// label + basis points and computed by the shared quotation math downstream.
import type { CompanyInfo } from './company'
import { WINGS_ISSUER } from './company'
import type { BankingDetails, ProformaTerms, TradeParty } from './proforma'
import {
  DEFAULT_BANKING,
  DEFAULT_PROFORMA_TAX_BPS,
  DEFAULT_PROFORMA_TAX_LABEL,
  DEFAULT_PROFORMA_TERMS,
  WINGS_EXPORTER,
} from './proforma'

/** Document language posture. `es` = Spanish only; `es-en` = ES primary + EN secondary. */
export type DocLocale = 'es' | 'es-en'

/**
 * A legal entity that can issue a quotation/proforma, bundling every value the
 * document renders on its behalf. One entity per row of ISSUER_REGISTRY; the
 * `serves` keys drive resolveIssuer().
 */
export interface IssuerEntity {
  /** Stable id — the value a persisted `quotes.issuer_id` would carry. */
  id: string
  /** Short operator-facing key, e.g. 'WGT-PE', 'SHINING-CL'. */
  key: string
  /** ISO-3166 alpha-2 of the entity's domicile. */
  country: string
  /** Tax-id label shown on the party block (RUC · PE, RUT · CL, NIT · CO…). */
  taxIdLabel: string
  /** Doc-number infix — PF-{docPrefix}-YYYY-NNNN. Shared 'WGT' series today. */
  docPrefix: string
  /** Header/footer brand block (logo, tagline, contact). */
  issuer: CompanyInfo
  /** Seller/exporter party printed under "Vendedor / Exportador". */
  exporter: TradeParty
  /** Bank instructions; `null` → the doc omits the "Datos bancarios" section. */
  banking: BankingDetails | null
  /** Per-entity commercial defaults (ports, payment, delivery, validity, warranty). */
  terms: ProformaTerms
  /** Default incoterm string for the dateline when the quote does not set one. */
  defaultIncoterm: string
  /** Tax posture. `taxBps: 0` prints no tax line (e.g. a FOB export from Chile). */
  taxLabel: string
  taxBps: number
  /** City the dateline defaults to (issue city). */
  defaultIssueCity: string
  /** Language the document renders in. */
  locale: DocLocale
  /** Whether the footer prints the entity postal address (a per-entity policy). */
  footerShowsAddress: boolean
  /** Destination countries/ports (lowercased names) this entity is the issuer for. */
  serves: { countries: string[]; ports: string[] }
}

// ── Entity 1 · Wings Global Trade S.A.C. (Perú) — the historical default ──────
// Composed from the existing single-issuer constants so the default document is
// unchanged. Serves the Peruvian import route (Callao/Lima).
export const WINGS_PE: IssuerEntity = {
  id: 'wgt-pe',
  key: 'WGT-PE',
  country: 'PE',
  taxIdLabel: 'RUC',
  docPrefix: 'WGT',
  issuer: WINGS_ISSUER,
  exporter: WINGS_EXPORTER,
  banking: DEFAULT_BANKING,
  terms: DEFAULT_PROFORMA_TERMS,
  defaultIncoterm: 'CIF - Callao (Incoterms ® 2020)',
  taxLabel: DEFAULT_PROFORMA_TAX_LABEL,
  taxBps: DEFAULT_PROFORMA_TAX_BPS,
  defaultIssueCity: 'Lima',
  locale: 'es-en',
  footerShowsAddress: true,
  serves: { countries: ['perú', 'peru'], ports: ['callao', 'lima', 'paita', 'tacna'] },
}

// ── Entity 2 · Import-Export Shining Star Ltda (Chile) — the ZOFRI route ──────
// The group's Chilean entity, issuing for the Iquique free-zone route that
// serves Bolivian buyers. Data captured from the first live Chilean proforma
// (PF-WGT-2026-0723). FOB, Spanish-only, banking omitted by default.
export const SHINING_STAR_CL: IssuerEntity = {
  id: 'shining-star-cl',
  key: 'SHINING-CL',
  country: 'CL',
  taxIdLabel: 'RUT',
  docPrefix: 'WGT',
  issuer: {
    name: 'WINGS GLOBAL TRADE',
    tagline: 'SOLUCIONES INTEGRALES EN IMPORTACIÓN',
    email: 'importaciones@wingsglobaltrade.com',
    // Footer general contact = the group Panamá line (not the rep's WhatsApp).
    whatsapp: '+507 6025-07',
    address: 'Pasaje Cuatro 2213, Condominio Oasis, Iquique, Chile',
    website: 'wingsglobaltrade.com',
    logoSrc: '/brand/wings-imagotipo.svg',
  },
  exporter: {
    name: 'IMPORT - EXPORT SHINING STAR LIMITADA',
    taxId: '76029544-2',
    address: 'Pasaje Cuatro 2213, Condominio Oasis',
    city: 'Iquique, Chile',
    phone: '+56 937305608',
    email: 'importaciones@wingsglobaltrade.com',
    website: 'wingsglobaltrade.com',
  },
  banking: null,
  terms: {
    portOfOrigin: 'Qingdao, China',
    portOfDestination: 'Iquique, Chile',
    paymentTerms: '50% adelantado y 50% al embarque en el puerto de origen.',
    deliveryTime: 'Embarque dentro de 30 días naturales tras recibir el pago final.',
    validityText: '15 días desde la fecha de esta proforma.',
    warranty: null,
  },
  defaultIncoterm: 'FOB (Incoterms ® 2020)',
  taxLabel: 'FOB',
  taxBps: 0,
  defaultIssueCity: 'Iquique',
  locale: 'es',
  footerShowsAddress: false,
  serves: { countries: ['chile', 'bolivia'], ports: ['iquique', 'zofri', 'antofagasta', 'arica'] },
}

/** All issuing entities. Append-only, like the lane/brand registries. */
export const ISSUER_REGISTRY: IssuerEntity[] = [WINGS_PE, SHINING_STAR_CL]

/** The entity used when a destination matches nothing — the historical default. */
export const DEFAULT_ISSUER: IssuerEntity = WINGS_PE

/** Look an entity up by its stable id (e.g. a persisted `quotes.issuer_id`). */
export function issuerById(id: string | null | undefined): IssuerEntity | null {
  if (!id) return null
  return ISSUER_REGISTRY.find((e) => e.id === id) ?? null
}

/** The destination signal the resolver reads — any/all fields may be blank. */
export interface DestinationSignal {
  /** Free-text port of destination, e.g. terms.portOfDestination ("Iquique, Chile"). */
  port?: string | null
  /** Country name or ISO, e.g. the buyer account's country ("Bolivia"). */
  country?: string | null
}

/**
 * Resolve the issuing entity from where the goods are going. Matches a non-default
 * entity when the destination port OR country names one of its `serves` keys;
 * otherwise returns DEFAULT_ISSUER. Order in ISSUER_REGISTRY breaks ties.
 *
 * An explicit `issuer_id` (once persisted) should ALWAYS win over this — call
 * issuerById() first and only fall back to resolveIssuer() when it is null.
 */
export function resolveIssuer(signal: DestinationSignal): IssuerEntity {
  const hay = `${signal.port ?? ''} ${signal.country ?? ''}`.toLowerCase()
  if (hay.trim()) {
    for (const entity of ISSUER_REGISTRY) {
      if (entity.id === DEFAULT_ISSUER.id) continue
      const hitPort = entity.serves.ports.some((p) => hay.includes(p))
      const hitCountry = entity.serves.countries.some((c) => hay.includes(c))
      if (hitPort || hitCountry) return entity
    }
  }
  return DEFAULT_ISSUER
}

/** True when the banking block has at least one printable field (else hide the section). */
export function hasBankingDetails(b: BankingDetails | null | undefined): boolean {
  return !!b && !!(b.bank || b.accountName || b.accountUsd || b.swift || b.cci)
}

/**
 * Merge stored proforma terms over a SPECIFIC entity's defaults (empties drop).
 * The entity-aware sibling of withDefaultProformaTerms (which is hardwired to
 * Wings' defaults): a Chilean proforma falls back to Qingdao/Iquique + 50/50,
 * a Peruvian one to Shanghai/Callao + 30/70.
 */
export function withEntityProformaTerms(
  stored: Partial<ProformaTerms> | null | undefined,
  entity: IssuerEntity,
): ProformaTerms {
  const s = stored ?? {}
  const d = entity.terms
  const pick = (v: string | null | undefined, fallback: string | null): string | null =>
    v && v.trim() ? v : fallback
  return {
    portOfOrigin: pick(s.portOfOrigin, d.portOfOrigin ?? null),
    portOfDestination: pick(s.portOfDestination, d.portOfDestination ?? null),
    paymentTerms: pick(s.paymentTerms, d.paymentTerms ?? null),
    deliveryTime: pick(s.deliveryTime, d.deliveryTime ?? null),
    validityText: pick(s.validityText, d.validityText ?? null),
    warranty: pick(s.warranty, d.warranty ?? null),
  }
}
