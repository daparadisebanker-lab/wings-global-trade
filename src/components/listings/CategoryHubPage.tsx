import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/categories";

interface Props {
  category: Category;
  comingSoonExtra?: { label: string; unsplashId: string }[];
}

/**
 * Reusable hub page layout for any top-level category.
 * Shows active sub-types as linked cards and coming-soon items as greyed overlays.
 */
export default function CategoryHubPage({ category, comingSoonExtra = [] }: Props) {
  const activeSubtypes  = category.subtypes.filter((s) => !s.comingSoon);
  const comingSoonItems = category.subtypes.filter((s) => s.comingSoon);
  const allComingSoon   = [...comingSoonItems, ...comingSoonExtra];

  return (
    <div className="min-h-screen bg-cream-50">

      {/* Page header */}
      <div className="border-b border-brown-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Browse by Category</p>
          <h1 className="font-serif text-4xl font-semibold text-brown-900">
            {category.label}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brown-500">
            {category.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

        {/* Active sub-types */}
        {activeSubtypes.length > 0 && (
          <>
            <div className="mb-8">
              <p className="section-label mb-1">Equipment Types</p>
              <h2 className="font-serif text-2xl font-semibold text-brown-900">
                Browse Available Inventory
              </h2>
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {activeSubtypes.map((sub) => (
                sub.icon ? (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="group flex h-64 flex-col items-center justify-center border border-brown-200 bg-white p-6 text-center transition-colors duration-300 hover:border-brown-400 hover:bg-brown-50/50"
                  >
                    <div className="relative mb-6 h-20 w-32 opacity-80 transition-opacity duration-300 group-hover:opacity-100 text-brown-900">
                      <Image
                        src={sub.icon}
                        alt={sub.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="font-serif text-xl font-semibold text-brown-900 transition-colors duration-300">
                      {sub.label}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-widest text-brown-400">
                      {sub.count} listings
                    </p>
                  </Link>
                ) : (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="group relative h-64 overflow-hidden border border-brown-200"
                  >
                    <Image
                      src={`https://images.unsplash.com/${sub.unsplashId}?w=600&q=80`}
                      alt={sub.label}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-brown-900/55 transition-colors duration-300 group-hover:bg-brown-900/70" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <p className="font-serif text-xl font-semibold text-cream-50">
                        {sub.label}
                      </p>
                      <p className="mt-1 text-xs text-brown-300">
                        {sub.count} listings
                      </p>
                      <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-widest text-cream-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Browse {sub.label} →
                      </span>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </>
        )}

        {/* Coming-soon items */}
        {allComingSoon.length > 0 && (
          <div className={activeSubtypes.length > 0 ? "mt-10" : ""}>
            {activeSubtypes.length > 0 && (
              <div className="mb-6">
                <p className="section-label mb-1">Expanding Soon</p>
                <h2 className="font-serif text-xl font-semibold text-brown-700">
                  More Types Coming
                </h2>
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allComingSoon.map((item) => (
                <div
                  key={item.label}
                  className="relative h-48 overflow-hidden border border-brown-200 cursor-default"
                >
                  <Image
                    src={`https://images.unsplash.com/${item.unsplashId}?w=600&q=80`}
                    alt={item.label}
                    fill
                    className="object-cover grayscale"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-brown-900/70" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <p className="font-serif text-lg font-semibold text-brown-400">
                      {item.label}
                    </p>
                    <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-widest text-brown-500">
                      Coming Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust strip */}
        <div className="mt-14 border border-brown-200 bg-white p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { title: "Verified Listings",     body: "Every unit inspected and certified before listing." },
              { title: "Pan-European Stock",     body: "Sourced from verified dealers across 28 countries." },
              { title: "Door-to-Door Delivery",  body: "Full logistics and cross-border documentation handled." },
            ].map((item) => (
              <div key={item.title}>
                <p className="font-serif text-sm font-semibold text-brown-900">{item.title}</p>
                <div className="mt-2 h-px w-8 bg-brown-300" />
                <p className="mt-3 text-xs leading-relaxed text-brown-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
