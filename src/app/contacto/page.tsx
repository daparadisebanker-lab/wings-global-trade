// src/app/contacto/page.tsx
import type { Metadata } from 'next'
import { PageHero } from '@/components/features/shared/PageHero'
import { SectionBlock } from '@/components/features/shared/SectionBlock'
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
      <PageHero
        eyebrow="Contacto"
        title="Habla con el equipo."
        subtitle="Para consultas fuera del catálogo o el Motor Accio. Respondemos en menos de 24 horas."
      />

      <SectionBlock theme="warm-white">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Direct channels */}
          <div>
            <h2 className="font-display text-display-sm font-semibold text-navy">Canales directos</h2>

            <div className="mt-6 space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest-2 text-text-muted">WhatsApp</p>
                <div className="mt-2">
                  <WhatsAppButton message="Hola, quiero más información sobre Wings Global Trade." />
                </div>
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-widest-2 text-text-muted">Email</p>
                <a
                  href={`mailto:${WINGS_PUBLIC_EMAIL}`}
                  className="mt-2 inline-block font-body text-base text-navy underline decoration-gold underline-offset-4"
                >
                  {WINGS_PUBLIC_EMAIL}
                </a>
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-widest-2 text-text-muted">Oficinas</p>
                <ul className="mt-2 space-y-2">
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
            <h2 className="mb-6 font-display text-display-sm font-semibold text-navy">
              Envíanos un mensaje
            </h2>
            <ContactForm />
          </div>
        </div>
      </SectionBlock>
    </>
  )
}
