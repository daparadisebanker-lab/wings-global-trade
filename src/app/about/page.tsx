import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quiénes somos — Euro Global Machinery",
  description: "Conectamos compradores latinoamericanos con fabricantes asiáticos de maquinaria agrícola — precio landed total, sin intermediarios.",
};

const STATS = [
  { value: "86",       label: "Modelos disponibles" },
  { value: "5",        label: "Marcas verificadas"  },
  { value: "7",        label: "Países de entrega"   },
  { value: "40–210",   label: "Rango HP del catálogo" },
];

const VALUES = [
  {
    title: "Precio Landed Total",
    body: "Cada cotización incluye el costo del equipo, flete marítimo, aranceles de importación y entrega hasta el destino final. Sin sorpresas al momento del despacho.",
  },
  {
    title: "Fabricantes verificados",
    body: "Trabajamos directamente con fabricantes que tienen historial documentado de exportación a Latinoamérica. Sin intermediarios que inflen el precio.",
  },
  {
    title: "Asesoría en español",
    body: "Un consultor real te acompaña desde la selección del equipo hasta la entrega. Respondemos en menos de 24 horas, en tu horario y en tu idioma.",
  },
];

const HOW = [
  {
    num: "01",
    title: "Selecciona el equipo",
    body: "Explora nuestro catálogo de tractores y maquinaria agrícola. Filtra por potencia, marca y tracción.",
  },
  {
    num: "02",
    title: "Solicita tu cotización",
    body: "Completa el formulario con tu requerimiento y país de destino. Sin compromiso de compra.",
  },
  {
    num: "03",
    title: "Recibe precio Landed",
    body: "Te enviamos una cotización con el precio total: equipo + flete + aranceles + entrega hasta tu campo.",
  },
  {
    num: "04",
    title: "Confirma y recibe",
    body: "Al confirmar, gestionamos toda la logística. El equipo llega listo para trabajar.",
  },
];

const MARKETS = [
  "Colombia", "Perú", "Bolivia", "Chile", "Paraguay", "Uruguay", "Ecuador",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* Header */}
      <div className="bg-[#001E50] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Sobre nosotros
            </p>
            <h1
              className="text-4xl font-semibold text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Maquinaria agrícola de Asia con precio landed total.
            </h1>
            <p
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Conectamos compradores latinoamericanos directamente con fabricantes asiáticos verificados — con flete, aranceles y entrega incluidos en cada cotización.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="border-b border-[#E8E4DB] bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="border-l-2 border-[#C4933F] pl-5">
                <dd
                  className="text-3xl font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.value}
                </dd>
                <dt
                  className="mt-1 text-xs uppercase tracking-widest text-[#6B6560]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Nuestra misión
              </p>
              <h2
                className="text-2xl font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Acceso directo a los mejores fabricantes del mundo.
              </h2>
              <p
                className="mt-5 text-sm leading-relaxed text-[#6B6560]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                La maquinaria agrícola de calidad no debería costar el doble por pasar por tres intermediarios. Asia produce algunos de los mejores tractores y equipos del mercado a precios que transforman la rentabilidad del campo latinoamericano.
              </p>
              <p
                className="mt-4 text-sm leading-relaxed text-[#6B6560]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Nuestra plataforma elimina esa cadena de intermediarios. Compradores en 7 países de Latinoamérica reciben cotizaciones con precio landed total — sin calcular nada por su cuenta.
              </p>
            </div>
            <div>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Nuestros valores
              </p>
              <div className="space-y-6">
                {VALUES.map((v) => (
                  <div key={v.title} className="border-l-2 border-[#C4933F] pl-5">
                    <h3
                      className="text-base font-semibold text-[#1C1A16]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {v.title}
                    </h3>
                    <p
                      className="mt-1.5 text-sm leading-relaxed text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {v.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[#E8E4DB] bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Cómo funciona
          </p>
          <h2
            className="mb-10 text-2xl font-semibold text-[#1C1A16]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Del catálogo al campo en cuatro pasos.
          </h2>
          <div className="grid gap-px border border-[#E8E4DB] bg-[#E8E4DB] sm:grid-cols-2 lg:grid-cols-4">
            {HOW.map((s) => (
              <div key={s.num} className="bg-white p-8">
                <p
                  className="text-4xl font-semibold text-[#C4933F]/20"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.num}
                </p>
                <h3
                  className="mt-4 text-base font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed text-[#6B6560]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Mercados activos
          </p>
          <h2
            className="mb-8 text-2xl font-semibold text-[#1C1A16]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Entregamos en 7 países de Latinoamérica.
          </h2>
          <div className="flex flex-wrap gap-3">
            {MARKETS.map((m) => (
              <span
                key={m}
                className="rounded-full border border-[#E8E4DB] bg-white px-5 py-2 text-sm font-medium text-[#1C1A16]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {m}
              </span>
            ))}
          </div>
          <p
            className="mt-6 text-sm text-[#6B6560]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Puertos de entrada y zonas francas: ZOFRATACNA (Tacna, Perú) · ZOFRI (Iquique, Chile).
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#001E50] py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ¿Listo para cotizar tu próximo equipo?
          </h2>
          <p
            className="mt-3 text-sm text-white/60"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Sin compromiso. Respondemos en menos de 24 horas con precio landed total.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/agricultural/tractors"
              className="rounded-full bg-[#C4933F] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver catálogo
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/20 px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white/8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar cotización
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
