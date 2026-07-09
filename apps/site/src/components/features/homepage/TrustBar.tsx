'use client'

import { motion } from 'framer-motion'
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
            className={
              i === 0 ? '' :
              i % 2 !== 0 ? 'border-l border-warm-white/[0.08] pl-8 md:pl-10' :
              'md:border-l md:border-warm-white/[0.08] md:pl-10'
            }
          >
            <p className="font-display text-display-lg font-light text-gold leading-none">{item.value}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/40">
              {item.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

    </div>
  )
}
