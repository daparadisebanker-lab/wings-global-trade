// src/components/ui/button.tsx
'use client'

import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  children?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-wings font-body font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

const variants: Record<Variant, string> = {
  primary: 'bg-gold text-navy hover:bg-gold-hover active:bg-gold-active',
  secondary:
    'bg-transparent border border-current hover:bg-current/[0.06]',
  ghost: 'bg-transparent text-gold hover:text-gold-hover hover:underline px-0',
  whatsapp: 'bg-whatsapp text-white hover:brightness-95',
}

const sizes: Record<Size, string> = {
  sm: 'text-[11px] uppercase tracking-[0.08em] px-4 py-2',
  md: 'text-[11px] uppercase tracking-[0.08em] px-6 py-3',
  lg: 'text-[12px] uppercase tracking-[0.08em] px-8 py-4',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant as Variant], variant !== 'ghost' && sizes[size as Size], className)}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        {...props}
      >
        {isLoading && (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </motion.button>
    )
  },
)
Button.displayName = 'Button'
