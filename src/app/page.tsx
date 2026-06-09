import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getListings } from "@data/listings";
import FeaturedCarousel from "@/components/listings/FeaturedCarousel";
import { DEFAULT_CURRENCY } from "@/lib/currencies";
import { DEFAULT_LANG, getTranslations } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Wings Global Trade | Maquinaria desde Asia para Latinoamérica",
  description:
    "Tractores, camiones, buses y equipos industriales — importados directamente de fábrica con precio landed total en Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay.",
};

const CAT_IMAGES: Record<string, string> = {
  "agricultural": "photo-1625246333195-78d9c38ad449",
  "trucks":       "photo-1601584115197-04ecc0da31d7",
  "buses":        "photo-1570125909517-53cb21c89ff2",
  "industrial":   "photo-1504307651254-35680f356dfd",
  "spare-parts":  "photo-1596813362035-d3c3e042a763",
};

const TRUST_BADGES = [
  {
    title: "Precio Landed Total",
    body:  "Flete, aranceles y entrega incluidos en tu cotización",
  },
  {
    title: "Sin intermediarios",
    body:  "Acceso directo a fabricantes verificados en China",
  },
  {
    title: "Entrega en 6 países",
    body:  "Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay",
  },
  {
    title: "Asesoría en español",
    body:  "Un consultor real, no un bot",
  },
];

const BRANDS = [
  { name: "New Holland",     count: 14 },
  { name: "John Deere",      count: 9  },
  { name: "Massey Ferguson", count: 6  },
  { name: "Kubota",          count: 5  },
];

const TESTIMONIALS = [
  {
    name:     "Andrés Villanueva",
    location: "Santa Cruz, Bolivia",
    machine:  "New Holland SNH1304 — 130 hp · 4WD",
    quote:    "Recibí el tractor en mi finca con todos los documentos de importación resueltos. El precio final fue exactamente el que me cotizaron.",
  },
  {
    name:     "Rodrigo Cárdenas",
    location: "Junín, Perú",
    machine:  "New Holland SH1004 — 100 hp · Cabina",
    quote:    "Comparé tres opciones con el asesor y elegimos el modelo que mejor se adaptaba al terreno. El proceso de importación fue completamente transparente.",
  },
  {
    name:     "Carlos Méndez",
    location: "Cochabamba, Bolivia",
    machine:  "John Deere 5E 100 — 100 hp · 4WD",
    quote:    "Pensé que importar directamente sería complicado. El asesor me guió paso a paso y el precio final incluía todo. Cinco meses después el tractor está en mi campo.",
  },
  {
    name:     "María Teresa Quispe",
    location: "Tarija, Bolivia",
    machine:  "Massey Ferguson MF 385 — 85 hp",
    quote:    "Cotizamos en tres distribuidores locales y ninguno pudo igualar el precio landed de Wings. La diferencia fue del 18% con mejores condiciones.",
  },
  {
    name:     "Fernando Aguirre",
    location: "Asunción, Paraguay",
    machine:  "Kubota M954K — 95 hp · Serie M",
    quote:    "El proceso por ZOFRATACNA fue transparente. Me enviaron los documentos de cada etapa. No tuve ninguna sorpresa en aduanas.",
  },
  {
    name:     "Diego Castillo",
    location: "Arequipa, Perú",
    machine:  "New Holland TT75 — 75 hp · 2WD",
    quote:    "Llevo tres temporadas con el tractor sin fallas. Y cuando tuve una consulta técnica, el soporte de Wings respondió el mismo día.",
  },
];

