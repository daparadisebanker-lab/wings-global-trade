// @wings/trade-ui · Input primitive. Extracted verbatim from apps/site
// components/ui/input.tsx (M3b); token/Tailwind-styled, cn from package-local util.
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  onNavy?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, onNavy, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-wings px-4 py-3 font-body text-base outline-none transition-shadow',
          onNavy
            ? 'bg-white/[0.06] border border-[rgba(248,246,240,0.2)] text-warm-white placeholder:text-[#6B7280]'
            : 'bg-white border border-border-default text-navy placeholder:text-[#9CA3AF]',
          'focus:border-gold focus:shadow-[0_0_0_3px_rgba(196,147,63,0.15)]',
          hasError && 'border-[var(--error,#DC2626)] focus:border-[var(--error,#DC2626)] focus:shadow-[0_0_0_3px_var(--error-glow,rgba(220,38,38,0.1))]',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
