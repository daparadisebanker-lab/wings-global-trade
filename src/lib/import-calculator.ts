export type FuelType = 'hybrid' | 'gasoline' | 'diesel'
export type Origin = 'china' | 'other'
export type MarginMode = 'percent' | 'target_price'

export interface ImportInputs {
  brand: string
  model: string
  fuelType: FuelType
  engineCC: number
  origin: Origin
  year: number
  fob: number
  freightInternational: number
  freightZofratacna: number
  portExpenses: number
  customsAgency: number
  handlingStowage: number
  adValoremRate: number
  igvRate: number
  percepcionRate: number
  insuranceRate: number
  exchangeRate: number
  marginMode: MarginMode
  marginPercent: number
  targetSalePrice: number
}

export interface ImportResult {
  insurance: number
  cif: number
  adValorem: number
  iscRate: number
  isc: number
  igvImportacion: number
  percepcion: number
  gastosVinculados: number
  landedCost: number
  cashOutlay: number
  marginRate: number
  marginUSD: number
  salePrice: number
  igvVentas: number
  salePriceFinal: number
  igvNetPayable: number
  netProfit: number
}

export const DEFAULT_INPUTS: ImportInputs = {
  brand: '',
  model: '',
  fuelType: 'diesel',
  engineCC: 2400,
  origin: 'china',
  year: new Date().getFullYear(),
  fob: 14000,
  freightInternational: 2000,
  freightZofratacna: 500,
  portExpenses: 375,
  customsAgency: 300,
  handlingStowage: 0,
  adValoremRate: 0,
  igvRate: 0.18,
  percepcionRate: 0.035,
  insuranceRate: 0.015,
  exchangeRate: 3.70,
  marginMode: 'percent',
  marginPercent: 0.10,
  targetSalePrice: 0,
}

function deriveISCRate(inputs: ImportInputs): number {
  if (inputs.fuelType === 'hybrid' || inputs.fuelType === 'diesel') return 0
  return inputs.engineCC <= 1400 ? 0.05 : 0.075
}

export function calculate(inputs: ImportInputs): ImportResult {
  const {
    fob, freightInternational, freightZofratacna, portExpenses, customsAgency,
    handlingStowage, adValoremRate, igvRate, percepcionRate, insuranceRate,
    exchangeRate, marginMode, marginPercent, targetSalePrice,
  } = inputs

  const insurance = (fob + freightInternational) * insuranceRate
  const cif = fob + freightInternational + insurance
  const adValorem = adValoremRate * cif
  const iscRate = deriveISCRate(inputs)
  const isc = iscRate * (cif + adValorem)

  const igvImportacion = (cif + adValorem + isc) * igvRate
  const percepcion = (cif + adValorem + isc + igvImportacion) * percepcionRate
  const gastosVinculados = freightZofratacna + portExpenses + customsAgency + handlingStowage
  const landedCost = cif + adValorem + isc + gastosVinculados
  const cashOutlay = landedCost + igvImportacion + percepcion

  const minMarginRate = Math.max(marginPercent, landedCost > 0 ? 1000 / landedCost : 0)
  let marginRate: number
  let marginUSD: number

  if (marginMode === 'target_price' && targetSalePrice > 0) {
    const salePriceExIGV = targetSalePrice / (1 + igvRate)
    marginUSD = salePriceExIGV - landedCost
    marginRate = landedCost > 0 ? marginUSD / landedCost : 0
  } else {
    marginRate = minMarginRate
    marginUSD = landedCost * marginRate
  }

  const salePrice = landedCost + marginUSD
  const igvVentas = salePrice * igvRate
  const salePriceFinal = salePrice + igvVentas
  const igvNetPayable = (igvVentas - igvImportacion) * exchangeRate

  return {
    insurance, cif, adValorem, iscRate, isc, igvImportacion, percepcion,
    gastosVinculados, landedCost, cashOutlay, marginRate, marginUSD,
    salePrice, igvVentas, salePriceFinal, igvNetPayable, netProfit: marginUSD,
  }
}

export function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}
