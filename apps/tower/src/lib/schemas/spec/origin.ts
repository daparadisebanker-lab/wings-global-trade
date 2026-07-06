// src/lib/schemas/spec/origin.ts
// ORIGIN archetype default spec fields (root CLAUDE.md §3: buyer buys
// provenance + documentation outbound).
import { arrayField, enumField, localizedStringField, stringField } from './fields'
import type { SpecFieldDef } from './fields'

export const ORIGIN_SPEC_FIELDS: SpecFieldDef[] = [
  stringField('originCountry', { es: 'País de origen', en: 'Origin country' }, { required: true }),
  enumField('containerType', { es: 'Tipo de contenedor', en: 'Container type' }, [
    { value: '20GP', label: { es: '20GP', en: '20GP' } },
    { value: '40GP', label: { es: '40GP', en: '40GP' } },
    { value: '40HC', label: { es: '40HC', en: '40HC' } },
    { value: 'REEFER', label: { es: 'Refrigerado', en: 'Reefer' } },
  ]),
  arrayField('certificateTypes', { es: 'Tipos de certificado', en: 'Certificate types' }, { type: 'string' }),
  stringField(
    'seasonalityWindow',
    { es: 'Ventana de estacionalidad', en: 'Seasonality window' },
    { description: { es: 'ej. Oct–Mar', en: 'e.g. Oct–Mar' } },
  ),
  localizedStringField('documentationNotes', { es: 'Notas de documentación', en: 'Documentation notes' }),
]
