// src/lib/schemas/spec/project.ts
// PROJECT archetype default spec fields (root CLAUDE.md §3: buyer buys a scoped
// delivery tied to milestones — FF&E / interiors dual taxonomy: discipline + space).
import { arrayField, booleanField, enumField, integerField, localizedStringField, numberField } from './fields'
import type { SpecFieldDef } from './fields'

export const PROJECT_SPEC_FIELDS: SpecFieldDef[] = [
  enumField(
    'discipline',
    { es: 'Disciplina', en: 'Discipline' },
    [
      { value: 'ffe', label: { es: 'FF&E', en: 'FF&E' } },
      { value: 'lighting', label: { es: 'Iluminación', en: 'Lighting' } },
      { value: 'millwork', label: { es: 'Carpintería', en: 'Millwork' } },
      { value: 'textiles', label: { es: 'Textiles', en: 'Textiles' } },
      { value: 'artwork', label: { es: 'Arte', en: 'Artwork' } },
    ],
    { required: true },
  ),
  enumField(
    'spaceType',
    { es: 'Tipo de espacio', en: 'Space type' },
    [
      { value: 'guestroom', label: { es: 'Habitación', en: 'Guestroom' } },
      { value: 'lobby', label: { es: 'Lobby', en: 'Lobby' } },
      { value: 'restaurant', label: { es: 'Restaurante', en: 'Restaurant' } },
      { value: 'spa', label: { es: 'Spa', en: 'Spa' } },
      { value: 'back_of_house', label: { es: 'Área de servicio', en: 'Back of house' } },
    ],
    { required: true },
  ),
  localizedStringField(
    'scopeSummary',
    { es: 'Resumen del alcance', en: 'Scope summary' },
    { required: true },
  ),
  integerField('keyCount', { es: 'Número de llaves', en: 'Key count' }, { min: 0 }),
  numberField('areaSqm', { es: 'Área', en: 'Area' }, { unit: 'm²', min: 0 }),
  enumField('finishGrade', { es: 'Nivel de acabado', en: 'Finish grade' }, [
    { value: 'standard', label: { es: 'Estándar', en: 'Standard' } },
    { value: 'premium', label: { es: 'Premium', en: 'Premium' } },
    { value: 'luxury', label: { es: 'Lujo', en: 'Luxury' } },
  ]),
  arrayField('milestones', { es: 'Hitos', en: 'Milestones' }, { type: 'string' }),
  booleanField('installationRequired', { es: 'Requiere instalación', en: 'Installation required' }),
]
