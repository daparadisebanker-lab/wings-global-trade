// src/lib/quotation/company.ts
// The Wings issuer block printed on every official quotation. Static brand
// constants (header tagline + footer contact/address), taken from the approved
// "Cotización" reference document. Not tokens — this is document content, not
// UI chrome; kept in one place so a contact change is a one-line edit.

export interface CompanyInfo {
  name: string
  tagline: string
  email: string
  whatsapp: string
  address: string
  website: string
  /** Public path to the imagotipo (mark + wordmark), rendered black on the doc. */
  logoSrc: string
}

export const WINGS_ISSUER: CompanyInfo = {
  name: 'WINGS GLOBAL TRADE',
  tagline: 'SOLUCIONES INTEGRALES EN IMPORTACIÓN',
  email: 'comercial@wingsglobaltrade.com',
  whatsapp: '+507 6025-07',
  address: 'Ctra. Panamericana Sur Km. 1303  Mz. Q  Lt. 8-9',
  website: 'wingsglobaltrade.com',
  logoSrc: '/brand/wings-imagotipo.svg',
}
