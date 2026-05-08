import type { Metadata } from "next";
import { cookies } from "next/headers";
import TractorCard from "@/components/listings/TractorCard";
import { listings, makes, countries } from "@/data/listings";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currencies";
import { LANG_COOKIE, DEFAULT_LANG, getTranslations } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Tractors for Sale",
  description: "Browse new and used tractors from verified dealers across Europe.",
};

export default async function TractorsPage() {
  const cookieStore = await cookies();
  const currency = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const lang     = cookieStore.get(LANG_COOKIE)?.value     ?? DEFAULT_LANG;
  const t        = await getTranslations(lang);

  const SORT_OPTIONS = [
    { label: t.sortNewest,   value: "newest"     },
    { label: t.sortPriceAsc, value: "price-asc"  },
    { label: t.sortPriceDesc,value: "price-desc" },
    { label: t.sortHoursAsc, value: "hours-asc"  },
  ];

  return (
    <div className="min-h-screen bg-cream-50">

      {/* Page header */}
      <div className="border-b border-brown-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label mb-1">Inventory</p>
              <h1 className="font-serif text-3xl font-semibold text-brown-900">{t.tractorsTitle}</h1>
              <p className="mt-1 text-sm text-brown-500">{t.tractorsCount(listings.length)}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs uppercase tracking-widest text-brown-500">{t.sortBy}</label>
              <select className="border border-brown-300 bg-white px-3 py-2 text-sm text-brown-800 focus:border-brown-600 focus:outline-none">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-10">

          {/* Sidebar */}
          <aside className="mb-8 lg:mb-0">
            <div className="border border-brown-200 bg-white">
              <div className="flex items-center justify-between border-b border-brown-100 px-5 py-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-brown-800">{t.filters}</span>
                <button className="text-xs text-brown-400 hover:text-brown-700 uppercase tracking-wide">
                  {t.clearAll}
                </button>
              </div>

              <div className="divide-y divide-brown-100">
                <FilterSection title={t.conditionLabel}>
                  {[t.condAny, t.condNew, t.condUsed, t.condRefurbished].map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-brown-700 hover:text-brown-900">
                      <input type="radio" name="condition" defaultChecked={c === t.condAny} className="accent-brown-700" />
                      {c}
                    </label>
                  ))}
                </FilterSection>

                <FilterSection title={t.makeLabel}>
                  <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-brown-700">
                    <input type="radio" name="make" defaultChecked className="accent-brown-700" />
                    {t.anyLabel}
                  </label>
                  {makes.map((make) => (
                    <label key={make} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-brown-700 hover:text-brown-900">
                      <input type="radio" name="make" className="accent-brown-700" />
                      {make}
                    </label>
                  ))}
                </FilterSection>

                <FilterSection title={t.yearLabel}>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="From" min={1990} max={2100} className="input-field !py-1.5 !text-xs" />
                    <span className="text-brown-400">—</span>
                    <input type="number" placeholder="To" min={1990} max={2100} className="input-field !py-1.5 !text-xs" />
                  </div>
                </FilterSection>

                <FilterSection title={t.priceLabel}>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" className="input-field !py-1.5 !text-xs" />
                    <span className="text-brown-400">—</span>
                    <input type="number" placeholder="Max" className="input-field !py-1.5 !text-xs" />
                  </div>
                </FilterSection>

                <FilterSection title={t.countryLabel} last>
                  <select className="input-field !py-1.5 !text-xs">
                    <option value="">{t.anyLabel}</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </FilterSection>
              </div>

              <div className="p-5">
                <button className="btn-primary w-full text-xs uppercase tracking-widest">
                  {t.applyFilters}
                </button>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <TractorCard key={listing.id} listing={listing} currency={currency} t={t} />
              ))}
            </div>

            {/* Pagination */}
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
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`px-5 py-4 ${last ? "" : ""}`}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brown-500">{title}</p>
      {children}
    </div>
  );
}
