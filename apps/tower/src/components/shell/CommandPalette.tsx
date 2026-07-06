'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { MODULES } from '@/lib/nav'

/**
 * ⌘K CommandPalette (COMPONENT_TREE) — Linear-grade jump + actions. Wave 1 wires
 * module navigation; the record-level jumps ("open container WGT/02-C014") and
 * run-actions ("publish…", "new RFQ…") light up with their feature waves and are
 * shown disabled here so the surface is honest. cmdk gives full keyboard nav.
 */
export function CommandPalette({
  open,
  onOpenChange,
  locale = DEFAULT_LOCALE,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
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
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
