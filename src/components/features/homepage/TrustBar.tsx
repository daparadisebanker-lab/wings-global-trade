'use client'

import { motion } from 'framer-motion'
import { FREE_ZONES, SOURCE_MARKETS, MARKETS_SERVED } from '@/lib/constants'
import { COUNT_UP } from '@/lib/motion'

const INTELLIGENCE = [
  { value: 'CN', label: 'China — mercado de origen primario' },
  { value: 'JP', label: 'Japón — industria certificada' },
  { value: 'ZFT', label: 'ZOFRATACNA · Tacna, Perú' },
  { value: 'ZFI', label: 'ZOFRI · Iquique, Chile' },
]

export function TrustBar() {
  return (
    <div className="space-y-16">

      {/* Data identifiers — staggered COUNT_UP per stat */}
      <motion.div
        className="grid grid-cols-2 gap-y-8 md:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {INTELLIGENCE.map((item, i) => (
          <motion.div
            key={item.value}
            variants={COUNT_UP}
            className={i > 0 ? 'border-l border-warm-white/[0.08] pl-8 md:pl-10' : ''}
          >
            <p className="font-display text-display-lg font-light text-gold leading-none">{item.value}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/40">
              {item.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Detailed trade intelligence */}
      <motion.div
        className="grid grid-cols-1 gap-10 border-t border-warm-white/[0.07] pt-10 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
      >
        <motion.div variants={COUNT_UP}>
          <Column title="Zonas Francas">
            {FREE_ZONES.map((z) => (
              <p key={z.name} className="font-mono text-sm text-warm-white/70">
                <span className="text-gold">{z.name}</span> · {z.location}
              </p>
            ))}
          </Column>
        </motion.div>

        <motion.div variants={COUNT_UP}>
          <Column title="Mercados de origen">
            <p className="font-mono text-sm leading-relaxed text-warm-white/70">
              {SOURCE_MARKETS.join(' · ')}
            </p>
          </Column>
        </motion.div>

        <motion.div variants={COUNT_UP}>
          <Column title="Mercados atendidos">
            <p className="font-mono text-sm leading-relaxed text-warm-white/70">
              {MARKETS_SERVED.join(' · ')}
            </p>
          </Column>
        </motion.div>
      </motion.div>

    </div>
  )
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 font-mono text-[9px] uppercase tracking-widest-3 text-warm-white/30">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
