// src/components/features/navigation/Footer.tsx
import Link from 'next/link'
import type { Category } from '@/types/database'
import {
  FREE_ZONES,
  MARKETS_SERVED,
  WINGS_PUBLIC_EMAIL,
  WINGS_PUBLIC_WHATSAPP,
} from '@/lib/constants'

interface FooterProps {
  categories: Category[]
}

const NAV_SERVICES = [
  { href: '/cotizar', label: 'Solicitar cotización' },
  { href: '/proceso', label: 'Cómo importar' },
  { href: '/mister', label: 'Mister IA' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="bg-[#000C1F] text-warm-white">
      {/* Brand strip — full width with gold rule */}
      <div className="border-b border-warm-white/[0.05] px-6 py-16 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wings-logo.svg"
              alt="Wings Global Trade"
              className="h-9 w-auto brightness-0 invert opacity-90"
            />
            <p className="mt-4 max-w-xs font-display text-sm font-light italic leading-relaxed text-warm-white/30 tracking-wide">
              Importación técnica para el mercado latinoamericano. Zonas francas. Sin intermediarios.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/40">
              Canal directo
            </p>
            <a
              href={`https://wa.me/${WINGS_PUBLIC_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-gold/20 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.10em] text-warm-white/60 transition-all duration-200 hover:border-gold/60 hover:text-gold"
            >
              <span className="h-px w-4 bg-gold/40" aria-hidden />
              WhatsApp
            </a>
            <Link
              href="/cotizar"
              className="inline-flex items-center gap-3 bg-gold px-6 py-3 font-mono text-[11px] uppercase tracking-[0.10em] text-navy transition-colors duration-200 hover:bg-gold-hover"
            >
              <span className="h-px w-4 bg-current" aria-hidden />
              Solicitar cotización
            </Link>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="px-6 py-16 md:px-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 md:grid-cols-4">
          {/* Catálogo */}
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
              Catálogo
            </p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  href="/catalogo"
                  className="font-mono text-[11px] text-warm-white/50 transition-colors duration-150 hover:text-warm-white"
                >
                  Todo el catálogo
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/catalogo/${c.slug}`}
                    className="font-mono text-[11px] text-warm-white/50 transition-colors duration-150 hover:text-warm-white"
                  >
                    {c.name_es}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
              Servicios
            </p>
            <ul className="flex flex-col gap-2.5">
              {NAV_SERVICES.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="font-mono text-[11px] text-warm-white/50 transition-colors duration-150 hover:text-warm-white"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Operaciones */}
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
              Operaciones
            </p>
            <ul className="flex flex-col gap-2.5">
              {FREE_ZONES.map((z) => (
                <li key={z.name} className="flex flex-col gap-0.5">
                  <span className="font-mono text-[11px] text-gold/60">{z.name}</span>
                  <span className="font-mono text-[10px] text-warm-white/30">{z.location}</span>
                </li>
              ))}
              <li className="mt-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
                  Mercados
                </p>
                <p className="font-mono text-[10px] leading-loose text-warm-white/30">
                  {MARKETS_SERVED.join(' · ')}
                </p>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
              Contacto
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${WINGS_PUBLIC_EMAIL}`}
                  className="font-mono text-[11px] text-warm-white/50 transition-colors duration-150 hover:text-warm-white"
                >
                  {WINGS_PUBLIC_EMAIL}
                </a>
              </li>
              <li className="pt-2">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/20">
                  Origen
                </p>
                <p className="font-mono text-[10px] leading-loose text-warm-white/30">
                  China · Tailandia · Japón · Dubai
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-warm-white/[0.05] px-6 py-6 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/20">
            © {new Date().getFullYear()} Wings Global Trade
            <span className="mx-2 text-gold/20">·</span>
            Importación industrial para América Latina
          </p>
          <p className="font-display text-[11px] italic text-warm-white/15">
            Precisión. Proximidad. Confianza.
          </p>
        </div>
      </div>
    </footer>
  )
}
