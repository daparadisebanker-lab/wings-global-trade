import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getListings } from "@data/listings";
import FeaturedCarousel from "@/components/listings/FeaturedCarousel";
import HpFinder from "@/components/listings/HpFinder";
import { DEFAULT_CURRENCY } from "@/lib/currencies";
import { DEFAULT_LANG, getTranslations } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Euro Global | Maquinaria Agrícola desde Asia para Latinoamérica",
  description:
    "86 tractores nuevos de YTO, SinoHarvest, John Deere y Massey Ferguson. Precio landed con flete, aranceles y entrega en Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay.",
};

const FEATURED_BG =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80";

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
  { name: "YTO",             count: 31 },
  { name: "SinoHarvest",     count: 28 },
  { name: "John Deere",      count: 16 },
  { name: "Massey Ferguson", count: 6  },
  { name: "Kubota",          count: 5  },
];

const TESTIMONIALS = [
  {
    name:    "Andrés Villanueva",
    location: "Santa Cruz, Bolivia",
    machine:  "YTO X1304 — 130hp · 4WD",
    quote:    "Recibí el tractor en mi finca con todos los documentos de importación resueltos. El precio final fue exactamente el que me cotizaron.",
    img:      "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=500&q=80",
  },
  {
    name:    "Rodrigo Cárdenas",
    location: "Junín, Perú",
    machine:  "SinoHarvest SH1004 — 100hp · Cabina",
    quote:    "Comparé tres opciones con el asesor y elegimos el modelo que mejor se adaptaba al terreno. El proceso de importación fue completamente transparente.",
    img:      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&q=80",
  },
];

