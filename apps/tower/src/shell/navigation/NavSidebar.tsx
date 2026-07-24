'use client'

// Desktop module sidebar (shell IA/UI Phase C). The labeled counterpart to the
// Dock — decision: keep both (Dock = quick-launch icons; sidebar = the calm,
// labeled home). Registry-driven, grouped Operación · Marca e inteligencia ·
// Sistema. Each module card can expand to reveal its 1–2 quick actions
// (MODULE_QUICK_ACTIONS); the active module's card auto-expands. Desktop-only —
// the aside that hosts it is the off-canvas drawer below md.
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'
import type { ModuleId, NavGroupId } from '@/lib/nav'
import { TOOLS } from '@/shell/navigation/registry'
import { useActiveTool } from '@/shell/navigation/useActiveTool'
import { MODULE_QUICK_ACTIONS } from '@/shell/navigation/quick-actions'
import { NAV_ICONS } from '@/components/shell/nav-icons'

const GROUP_ORDER: NavGroupId[] = ['operate', 'intel', 'system']
const GROUP_LABELS: Record<NavGroupId, Localized> = {
  operate: { es: 'Operación', en: 'Operations' },
  intel: { es: 'Marca e inteligencia', en: 'Brand & intel' },
  system: { es: 'Sistema', en: 'System' },
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      aria-hidden
      className={cn('transition-transform duration-150', open && 'rotate-90')}
    >
      <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NavSidebar({ visible, locale = DEFAULT_LOCALE }: { visible: Set<ModuleId>; locale?: Locale }) {
  const active = useActiveTool()
  // The active module's card starts open; navigating to a module opens its card
  // too (additive — never collapses what the user opened by hand).
  const [expanded, setExpanded] = useState<Set<ModuleId>>(() => (active ? new Set([active.id]) : new Set()))
  useEffect(() => {
    if (active && (MODULE_QUICK_ACTIONS[active.id]?.length ?? 0) > 0) {
      setExpanded((prev) => (prev.has(active.id) ? prev : new Set(prev).add(active.id)))
    }
  }, [active?.id])

  const tools = TOOLS.filter((tl) => visible.has(tl.id))
  if (tools.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <p className="font-ui text-t0 text-ink-secondary">
          {t({ es: 'Tu cuenta aún no tiene módulos asignados.', en: 'Your account has no modules assigned yet.' }, locale)}
        </p>
        <p className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {t({ es: 'Pídele acceso a un administrador.', en: 'Ask an administrator for access.' }, locale)}
        </p>
      </div>
    )
  }

  function toggle(id: ModuleId) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <nav aria-label={t({ es: 'Módulos', en: 'Modules' }, locale)} className="flex flex-col gap-4 p-3">
      {GROUP_ORDER.map((group) => {
        const groupTools = tools.filter((tl) => tl.group === group)
        if (groupTools.length === 0) return null
        return (
          <div key={group} className="flex flex-col gap-1">
            <span className="px-2 pb-1 font-mono text-label uppercase tracking-[0.16em] text-ink-secondary">
              {t(GROUP_LABELS[group], locale)}
            </span>
            {groupTools.map((tl) => {
              const Icon = NAV_ICONS[tl.icon]
              const on = active?.id === tl.id
              const actions = MODULE_QUICK_ACTIONS[tl.id] ?? []
              const hasActions = actions.length > 0
              const open = expanded.has(tl.id)
              const labelText = t(tl.label, locale)
              return (
                <div key={tl.id} className="flex flex-col">
                  <div
                    className={cn(
                      'group flex items-center rounded-control transition-colors',
                      on ? 'bg-surface-2' : 'hover:bg-surface-2',
                    )}
                  >
                    <Link
                      href={tl.href}
                      data-active={on}
                      aria-current={on ? 'page' : undefined}
                      className={cn(
                        'flex flex-1 items-center gap-2.5 rounded-control px-2.5 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent',
                        on ? 'text-ink-primary' : 'text-ink-secondary group-hover:text-ink-primary',
                      )}
                    >
                      <Icon className={cn('shrink-0', on ? 'text-gold' : 'text-ink-secondary')} />
                      <span className="font-ui text-t0">{labelText}</span>
                      <span aria-hidden className="ml-auto font-mono text-label tracking-[0.1em] text-ink-secondary">
                        {tl.tag}
                      </span>
                    </Link>
                    {hasActions ? (
                      <button
                        type="button"
                        onClick={() => toggle(tl.id)}
                        aria-expanded={open}
                        aria-label={`${t(open ? { es: 'Contraer', en: 'Collapse' } : { es: 'Expandir', en: 'Expand' }, locale)} ${labelText}`}
                        className="grid h-9 w-8 shrink-0 place-items-center rounded-control text-ink-secondary hover:text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent"
                      >
                        <Chevron open={open} />
                      </button>
                    ) : null}
                  </div>
                  {hasActions && open ? (
                    <div className="mb-1 mt-0.5 flex flex-col gap-0.5 pl-9">
                      {actions.map((a) => (
                        <Link
                          key={a.id}
                          href={a.href}
                          className="rounded-control px-2.5 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary transition-colors hover:bg-surface-2 hover:text-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent"
                        >
                          {t(a.label, locale)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}
