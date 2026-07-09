'use client'

import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { LaneMembership } from '@/lib/lanes/memberships'

/**
 * The stamp rail (COMPONENT_TREE). The user's assigned lanes as LaneStamps; the
 * active lane floods the accent (via --lane-accent, set on the shell root by the
 * parent). Surfaces never change — only the accent. Degrades to an empty note
 * when the user has no memberships (fresh scaffold / empty tables).
 */
export function LaneSwitcher({
  lanes,
  activeLaneId,
  onSelect,
  locale = DEFAULT_LOCALE,
}: {
  lanes: LaneMembership[]
  activeLaneId: string | null
  onSelect: (laneId: string) => void
  locale?: Locale
}) {
  if (lanes.length === 0) {
    return (
      <div className="border-b border-line p-3">
        <p className="font-mono text-label uppercase tracking-[0.12em] text-ink-secondary">
          {t({ es: 'Sin lanes asignados', en: 'No lanes assigned' }, locale)}
        </p>
      </div>
    )
  }

  return (
    <div
      role="tablist"
      aria-label={t({ es: 'Lanes', en: 'Lanes' }, locale)}
      className="flex flex-col gap-1 border-b border-line p-2"
    >
      {lanes.map((lane) => {
        const active = lane.laneId === activeLaneId
        return (
          <button
            key={lane.laneId}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(lane.laneId)}
            className={cn(
              'flex items-center gap-2 rounded-card border px-3 py-2 text-left transition-colors',
              active
                ? 'border-lane-accent bg-surface-0'
                : 'border-line hover:border-ink-secondary',
            )}
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: active ? 'var(--lane-accent)' : 'var(--line)' }}
            />
            <span className="font-mono text-label tracking-[0.08em] text-ink-secondary">
              {lane.laneCode}
            </span>
            <span className="font-ui text-t0 text-ink-primary">{lane.laneName}</span>
          </button>
        )
      })}
    </div>
  )
}
