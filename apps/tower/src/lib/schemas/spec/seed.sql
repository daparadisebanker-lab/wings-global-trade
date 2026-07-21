-- src/lib/schemas/spec/seed.sql
-- Idempotent seed for tower.spec_schemas: the archetype-default JSON-Schema
-- for all six archetypes (lane_id = null → archetype default, ADR-3). Applied
-- by the Conductor — this Wave-2 builder does not run migrations or write to
-- Supabase. Generated from apps/tower/src/lib/schemas/spec/registry.ts
-- (SPEC_JSON_SCHEMA_DEFAULTS); if a field def changes, bump SPEC_SCHEMA_VERSION
-- and re-run this file — it never edits an existing (archetype, lane_id,
-- version) row in place (ADR-3/ADR-6: append a new version, don't mutate).
--
-- NOTE ON IDEMPOTENCY: `unique (archetype, lane_id, version)` on spec_schemas
-- does NOT make `on conflict (archetype, lane_id, version) do nothing` reliably
-- idempotent for these rows, because standard SQL/Postgres unique constraints
-- treat NULL as distinct from NULL — two rows with the same archetype/version
-- and lane_id = null do not violate the constraint, so no conflict is ever
-- detected. Each insert below is therefore guarded by `where not exists (...)`
-- (which correctly matches `lane_id is null`); the `on conflict do nothing` is
-- kept as a harmless second guard and to satisfy the literal table contract.
-- If DATABASE_SCHEMA.sql is ever migrated to `unique nulls not distinct
-- (archetype, lane_id, version)` (Postgres 15+), both guards keep working.

insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
select 'EQUIPMENT', null, 1, $equipment_schema$
{
  "type": "object",
  "x-archetype": "EQUIPMENT",
  "x-version": 1,
  "properties": {
    "model": { "type": "string", "x-label": { "es": "Modelo", "en": "Model" }, "x-order": 0 },
    "materialDescription": {
      "type": "string", "x-localized": true,
      "x-label": { "es": "Descripción del equipo", "en": "Equipment description" }, "x-order": 1
    },
    "hsCode": { "type": "string", "x-label": { "es": "Código HS", "en": "HS code" }, "x-order": 2 },
    "condition": {
      "type": "string", "enum": ["new", "refurbished", "used"],
      "x-enum-labels": {
        "new": { "es": "Nuevo", "en": "New" },
        "refurbished": { "es": "Reacondicionado", "en": "Refurbished" },
        "used": { "es": "Usado", "en": "Used" }
      },
      "x-label": { "es": "Condición", "en": "Condition" }, "x-order": 3
    },
    "weightKg": { "type": "number", "minimum": 0, "x-unit": "kg", "x-label": { "es": "Peso", "en": "Weight" }, "x-order": 4 },
    "dimensionsLwhM": { "type": "string", "x-label": { "es": "Dimensiones (L×A×A, m)", "en": "Dimensions (L×W×H, m)" }, "x-order": 5 },
    "powerRatingKw": { "type": "number", "minimum": 0, "x-unit": "kW", "x-label": { "es": "Potencia", "en": "Power rating" }, "x-order": 6 },
    "warrantyMonths": { "type": "integer", "minimum": 0, "x-unit": "meses / months", "x-label": { "es": "Garantía", "en": "Warranty" }, "x-order": 7 },
    "certifications": { "type": "array", "items": { "type": "string" }, "x-label": { "es": "Certificaciones", "en": "Certifications" }, "x-order": 8 },
    "commissioningIncluded": { "type": "boolean", "x-label": { "es": "Incluye puesta en marcha", "en": "Commissioning included" }, "x-order": 9 }
  },
  "required": ["model", "materialDescription", "hsCode", "condition"]
}
$equipment_schema$::jsonb
where not exists (
  select 1 from tower.spec_schemas where archetype = 'EQUIPMENT' and lane_id is null and version = 1
)
on conflict (archetype, lane_id, version) do nothing;

insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
select 'PROJECT', null, 1, $project_schema$
{
  "type": "object",
  "x-archetype": "PROJECT",
  "x-version": 1,
  "properties": {
    "discipline": {
      "type": "string", "enum": ["ffe", "lighting", "millwork", "textiles", "artwork"],
      "x-enum-labels": {
        "ffe": { "es": "FF&E", "en": "FF&E" },
        "lighting": { "es": "Iluminación", "en": "Lighting" },
        "millwork": { "es": "Carpintería", "en": "Millwork" },
        "textiles": { "es": "Textiles", "en": "Textiles" },
        "artwork": { "es": "Arte", "en": "Artwork" }
      },
      "x-label": { "es": "Disciplina", "en": "Discipline" }, "x-order": 0
    },
    "spaceType": {
      "type": "string", "enum": ["guestroom", "lobby", "restaurant", "spa", "back_of_house"],
      "x-enum-labels": {
        "guestroom": { "es": "Habitación", "en": "Guestroom" },
        "lobby": { "es": "Lobby", "en": "Lobby" },
        "restaurant": { "es": "Restaurante", "en": "Restaurant" },
        "spa": { "es": "Spa", "en": "Spa" },
        "back_of_house": { "es": "Área de servicio", "en": "Back of house" }
      },
      "x-label": { "es": "Tipo de espacio", "en": "Space type" }, "x-order": 1
    },
    "scopeSummary": {
      "type": "string", "x-localized": true,
      "x-label": { "es": "Resumen del alcance", "en": "Scope summary" }, "x-order": 2
    },
    "keyCount": { "type": "integer", "minimum": 0, "x-label": { "es": "Número de llaves", "en": "Key count" }, "x-order": 3 },
    "areaSqm": { "type": "number", "minimum": 0, "x-unit": "m²", "x-label": { "es": "Área", "en": "Area" }, "x-order": 4 },
    "finishGrade": {
      "type": "string", "enum": ["standard", "premium", "luxury"],
      "x-enum-labels": {
        "standard": { "es": "Estándar", "en": "Standard" },
        "premium": { "es": "Premium", "en": "Premium" },
        "luxury": { "es": "Lujo", "en": "Luxury" }
      },
      "x-label": { "es": "Nivel de acabado", "en": "Finish grade" }, "x-order": 5
    },
    "milestones": { "type": "array", "items": { "type": "string" }, "x-label": { "es": "Hitos", "en": "Milestones" }, "x-order": 6 },
    "installationRequired": { "type": "boolean", "x-label": { "es": "Requiere instalación", "en": "Installation required" }, "x-order": 7 }
  },
  "required": ["discipline", "spaceType", "scopeSummary"]
}
$project_schema$::jsonb
where not exists (
  select 1 from tower.spec_schemas where archetype = 'PROJECT' and lane_id is null and version = 1
)
on conflict (archetype, lane_id, version) do nothing;

insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
select 'COMMODITY', null, 1, $commodity_schema$
{
  "type": "object",
  "x-archetype": "COMMODITY",
  "x-version": 1,
  "properties": {
    "varietal": { "type": "string", "x-localized": true, "x-label": { "es": "Variedad", "en": "Varietal" }, "x-order": 0 },
    "grade": {
      "type": "string", "enum": ["export", "grade_a", "grade_b", "industrial"],
      "x-enum-labels": {
        "export": { "es": "Exportación", "en": "Export" },
        "grade_a": { "es": "Grado A", "en": "Grade A" },
        "grade_b": { "es": "Grado B", "en": "Grade B" },
        "industrial": { "es": "Industrial", "en": "Industrial" }
      },
      "x-label": { "es": "Grado", "en": "Grade" }, "x-order": 1
    },
    "harvestWindow": {
      "type": "string",
      "x-description": { "es": "ej. Jun–Sep", "en": "e.g. Jun–Sep" },
      "x-label": { "es": "Ventana de cosecha", "en": "Harvest window" }, "x-order": 2
    },
    "moisturePercent": { "type": "number", "minimum": 0, "maximum": 100, "x-unit": "%", "x-label": { "es": "Humedad", "en": "Moisture" }, "x-order": 3 },
    "densityKgM3": { "type": "number", "minimum": 0, "x-unit": "kg/m³", "x-label": { "es": "Densidad", "en": "Density" }, "x-order": 4 },
    "packaging": {
      "type": "string", "enum": ["bulk", "bag", "pallet", "container"],
      "x-enum-labels": {
        "bulk": { "es": "Granel", "en": "Bulk" },
        "bag": { "es": "Saco", "en": "Bag" },
        "pallet": { "es": "Pallet", "en": "Pallet" },
        "container": { "es": "Contenedor", "en": "Container" }
      },
      "x-label": { "es": "Empaque", "en": "Packaging" }, "x-order": 5
    },
    "certifications": { "type": "array", "items": { "type": "string" }, "x-label": { "es": "Certificaciones", "en": "Certifications" }, "x-order": 6 },
    "originRegion": { "type": "string", "x-localized": true, "x-label": { "es": "Región de origen", "en": "Origin region" }, "x-order": 7 }
  },
  "required": ["varietal", "grade"]
}
$commodity_schema$::jsonb
where not exists (
  select 1 from tower.spec_schemas where archetype = 'COMMODITY' and lane_id is null and version = 1
)
on conflict (archetype, lane_id, version) do nothing;

insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
select 'PROGRAM', null, 1, $program_schema$
{
  "type": "object",
  "x-archetype": "PROGRAM",
  "x-version": 1,
  "properties": {
    "assortmentName": { "type": "string", "x-localized": true, "x-label": { "es": "Nombre del surtido", "en": "Assortment name" }, "x-order": 0 },
    "skuCount": { "type": "integer", "minimum": 1, "x-label": { "es": "Número de SKU", "en": "SKU count" }, "x-order": 1 },
    "packagingUnit": { "type": "string", "x-label": { "es": "Unidad de empaque", "en": "Packaging unit" }, "x-order": 2 },
    "replenishmentCycleWeeks": { "type": "integer", "minimum": 0, "x-unit": "sem / wk", "x-label": { "es": "Ciclo de reposición", "en": "Replenishment cycle" }, "x-order": 3 },
    "cartonRunMin": { "type": "number", "minimum": 0, "x-label": { "es": "Tirada mínima de cartón", "en": "Minimum carton run" }, "x-order": 4 }
  },
  "required": ["assortmentName"]
}
$program_schema$::jsonb
where not exists (
  select 1 from tower.spec_schemas where archetype = 'PROGRAM' and lane_id is null and version = 1
)
on conflict (archetype, lane_id, version) do nothing;

insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
select 'CREDENTIAL', null, 1, $credential_schema$
{
  "type": "object",
  "x-archetype": "CREDENTIAL",
  "x-version": 1,
  "properties": {
    "territory": { "type": "string", "x-label": { "es": "Territorio", "en": "Territory" }, "x-order": 0 },
    "scopeSummary": { "type": "string", "x-localized": true, "x-label": { "es": "Resumen del alcance", "en": "Scope summary" }, "x-order": 1 },
    "mandateType": {
      "type": "string", "enum": ["exclusive", "non_exclusive"],
      "x-enum-labels": {
        "exclusive": { "es": "Exclusivo", "en": "Exclusive" },
        "non_exclusive": { "es": "No exclusivo", "en": "Non-exclusive" }
      },
      "x-label": { "es": "Tipo de mandato", "en": "Mandate type" }, "x-order": 2
    },
    "activationDate": {
      "type": "string",
      "x-description": { "es": "AAAA-MM-DD", "en": "YYYY-MM-DD" },
      "x-label": { "es": "Fecha de activación", "en": "Activation date" }, "x-order": 3
    }
  },
  "required": ["territory", "scopeSummary"]
}
$credential_schema$::jsonb
where not exists (
  select 1 from tower.spec_schemas where archetype = 'CREDENTIAL' and lane_id is null and version = 1
)
on conflict (archetype, lane_id, version) do nothing;

insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
select 'ORIGIN', null, 1, $origin_schema$
{
  "type": "object",
  "x-archetype": "ORIGIN",
  "x-version": 1,
  "properties": {
    "originCountry": { "type": "string", "x-label": { "es": "País de origen", "en": "Origin country" }, "x-order": 0 },
    "containerType": {
      "type": "string", "enum": ["20GP", "40GP", "40HC", "REEFER"],
      "x-enum-labels": {
        "20GP": { "es": "20GP", "en": "20GP" },
        "40GP": { "es": "40GP", "en": "40GP" },
        "40HC": { "es": "40HC", "en": "40HC" },
        "REEFER": { "es": "Refrigerado", "en": "Reefer" }
      },
      "x-label": { "es": "Tipo de contenedor", "en": "Container type" }, "x-order": 1
    },
    "certificateTypes": { "type": "array", "items": { "type": "string" }, "x-label": { "es": "Tipos de certificado", "en": "Certificate types" }, "x-order": 2 },
    "seasonalityWindow": {
      "type": "string",
      "x-description": { "es": "ej. Oct–Mar", "en": "e.g. Oct–Mar" },
      "x-label": { "es": "Ventana de estacionalidad", "en": "Seasonality window" }, "x-order": 3
    },
    "documentationNotes": { "type": "string", "x-localized": true, "x-label": { "es": "Notas de documentación", "en": "Documentation notes" }, "x-order": 4 }
  },
  "required": ["originCountry"]
}
$origin_schema$::jsonb
where not exists (
  select 1 from tower.spec_schemas where archetype = 'ORIGIN' and lane_id is null and version = 1
)
on conflict (archetype, lane_id, version) do nothing;

-- ALLOCATION (7th archetype, root §5-bis) — represented brands (RB/xx). R1:
-- presentation-only spec (geometry lives in rb_diagram_specs). lane_id = null,
-- no lane override. Kept identical to specFieldsToJsonSchema(ALLOCATION_SPEC_FIELDS).
insert into tower.spec_schemas (archetype, lane_id, version, json_schema)
select 'ALLOCATION', null, 1, $allocation_schema$
{
  "type": "object",
  "x-archetype": "ALLOCATION",
  "x-version": 1,
  "properties": {
    "unitLabel": { "type": "string", "x-localized": true, "x-label": { "es": "Etiqueta de unidad", "en": "Unit label" }, "x-order": 0 },
    "description": { "type": "string", "x-localized": true, "x-label": { "es": "Descripción", "en": "Description" }, "x-order": 1 },
    "highlights": { "type": "array", "items": { "type": "string" }, "x-label": { "es": "Destacados", "en": "Highlights" }, "x-order": 2 }
  },
  "required": ["unitLabel", "description"]
}
$allocation_schema$::jsonb
where not exists (
  select 1 from tower.spec_schemas where archetype = 'ALLOCATION' and lane_id is null and version = 1
)
on conflict (archetype, lane_id, version) do nothing;
