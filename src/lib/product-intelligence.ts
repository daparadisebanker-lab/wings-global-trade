// src/lib/product-intelligence.ts
// Pure utility module — no React imports, no side effects.
// All exports are named exports.

import { lookupDutyRate } from '@/lib/duty-rates'

// 1. HS_CHAPTER
export const HS_CHAPTER: Record<string, string> = {
  'maquinaria-agricola': '84',
  'camiones': '87',
  'buses': '87',
  'equipo-industrial': '84',
  'repuestos': '84',
}

// 2. ORIGIN_PORTS
export const ORIGIN_PORTS: Record<string, { name: string; country: string }> = {
  'China':     { name: 'Yantian · Guangdong', country: 'CN' },
  'Japón':     { name: 'Yokohama', country: 'JP' },
  'Japan':     { name: 'Yokohama', country: 'JP' },
  'Tailandia': { name: 'Laem Chabang', country: 'TH' },
  'Thailand':  { name: 'Laem Chabang', country: 'TH' },
  'India':     { name: 'Nhava Sheva · Mumbai', country: 'IN' },
  'Dubai':     { name: 'Jebel Ali', country: 'AE' },
}

// 3. TRANSIT_DAYS + DEFAULT_TRANSIT (DEFAULT_TRANSIT is module-private, not exported)
export const TRANSIT_DAYS: Record<string, { originToPort: number; oceanTransit: number; portToZone: number }> = {
  'China':     { originToPort: 3, oceanTransit: 28, portToZone: 7 },
  'Japón':     { originToPort: 2, oceanTransit: 22, portToZone: 7 },
  'Japan':     { originToPort: 2, oceanTransit: 22, portToZone: 7 },
  'Tailandia': { originToPort: 4, oceanTransit: 26, portToZone: 7 },
  'Thailand':  { originToPort: 4, oceanTransit: 26, portToZone: 7 },
  'India':     { originToPort: 4, oceanTransit: 32, portToZone: 7 },
  'Dubai':     { originToPort: 3, oceanTransit: 35, portToZone: 7 },
}
const DEFAULT_TRANSIT = { originToPort: 3, oceanTransit: 30, portToZone: 7 }

// 4. inferContainerType
export function inferContainerType(weightKg: number): '20ft FCL' | '40ft HQ FCL' {
  return weightKg > 8000 ? '40ft HQ FCL' : '20ft FCL'
}

// 5. freightRangeDisplay
// Base rates by source market. low = base + 200 (zone transfer). high = low * 1.22.
// Returns "USD 3,400–4,148" format using 'es-PE' locale.
export function freightRangeDisplay(sourceMarket: string): string {
  const BASE: Record<string, number> = {
    China: 3200, Tailandia: 3000, Thailand: 3000,
    'Japón': 3400, Japan: 3400, Dubai: 3600,
  }
  const base = BASE[sourceMarket] ?? 3300
  const low = base + 200
  const high = Math.round(low * 1.22)
  return `USD ${low.toLocaleString('es-PE')}–${high.toLocaleString('es-PE')}`
}

// 6. categoryDutyRate
// Import lookupDutyRate from '@/lib/duty-rates'. Map slug to chapter via HS_CHAPTER. Default country 'Perú'.
export function categoryDutyRate(categorySlug: string, country = 'Perú'): { chapter: string; rate: number } {
  const chapter = HS_CHAPTER[categorySlug] ?? '84'
  const rate = lookupDutyRate(country, chapter + '00')
  return { chapter, rate }
}

// 7. altitudeHpCorrection
// hp * 0.97^floor(max(0, altitudeM - 2000) / 300), rounded to integer
export function altitudeHpCorrection(hp: number, altitudeM: number): number {
  if (altitudeM <= 2000) return hp
  const drops = Math.floor((altitudeM - 2000) / 300)
  return Math.round(hp * Math.pow(0.97, drops))
}

// 8. Certification type + detectCertifications
export type Certification =
  | 'CE'
  | 'Euro II'
  | 'Euro III'
  | 'Euro IV'
  | 'Euro V'
  | 'Euro VI'
  | 'Stage II'
  | 'Stage III'
  | 'Stage IV'
  | 'EPA Tier 4'
  | 'INDECOPI'
  | 'ISO 9001'

export function detectCertifications(specs: Record<string, unknown>): Certification[] {
  const text = JSON.stringify(specs).toLowerCase()
  const found: Certification[] = []
  if (/\bce\b/.test(text)) found.push('CE')
  if (/euro\s?vi/.test(text)) found.push('Euro VI')
  else if (/euro\s?v/.test(text)) found.push('Euro V')
  else if (/euro\s?iv/.test(text)) found.push('Euro IV')
  else if (/euro\s?iii/.test(text)) found.push('Euro III')
  else if (/euro\s?ii/.test(text)) found.push('Euro II')
  if (/stage\s?iv/.test(text)) found.push('Stage IV')
  else if (/stage\s?iii/.test(text)) found.push('Stage III')
  else if (/stage\s?ii/.test(text)) found.push('Stage II')
  if (/epa\s?tier\s?4/.test(text)) found.push('EPA Tier 4')
  if (/iso\s?9001/.test(text)) found.push('ISO 9001')
  return found
}

// 9. catalogPercentile
// normalized is 0–1. Returns human-readable catalog position string.
export function catalogPercentile(normalized: number): string {
  const pct = Math.round(normalized * 100)
  if (pct >= 80) return `Top ${100 - pct}% catálogo`
  if (pct >= 50) return 'Sobre la media'
  if (pct >= 20) return 'Bajo la media'
  return 'Rango base catálogo'
}

// 10. getTransitDays
export function getTransitDays(sourceMarket: string): { originToPort: number; oceanTransit: number; portToZone: number } {
  return TRANSIT_DAYS[sourceMarket] ?? DEFAULT_TRANSIT
}
