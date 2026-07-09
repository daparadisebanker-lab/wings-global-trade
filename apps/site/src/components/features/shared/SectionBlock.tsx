// src/components/features/shared/SectionBlock.tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionBlockProps {
  theme: 'navy' | 'warm-white'
  children: ReactNode
  className?: string
  id?: string
}

/** Enforces the navy <-> warm-white alternation and consistent section padding. */
export function SectionBlock({ theme, children, className, id }: SectionBlockProps) {
  return (
    <section
      id={id}
      className={cn(
        'px-6 py-20 md:px-10 md:py-28',
        theme === 'navy' ? 'bg-navy-900 text-warm-white' : 'bg-warm-white text-navy',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  )
}
