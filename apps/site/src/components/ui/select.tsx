// src/components/ui/select.tsx
import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
  onNavy?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, onNavy, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-wings px-4 py-3 pr-10 font-body text-base outline-none transition-shadow',
            onNavy
              ? 'bg-white/[0.06] border border-[rgba(248,246,240,0.2)] text-warm-white'
              : 'bg-white border border-border-default text-navy',
            'focus:border-gold focus:shadow-[0_0_0_3px_rgba(196,147,63,0.15)]',
            hasError && 'border-[#DC2626]',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={cn(
            'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2',
            onNavy ? 'text-warm-white' : 'text-navy',
          )}
        >
          <path
            d="M6 8l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  },
)
Select.displayName = 'Select'

/** Standard destination country options, Spanish-first. */
export const DESTINATION_COUNTRIES = [
  'Perú',
  'Chile',
  'Colombia',
  'Panamá',
  'Costa Rica',
  'Bolivia',
  'R. Dominicana',
  'Otro',
] as const
