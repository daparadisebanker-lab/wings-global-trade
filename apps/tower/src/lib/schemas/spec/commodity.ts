// src/lib/schemas/spec/commodity.ts
// COMMODITY archetype default spec fields (root CLAUDE.md §3: buyer buys volume
// at grade + price window — provisions/agri: grade + harvest are load-bearing).
import { arrayField, enumField, localizedStringField, numberField, stringField } from './fields'
import type { SpecFieldDef } from './fields'

export const COMMODITY_SPEC_FIELDS: SpecFieldDef[] = [
  localizedStringField('varietal', { es: 'Variedad', en: 'Varietal' }, { required: true }),
  enumField(
    'grade',
    { es: 'Grado', en: 'Grade' },
    [
      { value: 'export', label: { es: 'Exportación', en: 'Export' } },
      { value: 'grade_a', label: { es: 'Grado A', en: 'Grade A' } },
      { value: 'grade_b', label: { es: 'Grado B', en: 'Grade B' } },
      { value: 'industrial', label: { es: 'Industrial', en: 'Industrial' } },
    ],
    { required: true },
  ),
  stringField(
    'harvestWindow',
    { es: 'Ventana de cosecha', en: 'Harvest window' },
    { description: { es: 'ej. Jun–Sep', en: 'e.g. Jun–Sep' } },
  ),
  numberField('moisturePercent', { es: 'Humedad', en: 'Moisture' }, { unit: '%', min: 0, max: 100 }),
  numberField('densityKgM3', { es: 'Densidad', en: 'Density' }, { unit: 'kg/m³', min: 0 }),
  enumField('packaging', { es: 'Empaque', en: 'Packaging' }, [
    { value: 'bulk', label: { es: 'Granel', en: 'Bulk' } },
    { value: 'bag', label: { es: 'Saco', en: 'Bag' } },
    { value: 'pallet', label: { es: 'Pallet', en: 'Pallet' } },
    { value: 'container', label: { es: 'Contenedor', en: 'Container' } },
  ]),
  arrayField('certifications', { es: 'Certificaciones', en: 'Certifications' }, { type: 'string' }),
  localizedStringField('originRegion', { es: 'Región de origen', en: 'Origin region' }),
]
