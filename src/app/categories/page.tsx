"use client";

import Link from "next/link";
import Image from "next/image";
import { useFadeIn, useStaggerFadeIn } from "@/hooks/useFadeIn";
import { CATEGORIES } from "@/lib/categories";

const SERVICE_FEATURES = [
  {
    label: "Precio landed total",
    detail: "FOB, flete, zona franca, aranceles y entrega — en un solo número antes de que decidas comprar.",
  },
  {
    label: "Dos hubs en zona franca",
    detail: "ZOFRI en Iquique y ZOFRATACNA en Tacna como plataformas logísticas para 6 países de la región.",
  },
  {
    label: "Asesoría 100% en español",
    detail: "Un asesor real te acompaña desde la selección del proveedor hasta la entrega en tu país.",
  },
];

const TRUST_STATS = [
  { n: "6",    label: "Países atendidos",  sub: "Perú, Bolivia, Chile, Paraguay, Argentina, Uruguay" },
  { n: "48 h", label: "Cotización landed", sub: "Con aranceles, flete y entrega incluidos" },
  { n: "2",    label: "Hubs zona franca",  sub: "ZOFRI Iquique · ZOFRATACNA Tacna" },
  { n: "100%", label: "En español",        sub: "Asesoría, documentos y soporte" },
];

const HUBS = [
  {
    hub: "ZOFRI",
    location: "Iquique, Chile",
    markets: ["Bolivia", "Paraguay", "Argentina", "Uruguay", "Norte de Chile"],
  },
  {
    hub: "ZOFRATACNA",
    location: "Tacna, Perú",
    markets: ["Perú", "Bolivia (ruta andina)"],
  },
];

