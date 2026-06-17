// src/components/features/homepage/TrustBar.tsx
'use client'

import { motion } from 'framer-motion'
import { FREE_ZONES, SOURCE_MARKETS, MARKETS_SERVED } from '@/lib/constants'
import { FADE_UP, FADE_UP_TRANSITION, VIEWPORT_ONCE } from '@/lib/motion'

export function TrustBar() {
  return (
    <motion.div
      variants={FADE_UP}
      initial="initial"
      whileInView="animate"
      viewport={VIEWPORT_ONCE}
      transition={FADE_UP_TRANSITION}
      className="grid grid-cols-1 gap-10 md:grid-cols-3"
    >
      <Column title="Zonas Francas">
        {FREE_ZONES.map((z) => (
          <p key={z.name} className="font-mono text-sm text-warm-white">
            <span className="text-gold">{z.name}</span> · {z.location}
          </p>
        ))}
      </Column>

      <Column title="Mercados de origen">
        <p className="font-mono text-sm text-warm-white">{SOURCE_MARKETS.join(' · ')}</p>
      </Column>

      <Column title="Mercados atendidos">
        <p className="font-mono text-sm leading-relaxed text-warm-white">
          {MARKETS_SERVED.join(' · ')}
        </p>
      </Column>
    </motion.div>
  )
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 border-b border-[rgba(248,246,240,0.2)] pb-2 font-mono text-xs uppercase tracking-widest-2 text-text-muted-inverse">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
