'use client'

import { motion, useReducedMotion } from 'framer-motion'

const MANIFEST = [
  { label: 'RÉGIMEN',    value: 'Zona franca industrial' },
  { label: 'ORIGEN',     value: 'China · Japón · Tailandia · EAU' },
  { label: 'NODOS',      value: 'ZOFRATACNA / ZOFRI' },
  { label: 'RESPUESTA',  value: '24 horas hábiles' },
]

const LINES = [
  'Operamos desde dentro',
  'de la zona. No vendemos',
  'desde afuera de ella.',
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}

const line = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.85, ease: [0, 0, 0.2, 1] as const } },
}

export function NosotrosHero() {
  const reduced = useReducedMotion()

  const headline = (
    <h1 className="font-display text-display-xl font-light text-warm-white leading-[0.95] tracking-[-0.02em]">
      {LINES.map((l, i) => (
        <span key={i} className="block">
          {reduced ? l : (
            <span className="block overflow-hidden">
              <motion.span className="block" variants={line}>{l}</motion.span>
            </span>
          )}
        </span>
      ))}
    </h1>
  )

  if (reduced) {
    return (
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-6">
            Nosotros
          </p>
          {headline}
          <p className="mt-8 font-body text-body-lg text-warm-white/60 max-w-lg leading-relaxed">
            Infraestructura activa en dos zonas francas del Pacífico Sur. Proveedores directos en China, Japón, Tailandia y Dubai. Seguimiento documentado en 24 horas hábiles.
          </p>
        </div>
        <ManifestBlock />
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
      <div>
        <motion.p
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.1 }}
        >
          Nosotros
        </motion.p>

        <motion.div variants={container} initial="hidden" animate="show">
          {headline}
        </motion.div>

        <motion.p
          className="mt-8 font-body text-body-lg text-warm-white/60 max-w-lg leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.65 }}
        >
          Infraestructura activa en dos zonas francas del Pacífico Sur. Proveedores directos en China, Japón, Tailandia y Dubai. Seguimiento documentado en 24 horas hábiles.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.45 }}
      >
        <ManifestBlock />
      </motion.div>
    </div>
  )
}

function ManifestBlock() {
  return (
    <div className="border border-warm-white/[0.12] p-6">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold/70 mb-4">
        Perfil Operativo
      </p>
      <div className="space-y-3">
        {MANIFEST.map(({ label, value }) => (
          <div
            key={label}
            className="flex gap-4 border-b border-warm-white/[0.06] pb-3 last:border-0 last:pb-0"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-warm-white/30 w-24 shrink-0 pt-0.5">
              {label}
            </span>
            <span className="font-body text-sm text-warm-white/80 leading-snug">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