export default async function HomePage() {
  const currency = DEFAULT_CURRENCY;
  const lang     = DEFAULT_LANG;

  const [t, allListings] = await Promise.all([
    getTranslations(lang),
    getListings(),
  ]);
  const listings = allListings.slice(0, 6);

  const stats = [
    { value: "34",     label: "Modelos disponibles" },
    { value: "50–140", label: "Rango de potencia (hp)" },
    { value: "4",      label: "Marcas de fábrica" },
    { value: "6",      label: "Países atendidos" },
  ];

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
          alt="Campo agrícola en Latinoamérica"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.55) 100%)' }} />
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at 60% 30%, #C4933F 0%, transparent 60%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8F6F0] to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-28 text-center lg:px-8">
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          >
            <span
              className="text-[11px] font-medium tracking-widest text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Perú · Bolivia · Chile · Paraguay · Argentina · Uruguay
            </span>
          </div>

          <h1
            className="text-5xl font-semibold leading-tight text-white drop-shadow-sm sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Maquinaria de Asia
            <br />
            <span style={{ color: '#F0A030' }}>con precio landed y entrega garantizada.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/80"
            style={{ fontFamily: "var(--font-body)", textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
          >
            Tractores, camiones, buses y equipos industriales — importados directamente
            de fábrica con flete, aranceles y entrega incluidos en cada cotización.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/cotizar"
              className="rounded-full transition-opacity hover:opacity-90"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: '#F0A030',
                color: '#1a1a1a',
                padding: '14px 32px',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              Solicitar cotización
            </Link>
            <Link
              href="/agricultural/tractors"
              className="rounded-full border border-white/25 px-9 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver catálogo
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
            {TRUST_BADGES.map((b) => (
              <div key={b.title} className="border-l-2 border-[#C4933F]/40 pl-4 text-left">
                <p
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {b.title}
                </p>
                <p
                  className="mt-1.5 text-xs leading-relaxed text-white/50"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── FEATURED LISTINGS CAROUSEL ────────────────────────────────────── */}
      <section
        className="relative py-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#1C1A16]/85" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Catálogo destacado
              </p>
              <h2
                className="text-3xl font-semibold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Modelos disponibles ahora
              </h2>
            </div>
            <Link
              href="/agricultural/tractors"
              className="hidden text-xs font-semibold uppercase tracking-widest text-white/40 underline-offset-4 hover:text-white hover:underline sm:block"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver catálogo completo →
            </Link>
          </div>

          <FeaturedCarousel
            listings={listings}
            currency={currency}
            labels={{
              hours:           t.cardHours,
              power:           t.cardPower,
              hrsUnit:         t.hrsUnit,
              hpUnit:          t.hpUnit,
              viewDetails:     t.cardViewDetails,
              condNew:         t.condLabelNew,
              condUsed:        t.condLabelUsed,
              condRefurbished: t.condLabelRefurbished,
              viewAllListings: t.viewAllListings,
            }}
            lang={lang}
          />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="bg-[#001E50] py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-10 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border-l-2 border-[#C4933F] pl-6">
                <dd
                  className="text-4xl font-semibold text-[#C4933F]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.value}
                </dd>
                <dt
                  className="mt-1 text-xs uppercase tracking-widest text-white/40"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────── */}
      <section className="bg-[#F8F6F0] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              El proceso
            </p>
            <h2
              className="text-4xl font-semibold text-[#1C1A16] sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Cómo funciona
            </h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Elige o descríbelo",
                body: "Selecciona un modelo del catálogo o cuéntanos qué necesitas. Si no está en inventario, lo importamos directamente desde fábrica.",
              },
              {
                step: "02",
                title: "Cotización landed total",
                body: "Recibes un precio único que incluye el tractor, flete internacional, aranceles, gestión aduanera y entrega en tu país. Sin sorpresas.",
              },
              {
                step: "03",
                title: "Entrega en tu campo",
                body: "Coordinamos toda la logística desde fábrica hasta tu finca. Operamos desde ZOFRI (Chile) y ZOFRATACNA (Perú) hacia 6 países. Plazo estimado: 45–90 días.",
              },
            ].map((item) => (
              <div key={item.step} className="relative border-t-2 border-[#C4933F]/20 pt-8">
                <p
                  className="mb-4 text-5xl font-semibold leading-none text-[#C4933F]/12"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.step}
                </p>
                <h3
                  className="mb-3 text-xl font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed text-[#6B6560]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/cotizar"
              className="inline-flex items-center gap-2 rounded-full bg-[#001E50] px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar cotización ahora →
            </Link>
          </div>
        </div>
      </section>

      {/* ── DUAL-PATH DECISION ───────────────────────────────────────────── */}
      <section className="bg-[#001E50] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Dos modelos. Una infraestructura.
            </p>
            <h2
              className="text-4xl font-semibold text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ¿Qué necesitas hoy?
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/50"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Compra del inventario existente o importa cualquier producto desde Asia.
              El mismo equipo, la misma garantía de precio landed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/agricultural/tractors"
              className="group relative overflow-hidden rounded-2xl bg-[#F8F6F0] p-8 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <p
                className="mb-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Catálogo propio
              </p>
              <h3
                className="text-3xl font-semibold text-[#1C1A16] sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Maquinaria disponible en inventario
              </h3>
              <p
                className="mt-4 text-sm leading-relaxed text-[#6B6560]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                34 modelos listos para cotizar — tractores de New Holland, John Deere,
                Massey Ferguson y Kubota. Precio landed confirmado.
              </p>
              <div className="mt-8 flex items-center gap-2">
                <span
                  className="text-xs font-semibold uppercase tracking-widest text-[#C4933F]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Explorar catálogo
                </span>
                <svg
                  className="h-3.5 w-3.5 text-[#C4933F] transition-transform duration-200 group-hover:translate-x-1"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/importacion"
              className="group relative overflow-hidden rounded-2xl bg-[#001240] p-8 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <p
                className="mb-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Servicio de importación
              </p>
              <h3
                className="text-3xl font-semibold text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Importa cualquier producto desde Asia
              </h3>
              <p
                className="mt-4 text-sm leading-relaxed text-white/50"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ¿Tu producto no está en el catálogo? Lo gestionamos desde fábrica
                hasta tu aduana — selección, negociación, flete y documentación.
              </p>
              <div className="mt-8 flex items-center gap-2">
                <span
                  className="text-xs font-semibold uppercase tracking-widest text-[#C4933F]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Conocer el servicio
                </span>
                <svg
                  className="h-3.5 w-3.5 text-[#C4933F] transition-transform duration-200 group-hover:translate-x-1"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORY CARDS ────────────────────────────────────────────────── */}
      <section className="bg-[#F8F6F0] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Catálogo
              </p>
              <h2
                className="text-3xl font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Explorar por categoría
              </h2>
            </div>
            <Link
              href="/categories"
              className="hidden text-xs font-semibold uppercase tracking-widest text-[#6B6560] underline-offset-4 hover:text-[#1C1A16] hover:underline sm:block"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                href={cat.href}
                className={`group relative overflow-hidden rounded-2xl ${
                  i < 3 ? "h-72" : "h-56"
                } md:h-72`}
              >
                <Image
                  src={`https://images.unsplash.com/${CAT_IMAGES[cat.slug]}?w=600&q=80`}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001240]/90 via-[#001E50]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p
                    className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {cat.subtypes.length} subcategorías
                  </p>
                  <p
                    className="mt-1 text-lg font-semibold leading-tight text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {cat.shortLabel}
                  </p>
                  <p
                    className="mt-1.5 text-[10px] font-semibold text-white/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Explorar →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — typographic, no photos ─────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="mb-16 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Compradores verificados
          </p>
          <div className="grid gap-12 sm:grid-cols-2 sm:gap-16 lg:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <div key={item.name}>
                <p
                  className="text-3xl font-semibold leading-snug text-[#1C1A16] sm:text-4xl"
                  style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#E8E4DB]" />
                  <div className="text-right">
                    <p
                      className="text-sm font-semibold text-[#1C1A16]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#C4933F]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.location}
                    </p>
                    <p
                      className="mt-1 text-xs text-[#9B9590]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.machine}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS ────────────────────────────────────────────────────────── */}
      <section className="border-t border-[#E8E4DB] bg-[#F8F6F0] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Fabricantes
            </p>
            <h2
              className="text-3xl font-semibold text-[#1C1A16]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Marcas disponibles en el catálogo
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-px border border-[#E8E4DB] bg-[#E8E4DB] sm:grid-cols-4">
            {BRANDS.map((b) => {
              const slugMap: Record<string, string> = {
                "New Holland": "new-holland",
                "John Deere": "john-deere",
                "Massey Ferguson": "massey-ferguson",
                "Kubota": "kubota",
              };
              const href = slugMap[b.name] ? `/brands/${slugMap[b.name]}` : `/agricultural/tractors?brand=${encodeURIComponent(b.name)}`;
              return (
              <Link
                key={b.name}
                href={href}
                className="group flex flex-col items-center justify-center bg-white px-6 py-10 transition-colors hover:bg-[#001E50]"
              >
                <span
                  className="text-lg font-semibold text-[#6B6560] transition-colors group-hover:text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {b.name}
                </span>
                <span
                  className="mt-1 text-xs text-[#C4933F] opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {b.count} modelos
                </span>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

    </>
  );
}
