// src/components/features/navigation/Footer.tsx
import Link from 'next/link'
import type { Category } from '@/types/database'
import {
  FREE_ZONES,
  MARKETS_SERVED,
  WINGS_PUBLIC_EMAIL,
} from '@/lib/constants'
import { WhatsAppButton } from '@/components/features/shared/WhatsAppButton'

interface FooterProps {
  categories: Category[]
}

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="border-t border-[rgba(248,246,240,0.04)] bg-[#000C1F] px-6 py-20 text-warm-white md:px-10">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wings-logo.svg"
            alt="Wings Global Trade"
            className="h-10 w-auto brightness-0 invert opacity-90"
          />
          <p className="mt-4 font-display text-sm font-light italic text-gold/50 tracking-wide">
            Precisión. Proximidad. Confianza.
          </p>
          <div className="mt-6">
            {/* Per ENRICHED_SPEC §3.4 — footer WhatsApp exact label */}
            <WhatsAppButton label="Abrir conversación en WhatsApp" />
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/40">
            Catálogo
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/catalogo/${c.slug}`}
                  className="font-body text-sm text-warm-white/55 transition-colors duration-150 hover:text-warm-white"
                >
                  {c.name_es}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/mister"
                className="font-body text-sm text-gold transition-colors hover:text-gold-hover"
              >
                Mister
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/40">
            Zonas Francas
          </p>
          <ul className="mt-4 flex flex-col gap-2 font-mono text-sm text-warm-white/55">
            {FREE_ZONES.map((z) => (
              <li key={z.name}>
                {z.name} — {z.location}
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/40">
            Mercados atendidos
          </p>
          <p className="mt-3 font-mono text-sm text-warm-white/55">{MARKETS_SERVED.join(' · ')}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/40">
            Contacto
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            <li>
              <a
                href={`mailto:${WINGS_PUBLIC_EMAIL}`}
                className="font-body text-sm text-warm-white/55 transition-colors duration-150 hover:text-warm-white"
              >
                {WINGS_PUBLIC_EMAIL}
              </a>
            </li>
            <li>
              <Link
                href="/nosotros"
                className="font-body text-sm text-warm-white/55 transition-colors duration-150 hover:text-warm-white"
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link
                href="/contacto"
                className="font-body text-sm text-warm-white/55 transition-colors duration-150 hover:text-warm-white"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 w-full max-w-6xl border-t border-warm-white/[0.08] pt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/20">
          © {new Date().getFullYear()} Wings Global Trade <span className="mx-2 text-gold/30">·</span> Importación industrial para América Latina
        </p>
      </div>
    </footer>
  )
}
