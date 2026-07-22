// src/lib/schemas/spec/to-json-schema.ts
// The two projections of a `SpecFieldDef[]` list: a real Zod object (server-side
// validation of `products.specs` payloads) and the JSON-Schema wire format
// (`tower.spec_schemas.json_schema`, ADR-3) that SpecForm/SpecView render from.
import { z } from 'zod'
import type { Archetype } from '@/lib/archetypes'
import type { Localized } from '@/lib/i18n'
import { SPEC_ROW_ICONS, type EnumOption, type SpecFieldDef } from './fields'
import type { JsonSchema, JsonSchemaProperty } from './types'

function applyRequired<T extends z.ZodTypeAny>(schema: T, required?: boolean) {
  return required ? schema : schema.optional()
}

function labelMap(options: EnumOption[]): Record<string, Localized> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]))
}

/** Builds the real Zod validator for one field def — used by server actions to validate `products.specs`. */
export function fieldToZod(field: SpecFieldDef): z.ZodTypeAny {
  switch (field.kind) {
    case 'string':
      return applyRequired(z.string(), field.required)
    case 'localizedString': {
      const base = z.object({ es: z.string().min(1), en: z.string().min(1) })
      return applyRequired(field.required ? base : base.partial(), field.required)
    }
    case 'number': {
      let base = z.number()
      if (field.min !== undefined) base = base.min(field.min)
      if (field.max !== undefined) base = base.max(field.max)
      return applyRequired(base, field.required)
    }
    case 'integer': {
      let base = z.number().int()
      if (field.min !== undefined) base = base.min(field.min)
      if (field.max !== undefined) base = base.max(field.max)
      return applyRequired(base, field.required)
    }
    case 'boolean':
      return applyRequired(z.boolean(), field.required)
    case 'enum': {
      const values = field.options.map((o) => o.value) as [string, ...string[]]
      return applyRequired(z.enum(values), field.required)
    }
    case 'array': {
      const item = field.items.type === 'number' ? z.number() : z.string()
      return applyRequired(z.array(item), field.required)
    }
    case 'specRows': {
      const row = z.object({
        label: z.string(),
        value: z.string(),
        icon: z.enum([...SPEC_ROW_ICONS] as [string, ...string[]]).optional(),
      })
      return applyRequired(z.array(row), field.required)
    }
  }
}

/** Builds the real Zod object schema for an archetype's whole spec payload. */
export function specFieldsToZodObject(fields: SpecFieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const field of fields) shape[field.key] = fieldToZod(field)
  return z.object(shape)
}

function fieldToJsonSchemaProperty(field: SpecFieldDef, order: number): JsonSchemaProperty {
  const common = {
    'x-label': field.label,
    'x-order': order,
    ...(field.description ? { 'x-description': field.description } : {}),
  }

  switch (field.kind) {
    case 'string':
      return {
        type: 'string',
        ...common,
        ...(field.multiline ? { 'x-multiline': true } : {}),
      }
    case 'localizedString':
      return { type: 'string', 'x-localized': true, ...common }
    case 'number':
    case 'integer':
      return {
        type: field.kind,
        ...common,
        ...(field.min !== undefined ? { minimum: field.min } : {}),
        ...(field.max !== undefined ? { maximum: field.max } : {}),
        ...(field.unit ? { 'x-unit': field.unit } : {}),
      }
    case 'boolean':
      return { type: 'boolean', ...common }
    case 'enum':
      return {
        type: 'string',
        enum: field.options.map((o) => o.value),
        'x-enum-labels': labelMap(field.options),
        ...common,
      }
    case 'array':
      return {
        type: 'array',
        items:
          field.items.type === 'number'
            ? { type: 'number' }
            : {
                type: 'string',
                ...(field.items.options
                  ? {
                      enum: field.items.options.map((o) => o.value),
                      'x-enum-labels': labelMap(field.items.options),
                    }
                  : {}),
              },
        ...common,
      }
    case 'specRows':
      return {
        type: 'array',
        'x-spec-rows': true,
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            value: { type: 'string' },
            icon: { type: 'string', enum: [...SPEC_ROW_ICONS] },
          },
          required: ['label', 'value'],
        },
        ...common,
      }
  }
}

/** Builds the JSON-Schema wire format for an archetype's spec. */
export function specFieldsToJsonSchema(
  archetype: Archetype,
  version: number,
  fields: SpecFieldDef[],
): JsonSchema {
  const properties: Record<string, JsonSchemaProperty> = {}
  const required: string[] = []

  fields.forEach((field, index) => {
    properties[field.key] = fieldToJsonSchemaProperty(field, index)
    if (field.required) required.push(field.key)
  })

  return { type: 'object', 'x-archetype': archetype, 'x-version': version, properties, required }
}