export default function CategoriesPage() {
  const heroRef    = useFadeIn();
  const catalogRef = useStaggerFadeIn(80);
  const featsRef   = useStaggerFadeIn(100);
  const trustRef   = useStaggerFadeIn(60);
  const ctaRef     = useFadeIn();

  return (
    <>
      {/* ── DUAL PATH HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#004389] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">

          <div ref={heroRef as React.RefObject<HTMLDivElement>} className="fade-up text-center mb-14">
            <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-4"
              style={{ fontFamily: "var(--font-body)" }}>
              Dos modelos. Una infraestructura.
            </p>
            <h1
              className="text-white text-4xl md:text-5xl lg:text-[64px] font-semibold tracking-tight leading-[1.06]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ¿Qué necesitas hoy?
            </h1>
            <p className="text-white/55 text-lg mt-5 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}>
              Operamos como proveedor directo con inventario propio y como socio de importación
              para terceros. La misma infraestructura, dos caminos distintos.
            </p>
          </div>

          {/* Two equal path cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Card A — Catalog */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-8 md:p-10 flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4933F]" />
              <p className="text-[#C4933F] text-xs font-semibold tracking-[0.15em] uppercase mb-5"
                style={{ fontFamily: "var(--font-body)" }}>
                Catálogo propio
              </p>
              <h2
                className="text-[#1C1A16] text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Maquinaria disponible en inventario
              </h2>
              <p className="text-[#6B6560] text-base leading-relaxed mb-8"
                style={{ fontFamily: "var(--font-body)" }}>
                Tractores, equipos industriales, camiones y vehículos pesados importados directamente
                desde Asia y Europa — listos para cotizar con entrega en tu país.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={cat.href}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-[#E8E4DB] text-[#1C1A16] hover:bg-[#004389] hover:text-white hover:border-[#004389] transition-colors duration-150"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {cat.shortLabel}
                  </Link>
                ))}
              </div>
              <Link
                href="/agricultural/tractors"
                className="mt-auto inline-flex items-center justify-center gap-2 bg-[#C4933F] hover:bg-[#D4A855] text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors duration-200"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Ver tractores disponibles
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Card B — Import Service */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0D1B2A] p-8 md:p-10 flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4933F]" />
              <p className="text-[#C4933F] text-xs font-semibold tracking-[0.15em] uppercase mb-5"
                style={{ fontFamily: "var(--font-body)" }}>
                Servicio de importación
              </p>
              <h2
                className="text-white text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Importa cualquier producto desde Asia
              </h2>
              <p className="text-white/60 text-base leading-relaxed mb-8"
                style={{ fontFamily: "var(--font-body)" }}>
                Gestionamos todo el proceso para tu empresa — desde el proveedor en China hasta
                la entrega en tu ciudad, con precio landed total confirmado antes de decidir.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["ZOFRI Iquique", "ZOFRATACNA Tacna", "48 h cotización", "6 países"].map((badge) => (
                  <span
                    key={badge}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-white/70"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <Link
                href="/importacion"
                className="mt-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors duration-200"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Conocer el servicio
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATALOG SECTION ─────────────────────────────────────────────── */}
      <section className="bg-[#FAFAFA] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-4"
                style={{ fontFamily: "var(--font-body)" }}>
                Catálogo propio
              </p>
              <h2
                className="text-[#1C1A16] text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Equipos disponibles ahora.
              </h2>
            </div>
            <p className="text-[#6B6560] text-base leading-relaxed max-w-sm"
              style={{ fontFamily: "var(--font-body)" }}>
              Maquinaria importada directamente, posicionada en nuestros hubs para entrega rápida en la región.
            </p>
          </div>

          <div ref={catalogRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const img = cat.subtypes[0]?.unsplashId
                ? `https://images.unsplash.com/${cat.subtypes[0].unsplashId}?w=700&q=80`
                : null;
              return (
                <Link
                  key={cat.slug}
                  href={cat.href}
                  className="stagger-item group relative h-64 overflow-hidden rounded-2xl block"
                >
                  {img && (
                    <Image
                      src={img}
                      alt={cat.label}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#004389]/90 via-[#004389]/40 to-[#004389]/10" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.15em] uppercase mb-1.5"
                      style={{ fontFamily: "var(--font-body)" }}>
                      {cat.subtypes.filter((s) => !s.comingSoon).length > 0
                        ? `${cat.subtypes.filter((s) => !s.comingSoon).length} activa${cat.subtypes.filter((s) => !s.comingSoon).length !== 1 ? "s" : ""}`
                        : "Próximamente"}
                    </p>
                    <h3
                      className="text-white text-2xl font-semibold tracking-tight mb-3"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {cat.shortLabel}
                    </h3>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C4933F] group-hover:gap-3 transition-all duration-200"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Explorar
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── IMPORT SERVICE SECTION ───────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28 border-y border-[#E8E4DB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy + features */}
            <div>
              <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-5"
                style={{ fontFamily: "var(--font-body)" }}>
                Servicio de importación
              </p>
              <h2
                className="text-[#1C1A16] text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08] mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Importa con precio final y sin sorpresas.
              </h2>
              <p className="text-[#6B6560] text-lg leading-relaxed mb-10"
                style={{ fontFamily: "var(--font-body)" }}>
                Nuestras relaciones directas con fabricantes en Asia, hubs en zona franca y conocimiento
                aduanero en 6 países están disponibles como servicio para tu empresa. Tú defines el producto;
                nosotros gestionamos el resto.
              </p>

              <div ref={featsRef as React.RefObject<HTMLDivElement>} className="space-y-5 mb-10">
                {SERVICE_FEATURES.map((f) => (
                  <div key={f.label} className="stagger-item flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-[#C4933F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#C4933F]" />
                    </div>
                    <div>
                      <p className="text-[#1C1A16] text-sm font-semibold mb-0.5"
                        style={{ fontFamily: "var(--font-body)" }}>{f.label}</p>
                      <p className="text-[#6B6560] text-sm leading-relaxed"
                        style={{ fontFamily: "var(--font-body)" }}>{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/importacion"
                className="inline-flex items-center gap-2 bg-[#004389] hover:bg-[#004389]/90 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors duration-200"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Ver servicio completo
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right: hub cards */}
            <div className="space-y-4">
              {HUBS.map((h) => (
                <div key={h.hub} className="bg-[#FAFAFA] rounded-2xl p-6 border border-[#E8E4DB]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[#C4933F] text-xs font-semibold tracking-[0.12em] uppercase mb-1"
                        style={{ fontFamily: "var(--font-body)" }}>
                        {h.hub}
                      </p>
                      <p className="text-[#1C1A16] text-xl font-semibold"
                        style={{ fontFamily: "var(--font-display)" }}>
                        {h.location}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#C4933F]/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#C4933F]" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {h.markets.map((m) => (
                      <span
                        key={m}
                        className="text-[10px] font-medium bg-white border border-[#E8E4DB] text-[#6B6560] px-2.5 py-1 rounded-full"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="bg-[#004389] rounded-2xl p-6">
                <p className="text-white text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-body)" }}>
                  Cotización en menos de 48 horas
                </p>
                <p className="text-white/50 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  Precio landed completo — aranceles, aduana y flete interior incluidos — antes de que tomes la decisión de comprar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHARED TRUST LAYER ──────────────────────────────────────────── */}
      <section className="bg-[#004389] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-4"
              style={{ fontFamily: "var(--font-body)" }}>
              Por qué elegirnos
            </p>
            <h2
              className="text-white text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08] max-w-2xl mx-auto"
              style={{ fontFamily: "var(--font-display)" }}
            >
              La misma infraestructura respalda los dos modelos.
            </h2>
            <p className="text-white/45 text-lg mt-5 max-w-lg mx-auto" style={{ fontFamily: "var(--font-body)" }}>
              Ya sea que compres del catálogo o importes tus propios productos, la experiencia logística y el conocimiento regional son los mismos.
            </p>
          </div>

          <div ref={trustRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/8">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="stagger-item text-center">
                <p
                  className="text-[#C4933F] text-4xl md:text-5xl font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.n}
                </p>
                <p className="text-white text-sm font-medium mb-1"
                  style={{ fontFamily: "var(--font-body)" }}>
                  {s.label}
                </p>
                <p className="text-white/40 text-xs leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNIFIED CONTACT CTA ─────────────────────────────────────────── */}
      <section className="bg-[#FAFAFA] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div ref={ctaRef as React.RefObject<HTMLDivElement>} className="fade-up text-center mb-12">
            <p className="text-[#C4933F] text-[10px] font-semibold tracking-[0.12em] uppercase mb-4"
              style={{ fontFamily: "var(--font-body)" }}>
              Empieza aquí
            </p>
            <h2
              className="text-[#1C1A16] text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ¿Por dónde empezamos?
            </h2>
            <p className="text-[#6B6560] text-lg mt-4 max-w-md mx-auto"
              style={{ fontFamily: "var(--font-body)" }}>
              Cuéntanos qué necesitas y te conectamos con el equipo correcto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CTA A — Catalog path */}
            <Link
              href="/contact"
              className="group bg-white rounded-2xl border border-[#E8E4DB] p-8 hover:border-[#C4933F] hover:shadow-[0_4px_24px_rgba(196,147,63,0.10)] transition-all duration-200 block"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C4933F]/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" fill="none" stroke="#C4933F" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h3
                className="text-[#1C1A16] text-xl font-semibold mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Quiero cotizar un equipo del catálogo
              </h3>
              <p className="text-[#6B6560] text-sm leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-body)" }}>
                Tengo interés en maquinaria del inventario propio y quiero recibir una cotización con precio landed a mi país.
              </p>
              <span
                className="inline-flex items-center gap-2 text-[#C4933F] text-xs font-semibold group-hover:gap-3 transition-all duration-200"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Solicitar cotización
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* CTA B — Import path */}
            <Link
              href="/importacion#contacto"
              className="group bg-[#004389] rounded-2xl p-8 hover:bg-[#062663] transition-all duration-200 block"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C4933F]/20 flex items-center justify-center mb-5">
                <svg width="18" height="18" fill="none" stroke="#C4933F" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h3
                className="text-white text-xl font-semibold mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Quiero importar mis propios productos
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-body)" }}>
                Necesito importar productos desde Asia para mi empresa y quiero explorar el servicio de importación gestionada.
              </p>
              <span
                className="inline-flex items-center gap-2 text-[#C4933F] text-xs font-semibold group-hover:gap-3 transition-all duration-200"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Iniciar mi proyecto
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
