// src/lib/schemas/spec/allocation.ts
// ALLOCATION archetype default spec fields (root CLAUDE.md §3 · §5-bis: buyer
// buys a share of a planned container of a represented brand — RB/xx hosted
// brands). Program ruling R1 (represented-brands-console/SPEC.md): the ALLOCATION
// spec carries ONLY fiche PRESENTATION data — never diagram geometry. Packing
// geometry (box/cells/pallet/explode) lives in rb_diagram_specs (Wave 4);
// hs_code lives on the rb_products column; gtin on rb_packing_profiles. Each of
// those has one home — none are duplicated here (Prime Directive 5).
//
// Deferred (documented, not built here): `spec_rows` — the human-facing fiche
// table of {label, value, icon} rows. It is an array-of-objects, which the
// frozen SpecFieldDef builders (fields.ts) cannot express (array items are
// string|number only). Adding an object-array field kind is a change to the
// shared, schema-driven SpecForm system — a framework amendment, not a Wave-2
// build task. Until then the renderable presentation fields below cover the
// fiche's unitLabel / description / highlights; spec_rows is a later refinement.
import { arrayField, localizedStringField } from './fields'
import type { SpecFieldDef } from './fields'

export const ALLOCATION_SPEC_FIELDS: SpecFieldDef[] = [
  localizedStringField('unitLabel', { es: 'Etiqueta de unidad', en: 'Unit label' }, { required: true }),
  localizedStringField('description', { es: 'Descripción', en: 'Description' }, { required: true }),
  arrayField('highlights', { es: 'Destacados', en: 'Highlights' }, { type: 'string' }),
]
