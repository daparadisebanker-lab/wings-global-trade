// src/components/ui/badge.tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'source' | 'gold' | 'muted'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  source: 'bg-navy text-warm-white',
  gold: 'bg-gold/[0.12] text-gold',
  muted: 'bg-[#F0EDE6] text-text-muted',
}

export function Badge({ children, variant = 'source', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-wings px-2 py-[3px] font-mono text-xs',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
