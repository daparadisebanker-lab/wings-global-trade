import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import TractorCard from "@/components/listings/TractorCard";
import { getListings } from "@data/listings";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currencies";
import { LANG_COOKIE, DEFAULT_LANG, getTranslations } from "@/lib/i18n";
import { KAMA_SERIES } from "@/lib/kama-series";

export const metadata: Metadata = {
  title: "Camiones KAMA — 9 series, 27 modelos | Wings Global Trade",
  description: "Catálogo completo KAMA: W, X, V, M3, M6, GM, EW/EV, ES/ESP, EX/EM. Camiones de combustión y eléctricos (BEV). Precio landed total para Latinoamérica.",
};

export const dynamic = "force-dynamic";

export default async function KamaBrandPage() {
  const cookieStore = await cookies();
  const currency    = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const lang        = cookieStore.get(LANG_COOKIE)?.value     ?? DEFAULT_LANG;

  const [t, allKama] = await Promise.all([
    getTranslations(lang),
    getListings({ brand: "KAMA" }),
  ]);

  const listingById = Object.fromEntries(allKama.map((l) => [l.id, l]));

  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#001E50]">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 75% 40%, #C4933F 0%, transparent 55%)" }} />
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">

          <nav className="mb-4 flex items-center gap-2 text-xs text-white/30" style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/" className="hover:text-white/60 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/camiones" className="hover:text-white/60 transition-colors">Camiones</Link>
            <span>/</span>
            <span className="text-white/50">KAMA</span>
          </nav>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}>
            Marca — Shandong KAMA
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            KAMA Trucks
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/40" style={{ fontFamily: "var(--font-body)" }}>
            9 series · 27 modelos · Combustión Euro-IV a Euro-VI · Eléctrico BEV hasta 360 km de autonomía. RHD disponible en todas las series.
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap gap-8 border-t border-white/10 pt-6">
            {[
              { value: String(allKama.length), label: "Modelos disponibles" },
              { value: "9", label: "Series" },
              { value: "Euro-VI / BEV", label: "Máx. estándar" },
              { value: "RHD", label: "Opción disponible" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-semibold text-[#C4933F]" style={{ fontFamily: "var(--font-display)" }}>
                  {s.value}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/30" style={{ fontFamily: "var(--font-body)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SERIES NAV ────────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b border-[#E8E4DB] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none">
            {KAMA_SERIES.map((serie) => (
              <a
                key={serie.slug}
                href={`#serie-${serie.slug}`}
                className="flex-shrink-0 rounded-full border border-[#E8E4DB] bg-[#F8F6F0] px-3.5 py-1.5 text-[10px] font-semibold text-[#6B6560] transition-colors hover:border-[#C4933F]/50 hover:text-[#C4933F] whitespace-nowrap"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {serie.label}
                <span className="ml-1.5 rounded-full bg-[#E8E4DB] px-1.5 py-0.5 text-[8px] font-semibold text-[#9B9590]">
                  {serie.modelIds.length}
                </span>
              </a>
            ))}
            <Link
              href="/cotizar"
              className="ml-auto flex-shrink-0 rounded-full bg-[#C4933F] px-4 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Cotizar →
            </Link>
          </div>
        </div>
      </div>

      {/* ── SERIES SECTIONS ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {KAMA_SERIES.map((serie, i) => {
          const models = serie.modelIds.map((id) => listingById[id]).filter(Boolean);

          return (
            <section
              key={serie.slug}
              id={`serie-${serie.slug}`}
              className={`${i > 0 ? "mt-16 border-t border-[#E8E4DB] pt-14" : ""}`}
            >
              {/* Section header */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2.5">
                    <div className="h-1 w-6 rounded-full" style={{ backgroundColor: serie.accent }} />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ fontFamily: "var(--font-body)", color: serie.accent }}>
                      {serie.fuel}
                    </p>
                    {serie.badge && (
                      <span className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
                        style={{ fontFamily: "var(--font-body)", borderColor: serie.accent, color: serie.accent }}>
                        {serie.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold text-[#1C1A16] sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                    {serie.label}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
                    {serie.subtitle}
                  </p>
                  <p className="mt-2 max-w-lg text-sm text-[#6B6560] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {serie.description}
                  </p>
                </div>

                {/* Mini specs + sub-page link */}
                <div className="flex-shrink-0 rounded-xl border border-[#E8E4DB] bg-white p-4 sm:w-48">
                  <div className="space-y-2">
                    {[
                      { label: "Potencia", value: serie.hpRange },
                      { label: "Carga útil", value: serie.payload },
                      { label: "GVW", value: serie.gvwRange },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between gap-2">
                        <span className="text-[9px] uppercase tracking-wide text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                          {s.label}
                        </span>
                        <span className="text-[10px] font-semibold text-[#1C1A16] text-right" style={{ fontFamily: "var(--font-body)" }}>
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/brands/kama/${serie.slug}`}
                    className="mt-4 flex w-full items-center justify-center gap-1 rounded-full border border-[#E8E4DB] py-2 text-[10px] font-semibold text-[#6B6560] transition-colors hover:border-[#C4933F] hover:text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Ver página de serie →
                  </Link>
                </div>
              </div>

              {/* Model cards */}
              {models.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {models.map((listing) => (
                    <TractorCard
                      key={listing.id}
                      listing={listing}
                      currency={currency}
                      t={t}
                      lang={lang}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#E8E4DB] py-8 text-center">
                  <p className="text-sm text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                    Modelos disponibles bajo pedido —{" "}
                    <Link href="/cotizar" className="font-semibold text-[#C4933F] hover:underline">
                      solicitar cotización
                    </Link>
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ── OTHER BRANDS ──────────────────────────────────────────────────── */}
      <div className="border-t border-[#E8E4DB]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}>
            También en catálogo — Maquinaria agrícola
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { name: "New Holland", slug: "new-holland" },
              { name: "John Deere", slug: "john-deere" },
              { name: "Massey Ferguson", slug: "massey-ferguson" },
              { name: "Kubota", slug: "kubota" },
            ].map((b) => (
              <Link
                key={b.slug}
                href={`/brands/${b.slug}`}
                className="rounded-full border border-[#E8E4DB] bg-white px-5 py-2.5 text-sm font-medium text-[#6B6560] transition-colors hover:border-[#C4933F] hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
