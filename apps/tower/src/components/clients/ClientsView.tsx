'use client'

import { useMemo, useState } from 'react'
import { t, type Locale } from '@/lib/i18n'
import {
  moveClientStage,
  type ClientBrandOption,
  type ClientOwnerOption,
} from '@/lib/actions/clients'
import type { ClientListItem, ClientStage } from '@/lib/actions/clients-logic'
import type { ClientExtractDraft } from '@/lib/crm/whatsapp'
import { ClientForm, initialFromClient, type ClientFormInitial } from './ClientForm'
import { ClientList } from './ClientList'
import { ClientBoard } from './ClientBoard'
import { WhatsappImport } from './WhatsappImport'

const TAG = 'CLI · Clientes'
const TITLE = { es: 'Clientes', en: 'Clients' }

type Panel = { initial: ClientFormInitial; aiFilled?: Set<string> } | null

/** A WhatsApp-extracted draft → the form's starting values (source pinned to
 *  WhatsApp; summary → notes). The operator picks the brand and reviews before saving. */
function draftToInitial(d: ClientExtractDraft): ClientFormInitial {
  return {
    name: d.name ?? '',
    source: 'whatsapp',
    country: d.country ?? '',
    city: d.city ?? '',
    archetype: d.archetype ?? '',
    category: d.category ?? '',
    demand: d.demand ?? '',
    currency: d.currency ?? 'USD',
    notes: d.summary ?? '',
    contactName: d.contactName ?? '',
    contactWhatsapp: d.contactWhatsapp ?? '',
    contactRole: d.contactRole ?? '',
  }
}

/** Which form fields the extraction populated — for the "IA" badges + the
 *  still-to-complete banner. `source` is always set (pinned to WhatsApp). */
function aiFilledFromDraft(d: ClientExtractDraft): Set<string> {
  const s = new Set<string>(['source'])
  const add = (k: string, v: unknown) => {
    if (v) s.add(k)
  }
  add('name', d.name)
  add('country', d.country)
  add('city', d.city)
  add('archetype', d.archetype)
  add('category', d.category)
  add('demand', d.demand)
  add('currency', d.currency)
  add('notes', d.summary)
  add('contactName', d.contactName)
  add('contactWhatsapp', d.contactWhatsapp)
  add('contactRole', d.contactRole)
  return s
}

/**
 * The Clients CRM shell — owns the live item list so create/edit/move update in
 * place. Two views (Lista · Tablero/pipeline); a create/edit panel over the
 * shared ClientForm; optimistic stage moves persisted by moveClientStage.
 */
export function ClientsView({
  initialItems,
  brands,
  roster,
  owners,
  locale,
}: {
  initialItems: ClientListItem[]
  brands: ClientBrandOption[]
  roster: ClientOwnerOption[]
  owners: Record<string, string>
  locale: Locale
}) {
  const [items, setItems] = useState<ClientListItem[]>(initialItems)
  const [view, setView] = useState<'list' | 'board'>('list')
  const [panel, setPanel] = useState<Panel>(null)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const byName = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items])

  function upsert(item: ClientListItem) {
    setItems((xs) => {
      const exists = xs.some((c) => c.id === item.id)
      return exists ? xs.map((c) => (c.id === item.id ? item : c)) : [...xs, item]
    })
    setPanel(null)
  }

  function onMove(id: string, stage: ClientStage) {
    setError(null)
    const prev = items
    setItems((xs) => xs.map((c) => (c.id === id ? { ...c, stage } : c)))
    void moveClientStage({ id, stage }).then((res) => {
      if (res.error) {
        setItems(prev)
        setError(res.error.message)
      }
    })
  }

  const toolBtn = (active: boolean) =>
    `rounded-control px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] ${
      active ? 'bg-accent text-surface-0' : 'border border-line text-ink-secondary hover:text-ink-primary'
    }`

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent" data-numeric>
          {TAG}
        </span>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-t3 text-ink-primary">{t(TITLE, locale)}</h1>
          <span className="font-mono text-label text-ink-secondary" data-numeric>
            {items.length}
          </span>
        </div>
        <p className="max-w-prose text-t0 text-ink-secondary">
          {t(
            {
              es: 'Los clientes de tus marcas: origen, qué compran, etapa y contacto. Créalos aquí o al cotizar con Mister; viven en un solo lugar.',
              en: 'Your brands’ clients: origin, what they buy, stage and contact. Create them here or while quoting with Mister; they live in one place.',
            },
            locale,
          )}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <button type="button" className={toolBtn(view === 'list')} onClick={() => setView('list')}>
              {t({ es: 'Lista', en: 'List' }, locale)}
            </button>
            <button type="button" className={toolBtn(view === 'board')} onClick={() => setView('board')}>
              {t({ es: 'Tablero', en: 'Board' }, locale)}
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setImporting(true)
                setPanel(null)
              }}
              className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary hover:border-lane-accent"
            >
              {t({ es: 'Importar WhatsApp', en: 'Import WhatsApp' }, locale)}
            </button>
            <button
              type="button"
              onClick={() => {
                setPanel({ initial: {} })
                setImporting(false)
              }}
              className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
            >
              {t({ es: '+ Nuevo cliente', en: '+ New client' }, locale)}
            </button>
          </div>
        </div>
      </header>

      {importing ? (
        <WhatsappImport
          locale={locale}
          onCancel={() => setImporting(false)}
          onDraft={(d) => {
            setImporting(false)
            setPanel({ initial: draftToInitial(d), aiFilled: aiFilledFromDraft(d) })
          }}
        />
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      {panel ? (
        <div className="rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-2">
          <span className="mb-3 block font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
            {panel.initial.id
              ? t({ es: 'Editar cliente', en: 'Edit client' }, locale)
              : panel.aiFilled
                ? t({ es: 'Revisar perfil de WhatsApp', en: 'Review WhatsApp profile' }, locale)
                : t({ es: 'Nuevo cliente', en: 'New client' }, locale)}
          </span>
          <ClientForm
            locale={locale}
            brands={brands}
            roster={roster}
            initial={panel.initial}
            aiFilled={panel.aiFilled}
            onDone={upsert}
            onCancel={() => setPanel(null)}
          />
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-card border border-line-hairline bg-surface-1 p-8 text-center text-t0 text-ink-secondary">
          {t(
            {
              es: 'Todavía no hay clientes. Crea el primero aquí o al armar una cotización con Mister.',
              en: 'No clients yet. Create the first one here or while building a quote with Mister.',
            },
            locale,
          )}
        </div>
      ) : view === 'list' ? (
        <ClientList items={byName} locale={locale} owners={owners} onEdit={(c) => setPanel({ initial: initialFromClient(c) })} />
      ) : (
        <ClientBoard
          items={items}
          locale={locale}
          onEdit={(c) => setPanel({ initial: initialFromClient(c) })}
          onMove={onMove}
        />
      )}
    </div>
  )
}
