'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { ModuleId } from '@/lib/nav'
import {
  ADMIN_ACTIONS,
  ADMIN_DESTINATIONS,
  EVERYONE_ACTIONS,
  LOCAL_ACTIONS,
  SELF_DESTINATIONS,
  TOOLS,
  type LocalActionId,
} from '@/shell/navigation/registry'
import { useRecordSearch } from '@/shell/navigation/useRecordSearch'
import { readRecents, type RecentEntry } from '@/shell/navigation/recents'

// ⌘K destinations + actions live in the shell navigation registry (the one
// source of truth — TOWER-REDESIGN §5). The palette renders entirely from the
// registry so it can never drift from the rail. P6 adds two live layers on top:
// RECORD search (existing endpoints only) and RECENTS (localStorage).

// Shared class strings — kept identical across every group so a new group can
// never render subtly differently from the module list.
const HEADING =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-ink-secondary'
const ITEM =
  'flex cursor-pointer items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-primary aria-selected:bg-surface-0'
const TAG = 'font-mono text-label tracking-[0.1em] text-lane-accent'

/** Debounce a fast-changing value (the search box) into a slower one that gates
 *  the record query — no request per keystroke. */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}

/**
 * ⌘K CommandPalette (COMPONENT_TREE) — Linear-grade jump + search + actions.
 * Modules and admin destinations come from the registry; P6 adds record search
 * (Products, via the existing `listProducts` action — no new search infra) and a
 * Recents group. Admin rows gate on group-admin. cmdk gives full keyboard nav.
 */
