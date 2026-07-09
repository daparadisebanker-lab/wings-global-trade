// src/lib/schemas/spec/equipment.ts
// EQUIPMENT archetype default spec fields (root CLAUDE.md §3: buyer buys
// specified units + after-sale confidence — machinery, trucks, industrial kit).
import { arrayField, booleanField, enumField, integerField, localizedStringField, numberField, stringField } from './fields'
import type { SpecFieldDef } from './fields'

export const EQUIPMENT_SPEC_FIELDS: SpecFieldDef[] = [
  stringField('model', { es: 'Modelo', en: 'Model' }, { required: true }),
  localizedStringField(
    'materialDescription',
    { es: 'Descripción del equipo', en: 'Equipment description' },
    { required: true },
  ),
  stringField('hsCode', { es: 'Código HS', en: 'HS code' }, { required: true }),
  enumField(
    'condition',
    { es: 'Condición', en: 'Condition' },
    [
      { value: 'new', label: { es: 'Nuevo', en: 'New' } },
      { value: 'refurbished', label: { es: 'Reacondicionado', en: 'Refurbished' } },
      { value: 'used', label: { es: 'Usado', en: 'Used' } },
    ],
    { required: true },
  ),
  numberField('weightKg', { es: 'Peso', en: 'Weight' }, { unit: 'kg', min: 0 }),
  stringField('dimensionsLwhM', { es: 'Dimensiones (L×A×A, m)', en: 'Dimensions (L×W×H, m)' }),
  numberField('powerRatingKw', { es: 'Potencia', en: 'Power rating' }, { unit: 'kW', min: 0 }),
  integerField('warrantyMonths', { es: 'Garantía', en: 'Warranty' }, { unit: 'meses / months', min: 0 }),
  arrayField('certifications', { es: 'Certificaciones', en: 'Certifications' }, { type: 'string' }),
  booleanField('commissioningIncluded', { es: 'Incluye puesta en marcha', en: 'Commissioning included' }),
]
