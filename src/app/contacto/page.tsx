// src/app/contacto/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { ContactForm } from '@/components/features/shared/ContactForm'
import { WhatsAppButton } from '@/components/features/shared/WhatsAppButton'
import { OFFICE_LOCATIONS, WINGS_PUBLIC_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contacto — Wings Global Trade',
  description:
    'Consultas B2B fuera del catálogo. Respondemos en menos de 24 horas hábiles. Importación de maquinaria y equipo industrial para América Latina.',
  openGraph: {
    title: 'Contacto — Wings Global Trade',
    description:
      'Consultas B2B fuera del catálogo. Respondemos en menos de 24 horas hábiles. Importación de maquinaria y equipo industrial para América Latina.',
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/contacto',
  },
  alternates: {
    canonical: 'https://wingsglobaltrade.com/contacto',
  },
}

export default function ContactoPage() {
  return (
    <>
      {/* Hero with image */}
      <section className="relative flex min-h-[60vh] items-end overflow-hidden bg-[#000C1F] px-6 pb-16 pt-36 md:min-h-[68vh] md:px-10 md:pb-24">
        {/* Background image */}
        <Image
          src="/Contacto/contacto-hero.png"
          alt="Operativo Wings Global Trade en patio de contenedores"
          fill
          className="object-cover object-[60%_center]"
          sizes="100vw"
          priority
        />
        {/* Left-heavy scrim — text lives on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#000C1F]/92 via-[#000C1F]/60 to-[#000C1F]/20" />

        <div className="relative z-10 max-w-4xl">
          <div className="wings-rule mb-8" />
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-warm-white/30 mb-6">
            Contacto
          </p>
          <h1 className="font-display text-display-xl font-light text-warm-white leading-[0.95] tracking-[-0.02em]">
            Habla con el equipo.
          </h1>
          <p className="mt-6 font-body text-body-lg text-warm-white/50 max-w-lg">
            Para consultas fuera del catálogo o de Mister. Respondemos en menos de 24 horas.
          </p>
        </div>
      </section>

      {/* Form + channels — warm-white */}
      <section className="bg-[#F8F6F0] py-20 md:py-28 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Direct channels */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-8">
              Canales directos
            </p>

            <div className="space-y-8">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-navy/50 mb-2">
                  WhatsApp
                </label>
                <div className="mt-2">
                  <WhatsAppButton message="Hola, quiero más información sobre Wings Global Trade." />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-navy/50 mb-2">
                  Email
                </label>
                <a
                  href={`mailto:${WINGS_PUBLIC_EMAIL}`}
                  className="inline-block font-body text-base text-navy underline decoration-gold underline-offset-4 hover:text-gold transition-colors duration-200"
                >
                  {WINGS_PUBLIC_EMAIL}
                </a>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-navy/50 mb-2">
                  Oficinas
                </label>
                <ul className="space-y-3">
                  {OFFICE_LOCATIONS.map((o) => (
                    <li key={o.city} className="font-body text-base text-navy">
                      {o.city}, {o.country}{' '}
                      <span className="font-mono text-sm text-gold">· {o.zone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-8">
              Envíanos un mensaje
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
