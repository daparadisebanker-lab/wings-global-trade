-- tower_44 · ALLOCATION spec v2 — the `specRows` object-array fiche field.
--
-- Shared-system (SpecForm) framework amendment: the once-frozen SpecFieldDef
-- builders gained a `specRows` object-array kind ({label, value, icon?} rows).
-- ALLOCATION's field list now carries a `specRows` field, so its code default
-- bumped to v2 (registry.SPEC_SCHEMA_VERSIONS.ALLOCATION = 2). Because the DB
-- `spec_schemas` row is a SNAPSHOT of the code field defs (tower_26 §2.4 seeded
-- ALLOCATION v1 verbatim), a field-def change is a NEW version row — never an
-- edit-in-place (ADR-3/ADR-6, append-only law). This seeds that v2 row.
--
-- getSpecSchema('ALLOCATION', …) resolves the HIGHEST published version
-- (lib/archetypes.resolveSpecSchema): with v1 (tower_26) + v2 (here) present, it
-- returns v2 — the schema that includes `specRows`. tower_26 is NOT touched; its
-- v1 row stays for history. The other six archetypes are unchanged (still v1).
--
-- REGENERATED from lib/schemas/spec/registry.ts (never hand-authored) — this is
-- specFieldsToJsonSchema('ALLOCATION', 2, ALLOCATION_SPEC_FIELDS) verbatim, same
-- convention + idempotent guard as tower_26 §2.4. lane_id = null (no lane
-- override). PREREQ: tower_13 (spec_schemas) + tower_26 (ALLOCATION v1).

set search_path to tower, public;

insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
select 'ALLOCATION', null, 2, $allocation_schema$
{
  "type": "object",
  "x-archetype": "ALLOCATION",
  "x-version": 2,
  "properties": {
    "unitLabel": { "type": "string", "x-localized": true, "x-label": { "es": "Etiqueta de unidad", "en": "Unit label" }, "x-order": 0 },
    "description": { "type": "string", "x-localized": true, "x-label": { "es": "Descripción", "en": "Description" }, "x-order": 1 },
    "highlights": { "type": "array", "items": { "type": "string" }, "x-label": { "es": "Destacados", "en": "Highlights" }, "x-order": 2 },
    "specRows": {
      "type": "array",
      "x-spec-rows": true,
      "items": {
        "type": "object",
        "properties": {
          "label": { "type": "string" },
          "value": { "type": "string" },
          "icon": { "type": "string", "enum": ["box", "pallet", "cbm", "weight", "clock", "doc", "tag"] }
        },
        "required": ["label", "value"]
      },
      "x-label": { "es": "Ficha de especificaciones", "en": "Specification rows" },
      "x-order": 3
    }
  },
  "required": ["unitLabel", "description"]
}
$allocation_schema$::jsonb
where not exists (
  select 1 from tower.spec_schemas where archetype = 'ALLOCATION' and lane_id is null and version = 2
)
on conflict (archetype, lane_id, version) do nothing;
