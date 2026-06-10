import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import TractorCard from "@/components/listings/TractorCard";
import FilterPanel from "@/components/listings/FilterPanel";
import HorizontalSubtypeSwitcher from "@/components/listings/HorizontalSubtypeSwitcher";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { CATEGORIES } from "@/lib/categories";
import { getListings, getMakes, getCountries } from "@data/listings";
import type { ListingFilters } from "@data/listings";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currencies";
import { LANG_COOKIE, DEFAULT_LANG, getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const AGRICULTURAL_BRANDS = ["New Holland", "John Deere", "Massey Ferguson", "Kubota"];

const PAGE_SIZE = 12;

function buildPageUrl(
  searchParams: Record<string, string | string[] | undefined>,
  page: number
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (k === "page" || v == null) continue;
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else params.set(k, v);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

function PaginationLink({
  href,
  label,
  active = false,
  disabled = false,
}: {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span
        className="rounded-xl border border-[#E8E4DB] bg-white px-3.5 py-2 text-sm text-[#9B9590] cursor-not-allowed opacity-40 select-none"
        style={{ fontFamily: "var(--font-body)" }}
        aria-disabled="true"
      >
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-[#004389] bg-[#004389] text-white"
          : "border-[#E8E4DB] bg-white text-[#6B6560] hover:bg-[#F4F2ED]"
      }`}
      style={{ fontFamily: "var(--font-body)" }}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export const metadata: Metadata = {
  title: "Tractores Nuevos: New Holland, John Deere, Massey Ferguson y Kubota | Wings Global Trade",
  description: "34 modelos de tractores nuevos en venta con precio de importación total. New Holland, John Deere, Massey Ferguson y Kubota — flete, aranceles y entrega incluidos. Perú, Bolivia, Chile y LATAM.",
  alternates: { canonical: "https://wingsglobaltrade.com/agricultural/tractors" },
};

interface PageProps {
  searchParams: {
    brand?:     string | string[];
    condition?: string | string[];
    country?:   string;
    yearFrom?:  string;
    yearTo?:    string;
    priceMin?:  string;
    priceMax?:  string;
    hpMin?:     string;
    hpMax?:     string;
    sort?:      string;
    page?:      string;
  };
}

export default async function TractorsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const currency    = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const lang        = cookieStore.get(LANG_COOKIE)?.value     ?? DEFAULT_LANG;

  const filters: ListingFilters = {
    brand:     searchParams.brand || AGRICULTURAL_BRANDS,
    condition: searchParams.condition,
    country:   searchParams.country  || undefined,
    yearFrom:  searchParams.yearFrom ? Number(searchParams.yearFrom) : undefined,
    yearTo:    searchParams.yearTo   ? Number(searchParams.yearTo)   : undefined,
    priceMin:  searchParams.priceMin ? Number(searchParams.priceMin) : undefined,
    priceMax:  searchParams.priceMax ? Number(searchParams.priceMax) : undefined,
    hpMin:     searchParams.hpMin    ? Number(searchParams.hpMin)    : undefined,
    hpMax:     searchParams.hpMax    ? Number(searchParams.hpMax)    : undefined,
    sort:      searchParams.sort     || undefined,
  };

  const currentPage = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const [t, allListings, allMakes, countries] = await Promise.all([
    getTranslations(lang),
    getListings(filters),
    getMakes(),
    getCountries(),
  ]);
  const makes = allMakes.filter((m) => AGRICULTURAL_BRANDS.includes(m));

  const totalCount = allListings.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const listings = allListings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterCount = [
    searchParams.brand, searchParams.condition, searchParams.country,
    searchParams.yearFrom, searchParams.yearTo, searchParams.priceMin,
    searchParams.priceMax, searchParams.hpMin, searchParams.hpMax,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Page header */}
      <div className="bg-[#004389] py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <nav
            className="mb-4 flex items-center gap-2 text-xs text-white/30"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Link href="/" className="hover:text-white/60 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-white/60 transition-colors">Catálogo</Link>
            <span>/</span>
            <Link href="/agricultural" className="hover:text-white/60 transition-colors">Agrícola</Link>
            <span>/</span>
            <span className="text-white/50">Tractores</span>
          </nav>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Maquinaria agrícola
              </p>
              <h1
                className="text-3xl font-semibold text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Tractores
              </h1>
              <p
                className="mt-1.5 text-sm text-white/40"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {totalCount} modelo{totalCount !== 1 ? "s" : ""} · página {currentPage} de {totalPages}
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-[#C4933F] px-2 py-0.5 text-[10px] font-semibold text-white">
                    {activeFilterCount} filtro{activeFilterCount > 1 ? "s" : ""} activo{activeFilterCount > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtype switcher */}
      <HorizontalSubtypeSwitcher
        category={CATEGORIES.find((c) => c.slug === "agricultural")!}
        activeSlug="tractors"
      />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-10">

          {/* Filter sidebar */}
          <aside className="mb-8 lg:mb-0">
            <Suspense fallback={
              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-5 text-sm text-[#9B9590]"
                style={{ fontFamily: "var(--font-body)" }}>
                Cargando filtros…
              </div>
            }>
              <FilterPanel
                makes={makes}
                countries={countries}
                t={{
                  filters:         t.filters,
                  clearAll:        t.clearAll,
                  makeLabel:       t.makeLabel,
                  conditionLabel:  t.conditionLabel,
                  yearLabel:       t.yearLabel,
                  priceLabel:      t.priceLabel,
                  countryLabel:    t.countryLabel,
                  anyLabel:        t.anyLabel,
                  condAny:         t.condAny,
                  condNew:         t.condNew,
                  condUsed:        t.condUsed,
                  condRefurbished: t.condRefurbished,
                  sortBy:          t.sortBy,
                  sortNewest:      t.sortNewest,
                  sortPriceAsc:    t.sortPriceAsc,
                  sortPriceDesc:   t.sortPriceDesc,
                  sortHoursAsc:    t.sortHoursAsc,
                }}
              />
            </Suspense>
          </aside>

          {/* Listing grid */}
          <div className="lg:col-span-3">

            {/* KAMA trucks banner */}
            <div className="mb-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-[#6BA3C8]/30 bg-[#062663] px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6BA3C8]"
                  style={{ fontFamily: "var(--font-body)" }}>
                  Nuevo en catálogo
                </p>
                <p className="text-sm text-white/70" style={{ fontFamily: "var(--font-body)" }}>
                  27 modelos de camiones KAMA — combustión y eléctrico (BEV)
                </p>
              </div>
              <Link
                href="/camiones"
                className="flex-shrink-0 rounded-full bg-[#6BA3C8] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Ver camiones →
              </Link>
            </div>

            {/* Import CTA banner */}
            <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-[#C4933F]/20 bg-[#062663] px-5 py-4 sm:flex-row sm:items-center">
              <p
                className="text-sm text-white/60"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ¿No encuentras exactamente lo que buscas?
              </p>
              <Link
                href="/importacion"
                className="flex-shrink-0 rounded-full bg-[#C4933F] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Importamos cualquier modelo →
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E4DB] bg-white py-24 text-center">
                <p
                  className="text-lg font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Sin resultados
                </p>
                <p
                  className="mt-2 text-sm text-[#9B9590]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Ningún tractor coincide con tus filtros.
                </p>
                <Link
                  href="/agricultural/tractors"
                  className="mt-6 text-xs font-semibold uppercase tracking-widest text-[#C4933F] hover:underline underline-offset-2"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Limpiar filtros →
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <TractorCard
                    key={listing.id}
                    listing={listing}
                    currency={currency}
                    t={t}
                    lang={lang}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Paginación">
                <PaginationLink
                  href={buildPageUrl(searchParams, currentPage - 1)}
                  disabled={currentPage <= 1}
                  label="← Anterior"
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationLink
                    key={p}
                    href={buildPageUrl(searchParams, p)}
                    active={p === currentPage}
                    label={String(p)}
                  />
                ))}
                <PaginationLink
                  href={buildPageUrl(searchParams, currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  label="Siguiente →"
                />
              </nav>
            )}
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}
