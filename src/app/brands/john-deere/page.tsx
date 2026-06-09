import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import TractorCard from "@/components/listings/TractorCard";
import { getListings } from "@data/listings";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currencies";
import { LANG_COOKIE, DEFAULT_LANG, getTranslations } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Tractores John Deere en Perú y LATAM — Importación con Precio Landed | Wings Global Trade",
  description: "9 modelos de tractores John Deere series 5B, 5E, 6B y 6E importados desde Asia. Rango 70–140 hp. Precio total con flete, aranceles y entrega para Perú, Bolivia, Chile y LATAM.",
  alternates: { canonical: "https://wingsglobaltrade.com/brands/john-deere" },
};

export const dynamic = "force-dynamic";

export default async function JohnDeerePage() {
  const cookieStore = await cookies();
  const currency    = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const lang        = cookieStore.get(LANG_COOKIE)?.value     ?? DEFAULT_LANG;

  const [t, listings] = await Promise.all([
    getTranslations(lang),
    getListings({ brand: "John Deere" }),
  ]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Hero */}
      <div className="bg-[#004389] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <nav
            className="mb-4 flex items-center gap-2 text-xs text-white/30"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Link href="/" className="hover:text-white/60 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/agricultural/tractors" className="hover:text-white/60 transition-colors">Tractores</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-white/60 transition-colors">Por marca</Link>
            <span>/</span>
            <span className="text-white/50">John Deere</span>
          </nav>

          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Tractores — Marca
          </p>
          <h1
            className="text-3xl font-semibold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            John Deere
          </h1>
          <p
            className="mt-2 max-w-lg text-sm text-white/40"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Serie China — modelos 5B, 5E, 6B y 6E fabricados específicamente para mercados en desarrollo. Soporte técnico y red de repuestos regional en Latinoamérica.
          </p>

          {/* Stats bar */}
          <div className="mt-8 flex flex-wrap gap-8 border-t border-white/10 pt-6">
            {[
              { value: String(listings.length), label: "Modelos disponibles" },
              { value: "70–140 hp", label: "Rango de potencia" },
              { value: "5B · 5E · 6B · 6E", label: "Series" },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="text-2xl font-semibold text-[#C4933F]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.value}
                </p>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide text-white/30"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
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

        {/* Other brands */}
        <div className="mt-14 border-t border-[#E8E4DB] pt-10">
          <p
            className="mb-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Otras marcas disponibles
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { name: "New Holland", count: 14, slug: "new-holland" },
              { name: "Massey Ferguson", count: 6, slug: "massey-ferguson" },
              { name: "Kubota", count: 5, slug: "kubota" },
            ].map((b) => (
              <Link
                key={b.slug}
                href={`/brands/${b.slug}`}
                className="flex items-center gap-2 rounded-full border border-[#E8E4DB] bg-white px-5 py-2.5 text-sm font-medium text-[#6B6560] transition-colors hover:border-[#C4933F] hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {b.name}
                <span className="text-[10px] font-semibold text-[#C4933F]">{b.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/brands"
            className="text-sm text-[#9B9590] transition-colors hover:text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            ← Ver todas las marcas
          </Link>
          <Link
            href="/agricultural/tractors"
            className="text-sm text-[#9B9590] transition-colors hover:text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </div>
  );
}
