import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Próximamente — Wings Global Trade",
  description: "Descubre todo lo que se viene en Wings Global Trade: nuevas categorías de maquinaria, plataforma de sourcing con IA, herramientas para importadores y mucho más.",
};

const COMING_SOON_ITEMS = [
  {
    phase: "Fase 2",
    timeline: "Q3 2026",
    category: "Catálogo",
    title: "Camiones y Vehículos Pesados",
    description: "Camiones tractores, volquetes, plataformas, cisternas y refrigerados desde fabricantes verificados en China. Más de 3,000 modelos en preparación.",
    features: ["Camión Tractor Cabina Simple", "Volquetes Rígidos y Articulados", "Camiones Cisterna y Refrigerados", "Plataformas y Transportadores"],
    status: "en preparación",
  },
  {
    phase: "Fase 2",
    timeline: "Q3 2026",
    category: "Catálogo",
    title: "Buses y Autocares",
    description: "Buses urbanos, autocares interurbanos, minibuses y buses escolares de fabricantes asiáticos con homologación para Latinoamérica.",
    features: ["Bus Urbano Piso Bajo", "Autocares Larga Distancia", "Minibuses y Shuttles", "Buses Escolares y Articulados"],
    status: "en preparación",
  },
  {
    phase: "Fase 2",
    timeline: "Q3 2026",
    category: "Catálogo",
    title: "Construcción e Industrial",
    description: "Excavadoras, montacargas, topadoras, grúas y equipos de manejo de materiales. La oferta industrial más completa desde Asia.",
    features: ["Excavadoras de Orugas y Ruedas", "Montacargas Contrapesado", "Topadoras y Motoniveladoras", "Grúas Torre y Reach Stackers"],
    status: "en preparación",
  },
  {
    phase: "Fase 2",
    timeline: "Q3 2026",
    category: "Catálogo",
    title: "Repuestos y Componentes",
    description: "Repuestos originales y alternativos para maquinaria agrícola e industrial. Motores, cajas, ejes, turbo y más — nuevos desde China.",
    features: ["Motores Diésel", "Cajas de Cambios", "Turbos y Radiadores", "Ejes y Diferenciales"],
    status: "en preparación",
  },
  {
    phase: "Fase 3",
    timeline: "Q4 2026",
    category: "Maquinaria Agrícola",
    title: "Cosechadoras, Sembradoras y más",
    description: "Cosechadoras de granos y forraje, sembradoras de precisión, pulverizadoras y empacadoras — toda la línea de implementos agrícolas desde Asia.",
    features: ["Cosechadoras de Granos", "Sembradoras de Precisión", "Pulverizadoras Autopropulsadas", "Empacadoras Redondas y Cuadradas"],
    status: "próximamente",
  },
  {
    phase: "Fase 6",
    timeline: "Q1 2027",
    category: "Plataforma",
    title: "Sourcing B2B con Inteligencia Artificial",
    description: "Importa cualquier producto industrial desde fabricantes verificados en China — con IA que cotiza, negocia y coordina todo el proceso por ti en menos de 48 horas.",
    features: ["Cotización automática en 48 h", "Red de fabricantes verificados", "Negociación y contratos asistidos", "Logística total hasta tu ciudad"],
    status: "muy pronto",
    cta: { label: "Unirse a lista de espera", href: "/sourcing" },
  },
  {
    phase: "Fase 7",
    timeline: "Q2 2027",
    category: "Plataforma",
    title: "Herramientas para Importadores",
    description: "Panel de control dedicado para importadores mayoristas y traders: seguimiento de pedidos en tiempo real, historial de importaciones, gestión de documentos y calculadora de costos.",
    features: ["Dashboard de pedidos en tiempo real", "Calculadora de costos landed", "Gestión de documentos aduaneros", "Historial de importaciones"],
    status: "próximamente",
  },
  {
    phase: "Fase 8",
    timeline: "Q2 2027",
    category: "Plataforma",
    title: "Rutas por País",
    description: "Guías de importación personalizadas por destino: aranceles exactos, documentos requeridos, tiempos de tránsito y contactos locales para Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay.",
    features: ["Guía de importación Perú", "Guía de importación Bolivia", "Guía de importación Chile", "Los 12 países de cobertura"],
    status: "próximamente",
  },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  "en preparación": { bg: "bg-[#004389]/8 border border-[#004389]/15", text: "text-[#004389]" },
  "próximamente":   { bg: "bg-[#C4933F]/10 border border-[#C4933F]/20", text: "text-[#C4933F]" },
  "muy pronto":     { bg: "bg-[#C4933F]/20 border border-[#C4933F]/40", text: "text-[#C4933F]" },
};

const PHASE_COLORS: Record<string, string> = {
  "Fase 2": "#6BA3C8",
  "Fase 3": "#8B9DC3",
  "Fase 6": "#C4933F",
  "Fase 7": "#C4933F",
  "Fase 8": "#C4933F",
};

