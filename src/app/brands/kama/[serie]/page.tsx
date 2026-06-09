import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import TruckCard from "@/components/listings/TruckCard";
import { getListings } from "@data/listings";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currencies";
import { KAMA_SERIES, getSeriesBySlug } from "@/lib/kama-series";

interface PageProps {
  params: { serie: string };
}

export async function generateStaticParams() {
  return KAMA_SERIES.map((s) => ({ serie: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const serie = getSeriesBySlug(params.serie);
  if (!serie) return { title: "Serie no encontrada" };
  return {
    title: `KAMA ${serie.label} — ${serie.modelIds.length} modelo${serie.modelIds.length !== 1 ? "s" : ""} | Wings Global Trade`,
    description: `${serie.description} Importación con precio landed total para Latinoamérica.`,
  };
}

export const dynamic = "force-dynamic";

export default async function KamaSeriesPage({ params }: PageProps) {
  const serie = getSeriesBySlug(params.serie);
  if (!serie) notFound();

  const cookieStore = await cookies();
  const currency    = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;

  const allKama = await getListings({ brand: "KAMA" });

  const listings = serie.modelIds
    .map((id) => allKama.find((l) => l.id === id))
    .filter(Boolean) as Awaited<ReturnType<typeof getListings>>;

  const currentIndex = KAMA_SERIES.findIndex((s) => s.slug === serie.slug);
  const prevSerie = currentIndex > 0 ? KAMA_SERIES[currentIndex - 1] : null;
  const nextSerie = currentIndex < KAMA_SERIES.length - 1 ? KAMA_SERIES[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#001E50] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <nav className="mb-4 flex items-center gap-2 text-xs text-white/30" style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/" className="hover:text-white/60 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/camiones" className="hover:text-white/60 transition-colors">Camiones</Link>
            <span>/</span>
            <Link href="/brands/kama" className="hover:text-white/60 transition-colors">KAMA</Link>
            <span>/</span>
            <span className="text-white/50">{serie.label}</span>
          </nav>

          <div className="flex items-start gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-1 w-5 rounded-full" style={{ backgroundColor: serie.accent }} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ fontFamily: "var(--font-body)", color: serie.accent }}>
                  KAMA — {serie.fuel}
                </p>
                {serie.badge && (
                  <span className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-body)", borderColor: serie.accent, color: serie.accent }}>
                    {serie.badge}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                {serie.label}
              </h1>
              <p className="mt-1 text-sm text-white/40" style={{ fontFamily: "var(--font-body)" }}>
                {serie.subtitle}
              </p>
              <p className="mt-3 max-w-lg text-sm text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                {serie.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap gap-8 border-t border-white/10 pt-6">
            {[
              { value: String(listings.length), label: "Modelos" },
              { value: serie.hpRange, label: "Potencia" },
              { value: serie.payload, label: "Carga útil" },
              { value: serie.gvwRange, label: "GVW" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-data text-xl font-semibold text-[#C4933F]">
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

      {/* ── LISTINGS ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        {listings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <TruckCard
                key={listing.id}
                listing={listing}
                serieSlug={serie.slug}
                currency={currency}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8E4DB] bg-white py-20 text-center">
            <p className="text-lg font-semibold text-[#1C1A16]" style={{ fontFamily: "var(--font-display)" }}>
              Disponibles bajo pedido
            </p>
            <p className="mt-2 max-w-xs text-sm text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
              Los modelos de esta serie se importan a pedido con precio landed total.
            </p>
            <Link
              href="/cotizar"
              className="mt-6 rounded-full bg-[#C4933F] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar cotización →
            </Link>
          </div>
        )}

        {/* ── SERIES NAV ──────────────────────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-[#E8E4DB] pt-8">
          {prevSerie ? (
            <Link
              href={`/brands/kama/${prevSerie.slug}`}
              className="flex items-center gap-2 text-sm text-[#6B6560] transition-colors hover:text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span className="text-[#C4933F]">←</span>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-[#9B9590]">Serie anterior</p>
                <p className="font-semibold">{prevSerie.label}</p>
              </div>
            </Link>
          ) : <div />}

          <Link
            href="/brands/kama"
            className="text-xs font-semibold text-[#9B9590] hover:text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Todas las series
          </Link>

          {nextSerie ? (
            <Link
              href={`/brands/kama/${nextSerie.slug}`}
              className="flex items-center gap-2 text-right text-sm text-[#6B6560] transition-colors hover:text-[#C4933F]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <div>
                <p className="text-[9px] uppercase tracking-wide text-[#9B9590]">Serie siguiente</p>
                <p className="font-semibold">{nextSerie.label}</p>
              </div>
              <span className="text-[#C4933F]">→</span>
            </Link>
          ) : <div />}
        </div>

        {/* ── ALL SERIES PILLS ────────────────────────────────────────────── */}
        <div className="mt-8">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
            Otras series KAMA
          </p>
          <div className="flex flex-wrap gap-2">
            {KAMA_SERIES.filter((s) => s.slug !== serie.slug).map((s) => (
              <Link
                key={s.slug}
                href={`/brands/kama/${s.slug}`}
                className="flex items-center gap-1.5 rounded-full border border-[#E8E4DB] bg-white px-4 py-2 text-xs font-medium text-[#6B6560] transition-colors hover:border-[#C4933F] hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {s.label}
                <span className="text-[9px] font-semibold text-[#C4933F]">{s.modelIds.length}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
