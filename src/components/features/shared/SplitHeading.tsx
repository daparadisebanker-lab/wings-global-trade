'use client'
import { ElementType } from 'react'
import { useSplitTextReveal } from '@/hooks/useSplitTextReveal'

interface SplitHeadingProps {
  as?: 'h1' | 'h2' | 'h3'
  children: string
  className?: string
  trigger?: 'scroll' | 'mount'
  type?: 'lines' | 'words'
  stagger?: number
}

export function SplitHeading({
  as = 'h2',
  children,
  className,
  trigger = 'scroll',
  type = 'lines',
  stagger,
}: SplitHeadingProps) {
  const ref = useSplitTextReveal<HTMLHeadingElement>({ type, trigger, stagger })
  const Tag = as as ElementType
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