export default function ProximamentePage() {
  const catalogItems = COMING_SOON_ITEMS.filter((i) => i.category === "Catálogo" || i.category === "Maquinaria Agrícola");
  const platformItems = COMING_SOON_ITEMS.filter((i) => i.category === "Plataforma");

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Hero */}
      <div className="bg-[#004389] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <span
            className="mb-6 inline-block rounded-full border border-[#C4933F] px-4 py-1 text-xs tracking-wide text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Hoja de ruta 2026–2027
          </span>
          <h1
            className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tight text-white md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Próximamente en Wings Global Trade
          </h1>
          <p
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/55"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Estamos construyendo la plataforma de maquinaria e importación más completa para Latinoamérica.
            Aquí está todo lo que se viene.
          </p>

          {/* Quick stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-10 border-t border-white/10 pt-10">
            {[
              { value: "8", label: "Categorías en camino" },
              { value: "4", label: "Fases de desarrollo" },
              { value: "2027", label: "Plataforma completa" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="text-3xl font-semibold text-[#C4933F]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.value}
                </p>
                <p
                  className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/30"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        {/* Available now callout */}
        <div className="mb-16 rounded-2xl bg-white border border-[#E8E4DB] p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p
                className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Disponible ahora · Fase 1 completa
              </p>
              <p
                className="text-2xl font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                34 tractores disponibles en inventario
              </p>
              <p
                className="mt-1 text-sm text-[#6B6560]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                New Holland · John Deere · Massey Ferguson · Kubota — 50 a 140 hp, precio landed total.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <Link
                href="/agricultural/tractors"
                className="rounded-full bg-[#C4933F] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#D4A855]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Ver catálogo →
              </Link>
              <Link
                href="/importacion"
                className="rounded-full border border-[#E8E4DB] px-6 py-2.5 text-sm font-semibold text-[#6B6560] transition-colors hover:border-[#C4933F] hover:text-[#1C1A16]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Servicio de importación
              </Link>
            </div>
          </div>
        </div>

        {/* Catalog section */}
        <div className="mb-16">
          <div className="mb-8">
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Catálogo — En preparación
            </p>
            <h2
              className="text-3xl font-semibold text-[#1C1A16]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nuevas categorías de maquinaria
            </h2>
            <p
              className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B6560]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Incorporando miles de modelos nuevos desde fabricantes asiáticos verificados.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {catalogItems.map((item) => {
              const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES["próximamente"];
              const phaseColor = PHASE_COLORS[item.phase] ?? "#C4933F";
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#E8E4DB] bg-white p-7"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-body)", color: phaseColor }}
                    >
                      {item.phase} · {item.timeline}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text}`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3
                    className="mb-2 text-xl font-semibold text-[#1C1A16]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mb-5 text-sm leading-relaxed text-[#6B6560]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.description}
                  </p>

                  <ul className="space-y-1.5">
                    {item.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <div className="h-1 w-1 flex-shrink-0 rounded-full bg-[#C4933F]/50" />
                        <span
                          className="text-xs text-[#6B6560]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 pt-5 border-t border-[#F0EDE8]">
                    <Link
                      href="/importacion"
                      className="text-xs font-semibold text-[#C4933F] hover:underline"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      ¿Lo necesitas ahora? Importación a pedido →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform section */}
        <div>
          <div className="mb-8">
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Plataforma — Roadmap
            </p>
            <h2
              className="text-3xl font-semibold text-[#1C1A16]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Herramientas e infraestructura
            </h2>
            <p
              className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B6560]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Tecnología que simplifica la importación para compradores y distribuidores en toda Latinoamérica.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {platformItems.map((item) => {
              const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES["próximamente"];
              const phaseColor = PHASE_COLORS[item.phase] ?? "#C4933F";
              return (
                <div
                  key={item.title}
                  className="flex flex-col rounded-2xl border border-[#E8E4DB] bg-white p-7"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-body)", color: phaseColor }}
                    >
                      {item.phase} · {item.timeline}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text}`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3
                    className="mb-2 text-xl font-semibold text-[#1C1A16]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mb-5 flex-1 text-sm leading-relaxed text-[#6B6560]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.description}
                  </p>

                  <ul className="mb-5 space-y-1.5">
                    {item.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <div className="h-1 w-1 flex-shrink-0 rounded-full bg-[#C4933F]/50" />
                        <span
                          className="text-xs text-[#6B6560]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {item.cta && (
                    <Link
                      href={item.cta.href}
                      className="mt-auto rounded-full bg-[#C4933F] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#D4A855]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.cta.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl bg-[#004389] px-8 py-12 text-center">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Mientras tanto
          </p>
          <h2
            className="mx-auto max-w-lg text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ¿No encuentras lo que buscas en el catálogo actual?
          </h2>
          <p
            className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Podemos importar cualquier maquinaria o insumo directamente desde fábrica — precio landed total con entrega garantizada.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/importacion"
              className="rounded-full bg-[#C4933F] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar importación →
            </Link>
            <Link
              href="/agricultural/tractors"
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white/70 transition-colors hover:border-white/40 hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver catálogo actual
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
