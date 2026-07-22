'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { ModuleId } from '@/lib/nav'
import {
  ADMIN_ACTIONS,
  ADMIN_DESTINATIONS,
  EVERYONE_ACTIONS,
  SELF_DESTINATIONS,
  TOOLS,
} from '@/shell/navigation/registry'

// ⌘K destinations + actions now live in the shell navigation registry (the one
// source of truth — TOWER-REDESIGN §5), imported above. The palette renders
// entirely from the registry so it can never drift from the rail.

/**
 * ⌘K CommandPalette (COMPONENT_TREE) — Linear-grade jump + actions. Wave 1 wires
 * module navigation; the record-level jumps ("open container WGT/02-C014") and
 * run-actions ("publish…", "new RFQ…") light up with their feature waves and are
 * shown disabled here so the surface is honest. Admin destinations + actions are
 * gated on group-admin (Wave 5). cmdk gives full keyboard nav.
 */
export function CommandPalette({
  open,
  onOpenChange,
  isGroupAdmin = false,
  visible,
  locale = DEFAULT_LOCALE,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isGroupAdmin?: boolean
  /** Same permission-derived module set the rail uses (lib/rbac). The palette
   *  and the rail MUST agree — jumping to a module the rail hides lands the
   *  operator on an RLS-empty page. Omitted → show all (safe legacy default). */
  visible?: Set<ModuleId>
  locale?: Locale
}) {
  const router = useRouter()
  // Read the canonical TOOLS directly (typed TowerTool, so keywords are available
  // for search); still filtered by the rail's rbac `visible` set so the two agree.
  const modules = visible ? TOOLS.filter((m) => visible.has(m.id)) : TOOLS

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

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
        placeholder={t({ es: 'Buscar módulos y acciones…', en: 'Search modules and actions…' }, locale)}
        className="w-full border-b border-line bg-transparent px-4 py-3 font-ui text-t1 text-ink-primary outline-none placeholder:text-ink-secondary"
      />
      <Command.List className="max-h-[70dvh] overflow-y-auto overscroll-contain p-2 md:max-h-80">
        <Command.Empty className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
          {t({ es: 'Sin resultados', en: 'No results' }, locale)}
        </Command.Empty>

        <Command.Group
          heading={t({ es: 'Módulos', en: 'Modules' }, locale)}
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-ink-secondary"
        >
          {modules.map((m) => (
            <Command.Item
              key={m.id}
              value={`${t(m.label, locale)} ${m.id} ${m.tag} ${m.keywords.join(' ')}`}
              onSelect={() => go(m.href)}
              className="flex cursor-pointer items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-primary aria-selected:bg-surface-0"
            >
              <span aria-hidden className="font-mono text-label tracking-[0.1em] text-lane-accent">
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
              className="flex cursor-pointer items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-primary aria-selected:bg-surface-0"
            >
              <span aria-hidden className="font-mono text-label tracking-[0.1em] text-lane-accent">
                {d.tag}
              </span>
              {t(d.label, locale)}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group
          heading={t({ es: 'Acciones', en: 'Actions' }, locale)}
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-ink-secondary"
        >
          {EVERYONE_ACTIONS.filter((a) => !a.adminOnly || isGroupAdmin).map((a) => (
            <Command.Item
              key={a.id}
              disabled={a.disabled}
              value={a.disabled ? undefined : `${t(a.label, locale)} ${a.keywords.join(' ')}`}
              onSelect={a.disabled || !a.href ? undefined : () => go(a.href!)}
              className={
                a.disabled
                  ? 'flex items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-secondary opacity-50'
                  : 'flex cursor-pointer items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-primary aria-selected:bg-surface-0'
              }
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
                  className="flex cursor-pointer items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-primary aria-selected:bg-surface-0"
                >
                  {t(a.label, locale)}
                </Command.Item>
              ))
            : null}
        </Command.Group>

        {isGroupAdmin ? (
          <Command.Group
            heading={t({ es: 'Administración', en: 'Admin' }, locale)}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-ink-secondary"
          >
            {ADMIN_DESTINATIONS.map((d) => (
              <Command.Item
                key={d.href}
                value={`${t(d.label, locale)} ${d.tag} ${d.keywords.join(' ')}`}
                onSelect={() => go(d.href)}
                className="flex cursor-pointer items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-primary aria-selected:bg-surface-0"
              >
                <span aria-hidden className="font-mono text-label tracking-[0.1em] text-lane-accent">
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
