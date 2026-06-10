import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quiénes somos — Importador de Maquinaria Agrícola desde Asia | Wings Global Trade",
  description: "Wings Global Trade conecta compradores en Perú, Bolivia, Chile y LATAM directamente con fabricantes asiáticos de tractores y camiones. 200+ importaciones completadas. Precio landed total, sin intermediarios.",
  alternates: { canonical: "https://wingsglobaltrade.com/about" },
};

const STATS = [
  { value: "200+",     label: "Importaciones completadas" },
  { value: "61",       label: "Modelos en catálogo"       },
  { value: "12",       label: "Países de entrega"         },
  { value: "45–90d",   label: "Plazo confirmado por escrito" },
];

const VALUES = [
  {
    title: "Precio landed total — por escrito",
    body: "La cotización incluye el equipo, flete marítimo, zona franca, aranceles de tu país y entrega. Ese número no cambia. Lo firmamos antes de que tomes ninguna decisión.",
  },
  {
    title: "Fábrica verificada, sin intermediarios",
    body: "Acceso directo al fabricante en China. Sin representante regional, sin distribuidor local cobrando margen. El ahorro promedio frente al canal tradicional es del 15–25%.",
  },
  {
    title: "Un asesor real, en español",
    body: "No un formulario. Un asesor que conoce el catálogo, entiende tu terreno, y te acompaña desde la selección hasta la entrega. Respuesta en menos de 24 horas.",
  },
];

const HOW = [
  {
    num: "01",
    title: "Selecciona el equipo",
    body: "Explora el catálogo — tractores, camiones, buses, equipos industriales y repuestos. Filtra por categoría y marca.",
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
  "Perú", "Bolivia", "Chile", "Paraguay", "Argentina", "Uruguay",
  "Guatemala", "El Salvador", "Honduras", "Nicaragua", "Costa Rica", "Panamá",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Header */}
      <div className="bg-[#004389] py-20">
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
              Tractores, camiones y maquinaria de fábrica en Asia. Entregados con precio landed en Latinoamérica.
            </h1>
            <p
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Conectamos compradores en 12 países de Latinoamérica directamente con fabricantes verificados en Asia — con flete internacional, aranceles y entrega en destino incluidos en un solo precio, firmado por escrito antes de que confirmes nada.
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
                El distribuidor local cobra su margen. El importador cobra el suyo. El representante regional cobra el suyo. Para cuando la máquina llega al campo latinoamericano, el precio se duplicó — sin que el comprador supiera exactamente por qué.
              </p>
              <p
                className="mt-4 text-sm leading-relaxed text-[#6B6560]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Wings elimina esa cadena. Un asesor trabaja directamente con el fabricante en Asia, gestiona el flete, la zona franca y los aranceles, y entrega un solo número firmado — el precio final en tu país. Tractores, camiones y cualquier producto industrial bajo el mismo proceso.
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
            Entregamos en 12 países de Latinoamérica.
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
      <section className="bg-[#004389] py-16">
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
              href="/categories"
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
