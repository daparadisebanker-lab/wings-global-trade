import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solicitar cotización — Euro Global Machinery",
  description: "Solicita tu cotización de maquinaria agrícola con precio landed total — equipo, flete, aranceles y entrega incluidos.",
};

const MACHINE_TYPES = [
  "Tractor agrícola",
  "Cosechadora",
  "Sembradora / plantadora",
  "Pulverizadora",
  "Rastra / arado",
  "Otro equipo agrícola",
];

const HP_RANGES = [
  "40 – 60 hp",
  "60 – 80 hp",
  "80 – 100 hp",
  "100 – 130 hp",
  "130 – 160 hp",
  "160 – 210 hp",
  "Más de 210 hp",
];

const COUNTRIES = [
  "Colombia",
  "Perú",
  "Bolivia",
  "Chile",
  "Paraguay",
  "Uruguay",
  "Ecuador",
  "Otro",
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* Header */}
      <div className="bg-[#001E50] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Sin compromiso · Respondemos en &lt; 24 h
          </p>
          <h1
            className="text-4xl font-semibold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Solicitar cotización
          </h1>
          <p
            className="mt-4 max-w-xl text-sm leading-relaxed text-white/60"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Completa el formulario y recibe un precio landed total — equipo, flete, aranceles y entrega hasta tu país.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">

          {/* Quote form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[#E8E4DB] bg-white p-8 sm:p-10">
              <h2
                className="mb-1 text-2xl font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Detalle del requerimiento
              </h2>
              <p
                className="mb-8 text-sm text-[#6B6560]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Cuéntanos qué necesitas y te enviamos la cotización con precio landed completo.
              </p>

              <form className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Tipo de equipo *
                    </label>
                    <select
                      className="w-full rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <option value="">Selecciona…</option>
                      {MACHINE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Potencia requerida *
                    </label>
                    <select
                      className="w-full rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <option value="">Selecciona rango…</option>
                      {HP_RANGES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Cantidad de unidades
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ej: 3"
                      className="w-full rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      País de destino *
                    </label>
                    <select
                      className="w-full rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <option value="">Selecciona país…</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      className="w-full rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Empresa / Organización
                    </label>
                    <input
                      type="text"
                      placeholder="Tu empresa o cooperativa"
                      className="w-full rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      placeholder="+57 300 000 0000"
                      className="w-full rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      placeholder="tu@empresa.com"
                      className="w-full rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                </div>

                <div>
                  <label
                    className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Especificaciones adicionales
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tracción preferida, uso principal, características específicas del terreno u otro detalle relevante…"
                    className="w-full resize-none rounded-xl border border-[#E8E4DB] bg-[#F8F6F0] px-3 py-2.5 text-sm text-[#1C1A16] focus:border-[#C4933F] focus:outline-none"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>

                <div className="border-t border-[#E8E4DB] pt-5">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#C4933F] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Enviar solicitud de cotización
                  </button>
                  <p
                    className="mt-3 text-center text-xs text-[#6B6560]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Respondemos en menos de 24 horas con precio landed total.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* WhatsApp CTA */}
            <div className="rounded-2xl bg-[#001E50] p-7 text-white">
              <p
                className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Respuesta inmediata
              </p>
              <h3
                className="mb-3 text-lg font-semibold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ¿Prefieres WhatsApp?
              </h3>
              <p
                className="mb-5 text-sm leading-relaxed text-white/60"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Escríbenos directamente. Un asesor responde en minutos durante horario laboral.
              </p>
              <a
                href="https://wa.me/51999000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C4933F] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.527 5.845L0 24l6.335-1.502A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.865 0-3.614-.483-5.13-1.33l-.369-.213-3.761.893.952-3.67-.233-.378A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Abrir WhatsApp
              </a>
            </div>

            {/* Contact info */}
            <div className="rounded-2xl border border-[#E8E4DB] bg-white p-7">
              <h3
                className="mb-5 text-base font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Información de contacto
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Correo
                  </p>
                  <p
                    className="mt-1 text-[#1C1A16]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    info@euroglobalexport.com
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Horario de atención
                  </p>
                  <p
                    className="mt-1 text-[#6B6560]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Lun – Vie, 08:00 – 18:00 (Lima, GMT-5)
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Tiempo de respuesta
                  </p>
                  <p
                    className="mt-1 text-[#6B6560]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Menos de 24 horas hábiles
                  </p>
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <div className="rounded-2xl border border-[#E8E4DB] bg-white p-7">
              <h3
                className="mb-4 text-base font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                La cotización incluye
              </h3>
              <ul className="space-y-3">
                {[
                  "Precio del equipo (FOB China)",
                  "Flete marítimo hasta destino",
                  "Aranceles e impuestos de importación",
                  "Entrega hasta tu campo o almacén",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-[#6B6560]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C4933F]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