const BENEFITS = [
  {
    num:   "01",
    title: "Catálogo directo de fábrica",
    body:  "Trabajamos directamente con los fabricantes. Sin revendedores europeos ni márgenes ocultos. El precio que ves es el precio real de exportación.",
  },
  {
    num:   "02",
    title: "Cotización con costo landed",
    body:  "Tu cotización incluye flete marítimo, seguro, aranceles de importación y entrega hasta tu país de destino. Sin sorpresas al momento de la llegada.",
  },
  {
    num:   "03",
    title: "Acompañamiento experto",
    body:  "Un asesor en español te guía desde la selección del modelo hasta la entrega. Gestionamos la documentación, la aduana y la logística por ti.",
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
    { value: "86",    label: "Modelos disponibles" },
    { value: "40–210", label: "Rango de potencia (hp)" },
    { value: "5",     label: "Marcas de fábrica" },
    { value: "6",     label: "Países atendidos" },
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
        <div className="absolute inset-0 bg-[#001E50]/60" />
        {/* Gold radial accent */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at 60% 30%, #C4933F 0%, transparent 60%)" }}
        />
        {/* Bottom fade to page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8F6F0] to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-28 text-center lg:px-8">
          {/* Eyebrow markets pill */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-2 backdrop-blur-sm">
            <span className="text-[11px] font-medium tracking-widest text-white/60"
              style={{ fontFamily: "var(--font-body)" }}>
              Perú · Bolivia · Chile · Paraguay · Argentina · Uruguay
            </span>
          </div>

          <h1
            className="text-5xl font-semibold leading-tight text-white drop-shadow-sm sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Maquinaria agrícola de Asia
            <br />
            <span className="text-[#C4933F]">con precio landed y asesoría experta.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            86 tractores nuevos de YTO, SinoHarvest, John Deere y Massey Ferguson —
            cotizados con flete, aranceles y entrega hasta tu campo.
          </p>

          {/* HP Finder */}
          <HpFinder />

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <span className="pt-0.5 text-xs uppercase tracking-widest text-white/40"
              style={{ fontFamily: "var(--font-body)" }}>
              Más buscados:
            </span>
            {["YTO X904", "SinoHarvest SH1004", "John Deere 5E", "MF 1204"].map((term) => (
              <Link
                key={term}
                href="/agricultural/tractors"
                className="text-xs text-[#C4933F] underline-offset-2 hover:underline"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {term}
              </Link>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
            {TRUST_BADGES.map((b) => (
              <div key={b.title} className="border-l-2 border-[#C4933F]/40 pl-4 text-left">
                <p className="text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-body)" }}>{b.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50"
                  style={{ fontFamily: "var(--font-body)" }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS CAROUSEL ────────────────────────────────────── */}
      <section
        className="relative py-20"
        style={{
          backgroundImage: `url('${FEATURED_BG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#1C1A16]/85" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}>
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
              {t.viewAllListings} →
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

      {/* ── CATEGORY CARDS ────────────────────────────────────────────────── */}
      <section className="bg-[#F8F6F0] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}>
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

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="border-y border-[#E8E4DB] bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}>
                Compradores verificados
              </p>
              <h2
                className="text-3xl font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Lo que dicen nuestros clientes
              </h2>
            </div>
            <Link
              href="/agricultural/tractors"
              className="hidden text-xs font-semibold uppercase tracking-widest text-[#6B6560] underline-offset-4 hover:text-[#1C1A16] hover:underline sm:block"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver catálogo completo →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[#E8E4DB] sm:flex-row"
              >
                <div className="relative h-52 w-full shrink-0 sm:h-auto sm:w-48">
                  <Image
                    src={item.img}
                    alt={item.machine}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 192px"
                  />
                </div>
                <div className="flex flex-col justify-center p-7">
                  <p
                    className="text-base font-semibold text-[#1C1A16]"
                    style={{ fontFamily: "var(--font-display)" }}
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
                    className="mt-4 text-sm leading-relaxed text-[#6B6560]"
                    style={{ fontFamily: "var(--font-body)", fontStyle: "italic" }}
                  >
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <p
                    className="mt-4 text-xs text-[#6B6560]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.machine}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS ────────────────────────────────────────────────────────── */}
      <section className="bg-[#F8F6F0] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}>
              Fabricantes
            </p>
            <h2
              className="text-3xl font-semibold text-[#1C1A16]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Marcas disponibles en el catálogo
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-px border border-[#E8E4DB] bg-[#E8E4DB] sm:grid-cols-5">
            {BRANDS.map((b) => (
              <Link
                key={b.name}
                href={`/agricultural/tractors?brand=${encodeURIComponent(b.name)}`}
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
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ──────────────────────────────────────────────────────── */}
      <section className="border-y border-[#E8E4DB] bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}>
              Por qué elegirnos
            </p>
            <h2
              className="text-3xl font-semibold text-[#1C1A16]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Importación sin fricciones desde Asia
            </h2>
          </div>
          <div className="grid gap-px border border-[#E8E4DB] bg-[#E8E4DB] sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.num} className="bg-white p-10">
                <p
                  className="text-7xl font-semibold leading-none text-[#C4933F]/20"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {b.num}
                </p>
                <h3
                  className="mt-5 text-lg font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {b.title}
                </h3>
                <div className="mt-3 h-px w-12 bg-[#C4933F]" />
                <p
                  className="mt-4 text-sm leading-relaxed text-[#6B6560]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WINGS IMPORTACIÓN CROSSLINK ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#001E50] py-24">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 50%, #C4933F 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}>
            Importación desde Asia
          </p>
          <h2
            className="text-4xl font-semibold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ¿Tu empresa en Latinoamérica necesita maquinaria con precio final?
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-white/60"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Wings Global Trade gestiona toda la cadena — desde la selección en fábrica hasta la entrega en aduana. Precio landed confirmado. Documentación incluida.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/importacion"
              className="inline-flex items-center justify-center rounded-full bg-[#C4933F] px-10 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Conocer el servicio
            </Link>
            <Link
              href="/agricultural/tractors"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-10 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white/8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
