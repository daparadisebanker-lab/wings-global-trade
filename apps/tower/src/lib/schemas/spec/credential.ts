// src/lib/schemas/spec/credential.ts
// CREDENTIAL archetype default spec fields (root CLAUDE.md §3: buyer buys
// access + legitimacy — a mandate, not cargo).
import { enumField, localizedStringField, stringField } from './fields'
import type { SpecFieldDef } from './fields'

export const CREDENTIAL_SPEC_FIELDS: SpecFieldDef[] = [
  stringField('territory', { es: 'Territorio', en: 'Territory' }, { required: true }),
  localizedStringField('scopeSummary', { es: 'Resumen del alcance', en: 'Scope summary' }, { required: true }),
  enumField('mandateType', { es: 'Tipo de mandato', en: 'Mandate type' }, [
    { value: 'exclusive', label: { es: 'Exclusivo', en: 'Exclusive' } },
    { value: 'non_exclusive', label: { es: 'No exclusivo', en: 'Non-exclusive' } },
  ]),
  stringField(
    'activationDate',
    { es: 'Fecha de activación', en: 'Activation date' },
    { description: { es: 'AAAA-MM-DD', en: 'YYYY-MM-DD' } },
  ),
]
