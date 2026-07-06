// src/components/catalog/spec-form/validate.ts
// Lightweight inline validation against a SpecForm JSON-Schema. Not a general
// JSON-Schema validator (ajv is not installed and this workspace must not add a
// dependency) — it validates exactly the vendor-extended subset ./types.ts
// defines and that ./to-json-schema.ts ever produces.
import { DEFAULT_LOCALE, t, type Locale } from '../../../lib/i18n'
import type { JsonSchema, JsonSchemaProperty } from '../../../lib/schemas/spec'

export type FieldErrors = Record<string, string>

function isEmpty(value: unknown, prop: JsonSchemaProperty): boolean {
  if (prop['x-localized']) {
    const pair = value as { es?: string; en?: string } | undefined
    return !pair || !pair.es || !pair.en
  }
  if (prop.type === 'array') return !Array.isArray(value) || value.length === 0
  if (prop.type === 'boolean') return false
  return value === undefined || value === null || value === ''
}

export function validateSpecValue(
  schema: JsonSchema,
  value: Record<string, unknown>,
  locale: Locale = DEFAULT_LOCALE,
): FieldErrors {
  const errors: FieldErrors = {}

  for (const [key, prop] of Object.entries(schema.properties)) {
    const fieldValue = value[key]
    const required = schema.required.includes(key)

    if (required && isEmpty(fieldValue, prop)) {
      errors[key] = t({ es: 'Campo requerido', en: 'Required field' }, locale)
      continue
    }
    if (isEmpty(fieldValue, prop)) continue // optional + empty: nothing further to check

    if (prop.type === 'number' || prop.type === 'integer') {
      const num = Number(fieldValue)
      if (Number.isNaN(num)) {
        errors[key] = t({ es: 'Debe ser un número', en: 'Must be a number' }, locale)
        continue
      }
      if (prop.type === 'integer' && !Number.isInteger(num)) {
        errors[key] = t({ es: 'Debe ser un entero', en: 'Must be a whole number' }, locale)
        continue
      }
      if (prop.minimum !== undefined && num < prop.minimum) {
        errors[key] = t({ es: `Mínimo ${prop.minimum}`, en: `Minimum ${prop.minimum}` }, locale)
        continue
      }
      if (prop.maximum !== undefined && num > prop.maximum) {
        errors[key] = t({ es: `Máximo ${prop.maximum}`, en: `Maximum ${prop.maximum}` }, locale)
        continue
      }
    }

    if (prop.enum && !prop['x-localized'] && typeof fieldValue === 'string' && !prop.enum.includes(fieldValue)) {
      errors[key] = t({ es: 'Valor no válido', en: 'Invalid value' }, locale)
    }
  }

  return errors
}
