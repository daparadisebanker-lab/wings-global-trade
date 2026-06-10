import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types";

const BRAND_SLUGS: Record<string, string> = {
  "New Holland":      "/brands/new-holland",
  "John Deere":       "/brands/john-deere",
  "Massey Ferguson":  "/brands/massey-ferguson",
  "Kubota":           "/brands/kubota",
};

const fmt = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type Props = {
  listings: Listing[];
};

/**
 * Featured machinery — real inventory from the live catalog (Supabase →
 * catalog fallback), restored from the previous homepage and recast in the
 * new visual system on the 12-column grid. Server component, zero JS.
 */
export default function FeaturedMachinery({ listings }: Props) {
  return (
    <section data-theme-section="light" className="wings-wm-light bg-paper py-24 text-ink">
      <div className="wings-container">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p
              className="mb-3 uppercase tracking-[0.22em] text-graphite"
              style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
            >
              Catálogo activo · 4 marcas
            </p>
            <h2
              className="wings-display m-0 uppercase"
              style={{ fontSize: "var(--type-title)", lineHeight: 1.02 }}
            >
              Disponible ahora
            </h2>
          </div>
          <Link
            href="/agricultural/tractors"
            className="border border-ink px-7 py-3 uppercase tracking-[0.16em] text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
            style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
          >
            Ver inventario completo
          </Link>
        </div>

        <div className="wings-grid">
          {listings.map((l) => (
            <Link
              key={l.id}
              href={`/agricultural/tractors/${l.id}`}
              className="group col-span-12 border border-steel transition-colors duration-200 hover:border-ink md:col-span-6 lg:col-span-4"
            >
              {/* product plates are shot on white — the image area matches */}
              <div className="relative aspect-square overflow-hidden bg-white">
                {l.images?.[0] ? (
                  <Image
                    src={l.images[0]}
                    alt={l.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span
                      className="uppercase tracking-[0.2em] text-steel"
                      style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
                    >
                      {l.brand}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t border-steel p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p
                    className="m-0 uppercase tracking-[0.18em] text-graphite"
                    style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
                  >
                    {l.horsepower ? `${l.horsepower} hp` : ""}
                    {l.year ? ` · ${l.year}` : ""}
                  </p>
                  <span
                    className="border border-steel px-2 py-0.5 uppercase tracking-[0.12em] text-graphite"
                    style={{ fontFamily: "var(--font-data)", fontSize: "9px" }}
                  >
                    {l.brand}
                  </span>
                </div>
                <h3
                  className="wings-display m-0 mb-3 uppercase"
                  style={{ fontSize: "clamp(18px, 1.6vw, 24px)", lineHeight: 1.15 }}
                >
                  {l.model}
                </h3>
                <p
                  className="m-0 text-ink"
                  style={{ fontFamily: "var(--font-data)", fontSize: "15px" }}
                >
                  {l.price > 0 ? fmt.format(l.price) : "Precio a cotizar"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Brands footer strip */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-y-8 border-t border-steel pt-10">
          <div>
            <p
              className="mb-4 uppercase tracking-[0.22em] text-graphite"
              style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
            >
              Marcas disponibles
            </p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(BRAND_SLUGS).map(([name, href]) => (
                <Link
                  key={name}
                  href={href}
                  className="border border-steel px-4 py-2 uppercase tracking-[0.14em] text-graphite transition-colors duration-200 hover:border-ink hover:text-ink"
                  style={{ fontFamily: "var(--font-data)", fontSize: "10px" }}
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/brands"
            className="border border-oxide px-7 py-3 uppercase tracking-[0.16em] text-oxide transition-colors duration-200 hover:bg-oxide hover:text-paper"
            style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
          >
            Ver todas las marcas →
          </Link>
        </div>
      </div>
    </section>
  );
}
