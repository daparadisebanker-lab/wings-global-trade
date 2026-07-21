'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'
import { MODULES } from '@/lib/nav'

/** Admin ⌘K destinations (COMPONENT_TREE §6) — shown only to group admins.
 * /admin/audit and /admin/webhooks are a parallel agent's routes; linked here
 * per the wave brief. */
const ADMIN_DESTINATIONS: { href: string; label: Localized; tag: string }[] = [
  { href: '/admin', label: { es: 'Administración', en: 'Admin home' }, tag: 'ADM' },
  { href: '/admin/users', label: { es: 'Usuarios y accesos', en: 'Users & access' }, tag: 'USR' },
  { href: '/admin/lanes', label: { es: 'Registro de lanes', en: 'Lane registry' }, tag: 'LNE' },
  { href: '/admin/brands', label: { es: 'Marcas', en: 'Brands' }, tag: 'BRD' },
  { href: '/admin/audit', label: { es: 'Auditoría', en: 'Audit' }, tag: 'AUD' },
  { href: '/admin/webhooks', label: { es: 'Webhooks', en: 'Webhooks' }, tag: 'WHK' },
]

/** Admin ⌘K run-actions — each opens the surface where the action is completed. */
const ADMIN_ACTIONS: { href: string; label: Localized }[] = [
  { href: '/admin/users', label: { es: 'Invitar usuario…', en: 'Invite user…' } },
  { href: '/admin/users', label: { es: 'Invitar rep…', en: 'Invite rep…' } },
  { href: '/admin/lanes', label: { es: 'Registrar lane…', en: 'Register lane…' } },
  { href: '/admin/brands', label: { es: 'Nueva marca…', en: 'New brand…' } },
]

/** Everyone-facing ⌘K destinations (not admin-gated). */
const SELF_DESTINATIONS: { href: string; label: Localized; tag: string }[] = [
  { href: '/perfil', label: { es: 'Mi perfil', en: 'My profile' }, tag: 'PRF' },
]

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
  locale = DEFAULT_LOCALE,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isGroupAdmin?: boolean
  locale?: Locale
}) {
  const router = useRouter()

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
      contentClassName="fixed left-1/2 top-[20%] z-50 w-[92vw] max-w-xl -translate-x-1/2 rounded-card border border-line bg-surface-1 shadow-none"
    >
      <Command.Input
        autoFocus
        placeholder={t({ es: 'Buscar módulos y acciones…', en: 'Search modules and actions…' }, locale)}
        className="w-full border-b border-line bg-transparent px-4 py-3 font-ui text-t1 text-ink-primary outline-none placeholder:text-ink-secondary"
      />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
          {t({ es: 'Sin resultados', en: 'No results' }, locale)}
        </Command.Empty>

        <Command.Group
          heading={t({ es: 'Módulos', en: 'Modules' }, locale)}
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-ink-secondary"
        >
          {MODULES.map((m) => (
            <Command.Item
              key={m.id}
              value={`${t(m.label, locale)} ${m.id} ${m.tag}`}
              onSelect={() => go(m.href)}
              className="flex cursor-pointer items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-primary aria-selected:bg-surface-0"
            >
              <span aria-hidden className="font-mono text-label tracking-[0.1em] text-lane-accent">
                {m.tag}
              </span>
              {t(m.label, locale)}
            </Command.Item>
          ))}
          {SELF_DESTINATIONS.map((d) => (
            <Command.Item
              key={d.href}
              value={`${t(d.label, locale)} ${d.tag} perfil profile`}
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
          <Command.Item
            disabled
            className="flex items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-secondary opacity-50"
          >
            {t({ es: 'Publicar producto…', en: 'Publish product…' }, locale)}
          </Command.Item>
          <Command.Item
            disabled
            className="flex items-center gap-3 rounded-card px-3 py-2 font-ui text-t0 text-ink-secondary opacity-50"
          >
            {t({ es: 'Nuevo RFQ…', en: 'New RFQ…' }, locale)}
          </Command.Item>
          {isGroupAdmin
            ? ADMIN_ACTIONS.map((a) => (
                <Command.Item
                  key={a.href + t(a.label, locale)}
                  value={`admin ${t(a.label, locale)}`}
                  onSelect={() => go(a.href)}
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
                value={`${t(d.label, locale)} ${d.tag} admin`}
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