export function CommandPalette({
  open,
  onOpenChange,
  isGroupAdmin = false,
  visible,
  locale = DEFAULT_LOCALE,
  onToggleTheme,
  onToggleDock,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isGroupAdmin?: boolean
  /** Same permission-derived module set the rail uses (lib/rbac). The palette
   *  and the rail MUST agree — jumping to a module the rail hides lands the
   *  operator on an RLS-empty page. Omitted → show all (safe legacy default). */
  visible?: Set<ModuleId>
  locale?: Locale
  /** Shell callbacks for the two client-only actions (no href). Absent → the
   *  action is not rendered (no dead affordance). */
  onToggleTheme?: () => void
  onToggleDock?: () => void
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  // Record search runs off the debounced, trimmed term; the module/action fuzzy
  // match stays on the live input (cmdk's own filter).
  const term = useDebounced(search.trim(), 250)

  // Read the canonical TOOLS directly (typed TowerTool, so keywords are available
  // for search); still filtered by the rail's rbac `visible` set so the two agree.
  const modules = visible ? TOOLS.filter((m) => visible.has(m.id)) : TOOLS
  const { hits, isFetching } = useRecordSearch(term, visible)

  // Recents: read from localStorage each time the palette opens; reset the query
  // when it closes so it reopens clean. rbac-gated on read.
  const [recents, setRecents] = useState<RecentEntry[]>([])
  useEffect(() => {
    if (open) setRecents(readRecents())
    else setSearch('')
  }, [open])
  const visibleRecents = useMemo(
    () => recents.filter((r) => !visible || visible.has(r.moduleId)),
    [recents, visible],
  )

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  // Two client-only actions — render only when their handler is threaded in.
  const localActions = LOCAL_ACTIONS.filter((a) =>
    a.id === 'toggle-theme' ? !!onToggleTheme : a.id === 'toggle-dock' ? !!onToggleDock : false,
  )
  const runLocal = (id: LocalActionId) => {
    onOpenChange(false)
    if (id === 'toggle-theme') onToggleTheme?.()
    else if (id === 'toggle-dock') onToggleDock?.()
  }

  const query = search.trim()
  const canSearchRecords = !visible || visible.has('catalog')
  const showRecents = query === '' && visibleRecents.length > 0
  const showRecords = term.length >= 2 && hits.length > 0
  // Records are still resolving while the debounce hasn't caught up to the live
  // input OR the query is in flight. Suppress the "Sin resultados" empty state
  // during that window so it never asserts emptiness before the search settles
  // (review F-P6-1 — "nothing resolves to results" is as dishonest as a spinner
  // that resolves to nothing).
  const recordsPending = query.length >= 2 && canSearchRecords && (term !== query || isFetching)

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label={t({ es: 'Comandos', en: 'Commands' }, locale)}
      overlayClassName="fixed inset-0 z-40 bg-black/60"
      // Mobile: a full-width sheet pinned to the top, where the search input sits
      // right under the status bar and the list fills the space above the
      // keyboard — no floating centered dialog stranding a dead gap over the
      // keyboard. md+: the centered Linear-style dialog.
      contentClassName="tower-fade fixed inset-x-0 top-0 z-50 w-full border-b border-line bg-surface-1 shadow-none md:inset-x-auto md:left-1/2 md:top-[12%] md:w-[92vw] md:max-w-xl md:-translate-x-1/2 md:rounded-card md:border"
    >
      <Command.Input
        autoFocus
        value={search}
        onValueChange={setSearch}
        placeholder={t({ es: 'Buscar módulos, registros y acciones…', en: 'Search modules, records and actions…' }, locale)}
        className="w-full border-b border-line bg-transparent px-4 py-3 font-ui text-t1 text-ink-primary outline-none placeholder:text-ink-secondary"
      />
      <Command.List className="max-h-[70dvh] overflow-y-auto overscroll-contain p-2 md:max-h-80">
        {recordsPending ? null : (
          <Command.Empty className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
            {t({ es: 'Sin resultados', en: 'No results' }, locale)}
          </Command.Empty>
        )}

        {showRecents ? (
          <Command.Group heading={t({ es: 'Recientes', en: 'Recent' }, locale)} className={HEADING}>
            {visibleRecents.map((r) => (
              <Command.Item key={r.href} value={`reciente recent ${r.label} ${r.href}`} onSelect={() => go(r.href)} className={ITEM}>
                <span aria-hidden className={TAG}>
                  {r.tag}
                </span>
                {r.label}
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}

        <Command.Group heading={t({ es: 'Módulos', en: 'Modules' }, locale)} className={HEADING}>
          {modules.map((m) => (
            <Command.Item
              key={m.id}
              value={`${t(m.label, locale)} ${m.id} ${m.tag} ${m.keywords.join(' ')}`}
              onSelect={() => go(m.href)}
              className={ITEM}
            >
              <span aria-hidden className={TAG}>
                {m.tag}
              </span>
              {t(m.label, locale)}
            </Command.Item>
          ))}
          {SELF_DESTINATIONS.filter((d) => !d.adminOnly || isGroupAdmin).map((d) => (
            <Command.Item
              key={d.href}
              value={`${t(d.label, locale)} ${d.tag} ${d.keywords.join(' ')}`}
              onSelect={() => go(d.href)}
              className={ITEM}
            >
              <span aria-hidden className={TAG}>
                {d.tag}
              </span>
              {t(d.label, locale)}
            </Command.Item>
          ))}
        </Command.Group>

        {showRecords ? (
          <Command.Group heading={t({ es: 'Registros', en: 'Records' }, locale)} className={HEADING}>
            {hits.map((h) => (
              // Seed the value with the raw query so cmdk's own filter never drops
              // a row the server already matched.
              <Command.Item key={h.key} value={`${search} ${t(h.label, locale)} ${h.key}`} onSelect={() => go(h.href)} className={ITEM}>
                <span aria-hidden className={TAG}>
                  {h.tag}
                </span>
                {t(h.label, locale)}
              </Command.Item>
            ))}
          </Command.Group>
        ) : recordsPending ? (
          <div className="px-3 py-4 text-center font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
            {t({ es: 'Buscando registros…', en: 'Searching records…' }, locale)}
          </div>
        ) : null}

        <Command.Group heading={t({ es: 'Acciones', en: 'Actions' }, locale)} className={HEADING}>
          {EVERYONE_ACTIONS.filter((a) => !a.adminOnly || isGroupAdmin).map((a) => (
            <Command.Item
              key={a.id}
              value={`${t(a.label, locale)} ${a.keywords.join(' ')}`}
              onSelect={a.href ? () => go(a.href!) : undefined}
              className={ITEM}
            >
              {t(a.label, locale)}
            </Command.Item>
          ))}
          {localActions.map((a) => (
            <Command.Item
              key={a.id}
              value={`${t(a.label, locale)} ${a.keywords.join(' ')}`}
              onSelect={() => runLocal(a.id)}
              className={ITEM}
            >
              {t(a.label, locale)}
            </Command.Item>
          ))}
          {isGroupAdmin
            ? ADMIN_ACTIONS.map((a) => (
                <Command.Item
                  key={a.id}
                  value={`admin ${t(a.label, locale)} ${a.keywords.join(' ')}`}
                  onSelect={a.href ? () => go(a.href!) : undefined}
                  className={ITEM}
                >
                  {t(a.label, locale)}
                </Command.Item>
              ))
            : null}
        </Command.Group>

        {isGroupAdmin ? (
          <Command.Group heading={t({ es: 'Administración', en: 'Admin' }, locale)} className={HEADING}>
            {ADMIN_DESTINATIONS.map((d) => (
              <Command.Item
                key={d.href}
                value={`${t(d.label, locale)} ${d.tag} ${d.keywords.join(' ')}`}
                onSelect={() => go(d.href)}
                className={ITEM}
              >
                <span aria-hidden className={TAG}>
                  {d.tag}
                </span>
                {t(d.label, locale)}
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
      </Command.List>
    </Command.Dialog>
  )
}
