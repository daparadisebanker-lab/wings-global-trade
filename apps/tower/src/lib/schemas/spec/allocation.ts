// src/lib/schemas/spec/allocation.ts
// ALLOCATION archetype default spec fields (root CLAUDE.md §3 · §5-bis: buyer
// buys a share of a planned container of a represented brand — RB/xx hosted
// brands). Program ruling R1 (represented-brands-console/SPEC.md): the ALLOCATION
// spec carries ONLY fiche PRESENTATION data — never diagram geometry. Packing
// geometry (box/cells/pallet/explode) lives in rb_diagram_specs (Wave 4);
// hs_code lives on the rb_products column; gtin on rb_packing_profiles. Each of
// those has one home — none are duplicated here (Prime Directive 5).
//
// The `specRows` field (added in the shared SpecForm amendment, tower_44) is the
// human-facing fiche table of {label, value, icon?} rows — an object-array the
// once-frozen SpecFieldDef builders could not express (array items were
// string|number only). It carries ONLY fiche PRESENTATION (R1): geometry still
// lives in rb_diagram_specs, hs_code on the rb_products column, gtin on
// rb_packing_profiles — none duplicated here. Bumping this field list bumped the
// ALLOCATION default to v2 (registry.SPEC_SCHEMA_VERSIONS); the versioned DB row
// is seeded by migration tower_44 (never an edit-in-place — ADR-3/ADR-6).
import { arrayField, localizedStringField, specRowsField } from './fields'
import type { SpecFieldDef } from './fields'

export const ALLOCATION_SPEC_FIELDS: SpecFieldDef[] = [
  localizedStringField('unitLabel', { es: 'Etiqueta de unidad', en: 'Unit label' }, { required: true }),
  localizedStringField('description', { es: 'Descripción', en: 'Description' }, { required: true }),
  arrayField('highlights', { es: 'Destacados', en: 'Highlights' }, { type: 'string' }),
  specRowsField('specRows', { es: 'Ficha de especificaciones', en: 'Specification rows' }),
]
