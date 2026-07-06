// src/lib/schemas/spec/program.ts
// PROGRAM archetype default spec fields (root CLAUDE.md §3: buyer buys
// repeating SKU assortments).
import { integerField, localizedStringField, numberField, stringField } from './fields'
import type { SpecFieldDef } from './fields'

export const PROGRAM_SPEC_FIELDS: SpecFieldDef[] = [
  localizedStringField('assortmentName', { es: 'Nombre del surtido', en: 'Assortment name' }, { required: true }),
  integerField('skuCount', { es: 'Número de SKU', en: 'SKU count' }, { min: 1 }),
  stringField('packagingUnit', { es: 'Unidad de empaque', en: 'Packaging unit' }),
  integerField('replenishmentCycleWeeks', { es: 'Ciclo de reposición', en: 'Replenishment cycle' }, { unit: 'sem / wk', min: 0 }),
  numberField('cartonRunMin', { es: 'Tirada mínima de cartón', en: 'Minimum carton run' }, { min: 0 }),
]
