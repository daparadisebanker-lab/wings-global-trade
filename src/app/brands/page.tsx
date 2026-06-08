import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tractores por Marca — Wings Global Trade",
  description: "Explora tractores por marca: New Holland, John Deere, Massey Ferguson y Kubota. Modelos 50–140 hp disponibles con precio landed total.",
};

const BRANDS = [
  {
    name: "New Holland",
    slug: "new-holland",
    count: 14,
    hpRange: "50–140 hp",
    description: "Marca global de CNH Industrial. Tractores de alta fiabilidad para mercados en desarrollo, rango completo 50–140 hp con tracción 4WD disponible.",
  },
  {
    name: "John Deere",
    slug: "john-deere",
    count: 9,
    hpRange: "70–140 hp",
    description: "Serie China — modelos 5B, 5E, 6B y 6E fabricados para mercados en desarrollo. Soporte técnico regional.",
  },
  {
    name: "Massey Ferguson",
    slug: "massey-ferguson",
    count: 6,
    hpRange: "80–120 hp",
    description: "Marca AGCO con modelos ISEKI. Tractores compactos y medianos de alta fiabilidad, 80 a 120 hp.",
  },
  {
    name: "Kubota",
    slug: "kubota",
    count: 5,
    hpRange: "70–100 hp",
    description: "Tractores japoneses de precisión. Rango compacto de 70 a 100 hp — ideales para fincas medianas.",
  },
];

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* Hero */}
      <div className="bg-[#001E50] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <nav
            className="mb-4 flex items-center gap-2 text-xs text-white/30"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Link href="/" className="hover:text-white/60 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/agricultural/tractors" className="hover:text-white/60 transition-colors">Tractores</Link>
            <span>/</span>
            <span className="text-white/50">Por marca</span>
          </nav>
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Catálogo de tractores
          </p>
          <h1
            className="text-3xl font-semibold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Explorar por marca
          </h1>
          <p className="mt-2 text-sm text-white/40" style={{ fontFamily: "var(--font-body)" }}>
            4 marcas · 34 modelos disponibles
          </p>
        </div>
      </div>

      {/* Brand grid */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="group flex flex-col rounded-2xl border border-[#E8E4DB] bg-white p-8 transition-all hover:border-[#C4933F]/30 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {brand.hpRange}
                  </p>
                  <h2
                    className="mt-1 text-2xl font-semibold text-[#1C1A16]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {brand.name}
                  </h2>
                </div>
                <div className="rounded-xl bg-[#F8F6F0] px-4 py-2 text-center flex-shrink-0">
                  <p
                    className="text-2xl font-semibold text-[#001E50]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {brand.count}
                  </p>
                  <p
                    className="text-[9px] font-semibold uppercase tracking-wide text-[#9B9590]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    modelos
                  </p>
                </div>
              </div>
              <p
                className="mt-4 text-sm leading-relaxed text-[#6B6560]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {brand.description}
              </p>
              <span
                className="mt-6 self-start text-xs font-semibold uppercase tracking-widest text-[#C4933F] transition-colors group-hover:underline"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Ver modelos →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/agricultural/tractors"
            className="text-sm text-[#9B9590] transition-colors hover:text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            ← Ver todos los tractores
          </Link>
        </div>
      </div>
    </div>
  );
}
