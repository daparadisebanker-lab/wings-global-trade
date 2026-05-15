import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import TractorCard from "@/components/listings/TractorCard";
import FilterPanel, { SortBar } from "@/components/listings/FilterPanel";
import HorizontalSubtypeSwitcher from "@/components/listings/HorizontalSubtypeSwitcher";
import { CATEGORIES } from "@/lib/categories";
import { getListings, getMakes, getCountries } from "@data/listings";
import type { ListingFilters } from "@data/listings";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currencies";
import { LANG_COOKIE, DEFAULT_LANG, getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tractors for Sale",
  description: "Browse new and used tractors from verified dealers across Europe.",
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
  };
}

export default async function TractorsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const currency    = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const lang        = cookieStore.get(LANG_COOKIE)?.value     ?? DEFAULT_LANG;

  // Build filter object from URL params
  const filters: ListingFilters = {
    brand:     searchParams.brand,
    condition: searchParams.condition,
    country:   searchParams.country   || undefined,
    yearFrom:  searchParams.yearFrom  ? Number(searchParams.yearFrom)  : undefined,
    yearTo:    searchParams.yearTo    ? Number(searchParams.yearTo)    : undefined,
    priceMin:  searchParams.priceMin  ? Number(searchParams.priceMin)  : undefined,
    priceMax:  searchParams.priceMax  ? Number(searchParams.priceMax)  : undefined,
    hpMin:     searchParams.hpMin     ? Number(searchParams.hpMin)     : undefined,
    hpMax:     searchParams.hpMax     ? Number(searchParams.hpMax)     : undefined,
    sort:      searchParams.sort      || undefined,
  };

  const [t, listings, makes, countries] = await Promise.all([
    getTranslations(lang),
    getListings(filters),
    getMakes(),
    getCountries(),
  ]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-cream-50">

      {/* Page header */}
      <div className="border-b border-brown-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label mb-1">Inventory</p>
              <h1 className="font-serif text-3xl font-semibold text-brown-900">{t.tractorsTitle}</h1>
              <p className="mt-1 text-sm text-brown-500">
                {t.tractorsCount(listings.length)}
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-brown-800 px-2 py-0.5 text-[10px] font-semibold text-cream-50">
                    {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs uppercase tracking-widest text-brown-500">{t.sortBy}</label>
              <Suspense fallback={
                <select className="border border-brown-300 bg-white px-3 py-2 text-sm text-brown-800">
                  <option>Newest first</option>
                </select>
              }>
                <SortBar currentSort={searchParams.sort ?? ""} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <HorizontalSubtypeSwitcher
        category={CATEGORIES.find((c) => c.slug === "agricultural")!}
        activeSlug="tractors"
      />

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-10">

          {/* Sidebar filter panel */}
          <aside className="mb-8 lg:mb-0">
            <div className="border border-brown-200 bg-white">
              <Suspense fallback={<div className="p-5 text-sm text-brown-400">Loading filters…</div>}>
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
            </div>
          </aside>

          {/* Listing grid */}
          <div className="lg:col-span-3">
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-lg font-medium text-brown-700">No listings match your filters.</p>
                <p className="mt-2 text-sm text-brown-400">Try adjusting or clearing your filters.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <TractorCard key={listing.id} listing={listing} currency={currency} t={t} lang={lang} />
                ))}
              </div>
            )}

            {/* Pagination — placeholder for future */}
            {listings.length > 0 && (
              <div className="mt-12 flex items-center justify-center gap-1">
                <button disabled className="border border-brown-200 px-4 py-2 text-sm text-brown-300">
                  {t.pagination_prev}
                </button>
                <button className="border border-brown-800 bg-brown-800 px-4 py-2 text-sm text-cream-50">
                  1
                </button>
                <button className="border border-brown-200 px-4 py-2 text-sm text-brown-600 hover:bg-brown-50">
                  {t.pagination_next}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
