// src/components/features/navigation/Footer.tsx
import Link from 'next/link'
import type { Category } from '@/types/database'
import {
  FREE_ZONES,
  MARKETS_SERVED,
  WINGS_PUBLIC_EMAIL,
  WINGS_TAGLINE,
} from '@/lib/constants'
import { WhatsAppButton } from '@/components/features/shared/WhatsAppButton'

interface FooterProps {
  categories: Category[]
}

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="bg-navy px-6 py-16 text-warm-white md:px-10">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-2xl font-semibold">
            Wings<span className="text-gold"> Global Trade</span>
          </p>
          <p className="mt-3 font-display text-lg text-gold">{WINGS_TAGLINE}</p>
          <div className="mt-6">
            {/* Per ENRICHED_SPEC §3.4 — footer WhatsApp exact label */}
            <WhatsAppButton label="Abrir conversación en WhatsApp" />
          </div>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest-2 text-text-muted-inverse">
            Catálogo
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/catalogo/${c.slug}`}
                  className="font-body text-sm text-warm-white/80 transition-colors hover:text-gold"
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
          <p className="font-mono text-xs uppercase tracking-widest-2 text-text-muted-inverse">
            Zonas Francas
          </p>
          <ul className="mt-4 flex flex-col gap-2 font-mono text-sm text-warm-white/80">
            {FREE_ZONES.map((z) => (
              <li key={z.name}>
                {z.name} — {z.location}
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest-2 text-text-muted-inverse">
            Mercados atendidos
          </p>
          <p className="mt-3 font-mono text-sm text-warm-white/80">{MARKETS_SERVED.join(' · ')}</p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest-2 text-text-muted-inverse">
            Contacto
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            <li>
              <a
                href={`mailto:${WINGS_PUBLIC_EMAIL}`}
                className="font-body text-sm text-warm-white/80 transition-colors hover:text-gold"
              >
                {WINGS_PUBLIC_EMAIL}
              </a>
            </li>
            <li>
              <Link
                href="/nosotros"
                className="font-body text-sm text-warm-white/80 transition-colors hover:text-gold"
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link
                href="/contacto"
                className="font-body text-sm text-warm-white/80 transition-colors hover:text-gold"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-6xl border-t border-[rgba(248,246,240,0.12)] pt-6">
        <p className="font-mono text-xs text-text-muted-inverse">
          © {new Date().getFullYear()} Wings Global Trade. Importación industrial para América Latina.
        </p>
      </div>
    </footer>
  )
}
