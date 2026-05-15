import HorizontalSubtypeSwitcher from "./HorizontalSubtypeSwitcher";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  title: string;
  filterTypes: string[];
  categorySlug?: string;
  activeSlug?: string;
}

export default function ComingSoonCategory({ title, filterTypes, categorySlug, activeSlug }: Props) {
  const category = categorySlug ? CATEGORIES.find(c => c.slug === categorySlug) : null;

  return (
    <div className="min-h-screen bg-cream-50">

      {/* Page header */}
      <div className="border-b border-brown-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label mb-1">Inventory</p>
              <h1 className="font-serif text-3xl font-semibold text-brown-900">{title}</h1>
              <p className="mt-1 text-sm text-brown-500">Europe-wide listings from verified dealers</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs uppercase tracking-widest text-brown-500">Sort</label>
              <select className="border border-brown-300 bg-white px-3 py-2 text-sm text-brown-800 focus:border-brown-600 focus:outline-none">
                <option>Newest First</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Lowest Hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Subtype Switcher */}
      {category && activeSlug && (
        <HorizontalSubtypeSwitcher category={category} activeSlug={activeSlug} />
      )}

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-10">

          {/* Sidebar */}
          <aside className="mb-8 lg:mb-0">
            <div className="border border-brown-200 bg-white">
              <div className="flex items-center justify-between border-b border-brown-100 px-5 py-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-brown-800">Filters</span>
                <button className="text-xs text-brown-400 hover:text-brown-700 uppercase tracking-wide">Clear all</button>
              </div>
              <div className="divide-y divide-brown-100">
                <div className="px-5 py-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brown-500">Condition</p>
                  {["Any", "New", "Used", "Refurbished"].map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-brown-700">
                      <input type="radio" name="condition" defaultChecked={c === "Any"} className="accent-brown-700" />
                      {c}
                    </label>
                  ))}
                </div>
                <div className="px-5 py-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brown-500">Type</p>
                  {["Any", ...filterTypes].map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-brown-700">
                      <input type="radio" name="type" defaultChecked={c === "Any"} className="accent-brown-700" />
                      {c}
                    </label>
                  ))}
                </div>
                <div className="px-5 py-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brown-500">Make</p>
                  <input type="text" placeholder="e.g. John Deere" className="input-field !py-1.5 !text-xs" />
                </div>
                <div className="px-5 py-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brown-500">Year</p>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="From" className="input-field !py-1.5 !text-xs" />
                    <span className="text-brown-400">—</span>
                    <input type="number" placeholder="To" className="input-field !py-1.5 !text-xs" />
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brown-500">Price (EUR)</p>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" className="input-field !py-1.5 !text-xs" />
                    <span className="text-brown-400">—</span>
                    <input type="number" placeholder="Max" className="input-field !py-1.5 !text-xs" />
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brown-500">Country</p>
                  <select className="input-field !py-1.5 !text-xs">
                    <option value="">All countries</option>
                  </select>
                </div>
              </div>
              <div className="p-5">
                <button className="btn-primary w-full text-xs uppercase tracking-widest">Apply Filters</button>
              </div>
            </div>
          </aside>

          {/* Listings area */}
          <div className="lg:col-span-3">
            <div className="flex min-h-[420px] flex-col items-center justify-center border border-brown-200 bg-white p-12 text-center">
              <p className="font-serif text-2xl font-semibold text-brown-300">Coming Soon</p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-brown-400">
                Listings for this section are coming soon. Verified dealers will be added shortly.
              </p>
              <p className="mt-2 text-xs uppercase tracking-widest text-brown-300">Check back soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
