// src/components/catalog/spec-form/fields.tsx
// Field-level renderers for SpecForm, one per JsonSchemaProperty shape. Styled
// with TOWER control-room tokens only (DESIGN_SYSTEM.md) — no raw hex/px, no
// @wings/trade-ui primitives (those are baked to the public site's brand
// tokens — gold/navy/rounded-wings — which is the wrong livery for TOWER).
'use client'

// Explicit default import (not just the named hooks): this workspace's vitest
// has no @vitejs/plugin-react configured, so under test the JSX transform
// falls back to the classic runtime (`React.createElement`), which needs
// `React` in scope even though Next.js's own SWC build never requires it.
import React, { useId, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '../../../lib/i18n'
import { isScalarArrayItems, type JsonSchemaProperty } from '../../../lib/schemas/spec'
import { normalizeLocalizedPair, updateLocalizedPair } from './state'

const inputBase =
  'h-row w-full rounded-card border border-line bg-surface-1 px-3 font-ui text-t1 text-ink-primary outline-none transition-colors placeholder:text-ink-secondary focus:border-lane-accent disabled:opacity-50'

const labelBase = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'

export function FieldShell({
  htmlFor,
  label,
  unit,
  description,
  error,
  required,
  children,
}: {
  htmlFor: string
  label: string
  unit?: string
  description?: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line pb-4">
      <label htmlFor={htmlFor} className={labelBase}>
        {label}
        {required ? (
          <span aria-hidden className="text-negative">
            {' '}
            *
          </span>
        ) : null}
        {unit ? <span className="ml-2 normal-case text-ink-secondary">({unit})</span> : null}
      </label>
      {children}
      {description ? <p className="font-ui text-t0 text-ink-secondary">{description}</p> : null}
      {error ? (
        <p role="alert" className="font-mono text-t0 text-negative">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface FieldProps {
  fieldKey: string
  prop: JsonSchemaProperty
  value: unknown
  onChange: (next: unknown) => void
  locale: Locale
  disabled: boolean
  error?: string
  required: boolean
}

export function StringField({ fieldKey, prop, value, onChange, locale, disabled, error, required }: FieldProps) {
  const id = useId()
  const label = t(prop['x-label'], locale)
  const shared = {
    id,
    name: fieldKey,
    disabled,
    required,
    value: (value as string) ?? '',
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: cn(inputBase, prop['x-multiline'] && 'h-auto min-h-row py-2'),
    'aria-invalid': Boolean(error),
  }
  return (
    <FieldShell
      htmlFor={id}
      label={label}
      unit={prop['x-unit']}
      description={prop['x-description'] ? t(prop['x-description'], locale) : undefined}
      error={error}
      required={required}
    >
      {prop['x-multiline'] ? <textarea {...shared} /> : <input type="text" {...shared} />}
    </FieldShell>
  )
}

export function NumberField({ fieldKey, prop, value, onChange, locale, disabled, error, required }: FieldProps) {
  const id = useId()
  return (
    <FieldShell
      htmlFor={id}
      label={t(prop['x-label'], locale)}
      unit={prop['x-unit']}
      description={prop['x-description'] ? t(prop['x-description'], locale) : undefined}
      error={error}
      required={required}
    >
      <input
        id={id}
        name={fieldKey}
        type="number"
        disabled={disabled}
        required={required}
        min={prop.minimum}
        max={prop.maximum}
        step={prop.type === 'integer' ? 1 : 'any'}
        data-numeric
        value={value === undefined || value === null ? '' : String(value)}
        onChange={(e) => {
          const raw = e.target.value
          onChange(raw === '' ? undefined : Number(raw))
        }}
        className={cn(inputBase, 'font-mono')}
        aria-invalid={Boolean(error)}
      />
    </FieldShell>
  )
}

export function BooleanField({ fieldKey, prop, value, onChange, locale, disabled, error, required }: FieldProps) {
  const id = useId()
  return (
    <FieldShell htmlFor={id} label={t(prop['x-label'], locale)} error={error} required={required}>
      <label htmlFor={id} className="flex w-fit items-center gap-2">
        <input
          id={id}
          name={fieldKey}
          type="checkbox"
          disabled={disabled}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded-card border border-line bg-surface-1 accent-[color:var(--lane-accent)]"
        />
        <span className="font-ui text-t1 text-ink-primary">
          {value ? t({ es: 'Sí', en: 'Yes' }, locale) : t({ es: 'No', en: 'No' }, locale)}
        </span>
      </label>
    </FieldShell>
  )
}

export function EnumField({ fieldKey, prop, value, onChange, locale, disabled, error, required }: FieldProps) {
  const id = useId()
  const options = prop.enum ?? []
  const labels = prop['x-enum-labels'] ?? {}
  return (
    <FieldShell htmlFor={id} label={t(prop['x-label'], locale)} error={error} required={required}>
      <select
        id={id}
        name={fieldKey}
        disabled={disabled}
        required={required}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={inputBase}
        aria-invalid={Boolean(error)}
      >
        <option value="">{t({ es: '— Selecciona —', en: '— Select —' }, locale)}</option>
        {options.map((optionValue) => (
          <option key={optionValue} value={optionValue}>
            {labels[optionValue] ? t(labels[optionValue], locale) : optionValue}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

export function ArrayField({ fieldKey, prop, value, onChange, locale, disabled, error, required }: FieldProps) {
  const id = useId()
  const [draft, setDraft] = useState('')
  const items = Array.isArray(value) ? (value as (string | number)[]) : []
  // Scalar-array field only — `specRows` (object items) is routed to SpecRowsField
  // upstream, so narrowing to the scalar items shape here is total and safe.
  const scalarItems = isScalarArrayItems(prop.items) ? prop.items : undefined
  const isNumeric = scalarItems?.type === 'number'
  const enumOptions = scalarItems?.enum

  function addItem(raw: string) {
    const next = isNumeric ? Number(raw) : raw
    if (raw.trim() === '' || (isNumeric && Number.isNaN(next))) return
    if (items.includes(next)) return
    onChange([...items, next])
    setDraft('')
  }

  function removeItem(item: string | number) {
    onChange(items.filter((existing) => existing !== item))
  }

  return (
    <FieldShell
      htmlFor={id}
      label={t(prop['x-label'], locale)}
      description={prop['x-description'] ? t(prop['x-description'], locale) : undefined}
      error={error}
      required={required}
    >
      {enumOptions ? (
        <div className="flex flex-wrap gap-3">
          {enumOptions.map((optionValue) => {
            const labels = scalarItems?.['x-enum-labels'] ?? {}
            const checked = items.includes(optionValue)
            return (
              <label key={optionValue} className="flex items-center gap-1.5 font-ui text-t0 text-ink-primary">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={checked}
                  onChange={() => onChange(checked ? items.filter((v) => v !== optionValue) : [...items, optionValue])}
                  className="h-4 w-4 rounded-card border border-line bg-surface-1 accent-[color:var(--lane-accent)]"
                />
                {labels[optionValue] ? t(labels[optionValue], locale) : optionValue}
              </label>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={String(item)}
                className="flex items-center gap-1.5 rounded-card border border-line bg-surface-1 px-2 py-1 font-mono text-t0 text-ink-primary"
              >
                {item}
                {!disabled && (
                  <button
                    type="button"
                    aria-label={t({ es: 'Quitar', en: 'Remove' }, locale)}
                    onClick={() => removeItem(item)}
                    className="text-ink-secondary hover:text-negative"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          <input
            id={id}
            name={fieldKey}
            type={isNumeric ? 'number' : 'text'}
            disabled={disabled}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addItem(draft)
              }
            }}
            placeholder={t({ es: 'Añadir y presionar Enter', en: 'Add and press Enter' }, locale)}
            className={inputBase}
            aria-invalid={Boolean(error)}
          />
        </div>
      )}
    </FieldShell>
  )
}

interface SpecRow {
  label: string
  value: string
  icon?: string
}

/**
 * Editor for the `specRows` object-array kind: `{ label, value, icon? }` rows the
 * scalar ArrayField cannot express. Add / edit / remove rows; the optional icon
 * is chosen from the bounded set the schema publishes (prop.items.properties.icon.enum).
 * TOWER control-room tokens only — no raw hex/px.
 */
export function SpecRowsField({ fieldKey, prop, value, onChange, locale, disabled, error, required }: FieldProps) {
  const id = useId()
  const rows: SpecRow[] = Array.isArray(value) ? (value as SpecRow[]) : []
  const objectItems = prop.items && prop.items.type === 'object' ? prop.items : undefined
  const iconOptions = objectItems?.properties.icon?.enum ?? []

  function patchRow(index: number, patch: Partial<SpecRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }
  function addRow() {
    onChange([...rows, { label: '', value: '' }])
  }
  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }

  return (
    <FieldShell
      htmlFor={id}
      label={t(prop['x-label'], locale)}
      description={prop['x-description'] ? t(prop['x-description'], locale) : undefined}
      error={error}
      required={required}
    >
      <div className="flex flex-col gap-2" data-spec-rows>
        {rows.map((row, index) => (
          <div key={index} className="flex items-start gap-2">
            {iconOptions.length > 0 ? (
              <select
                aria-label={t({ es: 'Ícono', en: 'Icon' }, locale)}
                disabled={disabled}
                value={row.icon ?? ''}
                onChange={(e) => patchRow(index, { icon: e.target.value || undefined })}
                className={cn(inputBase, 'w-28 shrink-0')}
              >
                <option value="">{t({ es: '— sin ícono —', en: '— no icon —' }, locale)}</option>
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            ) : null}
            <input
              type="text"
              aria-label={t({ es: 'Etiqueta', en: 'Label' }, locale)}
              disabled={disabled}
              value={row.label}
              onChange={(e) => patchRow(index, { label: e.target.value })}
              placeholder={t({ es: 'Etiqueta', en: 'Label' }, locale)}
              className={inputBase}
            />
            <input
              type="text"
              aria-label={t({ es: 'Valor', en: 'Value' }, locale)}
              disabled={disabled}
              value={row.value}
              onChange={(e) => patchRow(index, { value: e.target.value })}
              placeholder={t({ es: 'Valor', en: 'Value' }, locale)}
              className={cn(inputBase, 'font-mono')}
            />
            {!disabled && (
              <button
                type="button"
                aria-label={t({ es: 'Quitar fila', en: 'Remove row' }, locale)}
                onClick={() => removeRow(index)}
                className="mt-2 shrink-0 text-ink-secondary hover:text-negative"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {!disabled && (
          <button
            type="button"
            onClick={addRow}
            className="w-fit rounded-card border border-line px-2.5 py-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent hover:text-lane-accent"
          >
            {t({ es: 'Añadir fila', en: 'Add row' }, locale)}
          </button>
        )}
      </div>
    </FieldShell>
  )
}

export function LocalizedStringField({
  fieldKey,
  prop,
  value,
  onChange,
  locale,
  disabled,
  error,
  required,
}: FieldProps) {
  const id = useId()
  const [activeTab, setActiveTab] = useState<Locale>(locale)
  const pair = normalizeLocalizedPair(value)
  const multiline = prop['x-multiline']

  const tabs: { locale: Locale; label: Localized }[] = [
    { locale: 'es', label: { es: 'ES', en: 'ES' } },
    { locale: 'en', label: { es: 'EN', en: 'EN' } },
  ]

  return (
    <FieldShell
      htmlFor={id}
      label={t(prop['x-label'], locale)}
      description={prop['x-description'] ? t(prop['x-description'], locale) : undefined}
      error={error}
      required={required}
    >
      <div className="flex flex-col gap-2">
        <div role="tablist" aria-label={t({ es: 'Idioma', en: 'Language' }, locale)} className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = tab.locale === activeTab
            const isFilled = pair[tab.locale].length > 0
            return (
              <button
                key={tab.locale}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.locale)}
                className={cn(
                  'rounded-card border px-2.5 py-1 font-mono text-label uppercase tracking-[0.08em]',
                  isActive
                    ? 'border-lane-accent text-lane-accent'
                    : 'border-line text-ink-secondary hover:text-ink-primary',
                )}
              >
                {tab.label[locale]}
                {!isFilled && required ? <span className="text-negative"> *</span> : null}
              </button>
            )
          })}
        </div>
        {multiline ? (
          <textarea
            id={id}
            name={`${fieldKey}.${activeTab}`}
            disabled={disabled}
            required={required}
            value={pair[activeTab]}
            onChange={(e) => onChange(updateLocalizedPair(pair, activeTab, e.target.value))}
            className={cn(inputBase, 'h-auto min-h-row py-2')}
            aria-invalid={Boolean(error)}
          />
        ) : (
          <input
            id={id}
            name={`${fieldKey}.${activeTab}`}
            type="text"
            disabled={disabled}
            required={required}
            value={pair[activeTab]}
            onChange={(e) => onChange(updateLocalizedPair(pair, activeTab, e.target.value))}
            className={inputBase}
            aria-invalid={Boolean(error)}
          />
        )}
      </div>
    </FieldShell>
  )
}
