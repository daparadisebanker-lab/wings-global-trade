import type { Metadata } from "next";
import Link from "next/link";
import { KAMA_SERIES, KAMA_GROUPS } from "@/lib/kama-series";

export const metadata: Metadata = {
  title: "Camiones KAMA — Vehículos Comerciales | Wings Global Trade",
  description: "27 modelos de camiones y furgonetas KAMA disponibles para importación: W, X, V, M3, M6, GM, EW/EV, ES/ESP, EX/EM. Combustión y eléctrico (BEV). Entrega en LATAM con precio landed total.",
};

function CombustionIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" className="inline-block">
      <path d="M12 2C8.5 2 7 5.5 7 8c0 2.2 1.2 3.9 2.5 5.2C10.8 14.5 11 15.2 11 16v1h2v-1c0-.8.2-1.5 1.5-2.8C15.8 11.9 17 10.2 17 8c0-2.5-1.5-6-5-6zm-1 17h2v1a1 1 0 01-2 0v-1z"/>
    </svg>
  );
}

function ElectricIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" className="inline-block">
      <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2z"/>
    </svg>
  );
}

export default function CamionesPage() {
  const seriesBySlug = Object.fromEntries(KAMA_SERIES.map((s) => [s.slug, s]));

  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#001E50]">
        {/* Gold radial glow */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #C4933F 0%, transparent 55%)" }} />
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">

          <nav className="mb-6 flex items-center gap-2 text-xs text-white/30" style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/" className="hover:text-white/60 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/50">Camiones</span>
          </nav>

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}>
            Vehículos comerciales
          </p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-[56px]"
            style={{ fontFamily: "var(--font-display)" }}>
            Camiones KAMA
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/50 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}>
            27 modelos en 9 series — del mini truck urbano al camión pesado de 16.6T. Combustión y eléctrico (BEV). Importados con precio landed total para toda Latinoamérica.
          </p>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-8">
            {[
              { value: "27", label: "Modelos disponibles" },
              { value: "9", label: "Series" },
              { value: "16.6T", label: "GVW máximo" },
              { value: "360 km", label: "Autonomía BEV máx." },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-data text-2xl font-semibold text-[#C4933F]">
                  {s.value}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/30" style={{ fontFamily: "var(--font-body)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Quick CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/brands/kama"
              className="rounded-full bg-[#C4933F] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver todas las series →
            </Link>
            <Link
              href="/cotizar"
              className="rounded-full border border-white/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white/70 transition-colors hover:border-white/40 hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar cotización
            </Link>
          </div>
        </div>
      </div>

      {/* ── GROUPS ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        {KAMA_GROUPS.map((group) => {
          const groupSeries = group.series.map((slug) => seriesBySlug[slug]).filter(Boolean);
          const totalModels = groupSeries.reduce((acc, s) => acc + s.modelIds.length, 0);

          return (
            <div key={group.id} className="mb-20 last:mb-0">

              {/* Group header */}
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}>
                    {totalModels} modelos
                  </p>
                  <h2 className="text-2xl font-semibold text-[#1C1A16] sm:text-3xl"
                    style={{ fontFamily: "var(--font-display)" }}>
                    {group.label}
                  </h2>
                  <p className="mt-1.5 max-w-lg text-sm text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
                    {group.description}
                  </p>
                </div>
                <Link
                  href="/brands/kama"
                  className="flex-shrink-0 text-xs font-semibold text-[#C4933F] hover:underline underline-offset-2"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Ver todos →
                </Link>
              </div>

              {/* Series cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupSeries.map((serie) => (
                  <Link
                    key={serie.slug}
                    href={`/brands/kama/${serie.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-[#E8E4DB] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all hover:border-[#C4933F]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
                  >
                    {/* Accent line */}
                    <div className="absolute left-0 top-0 h-1 w-full rounded-t-2xl transition-all"
                      style={{ backgroundColor: serie.accent }} />

                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                          style={{ fontFamily: "var(--font-body)", color: serie.accent }}>
                          {serie.fuel.includes("Eléctrico") || serie.fuel.includes("BEV")
                            ? <ElectricIcon color={serie.accent} />
                            : <CombustionIcon color={serie.accent} />
                          }{" "}
                          {serie.fuel}
                        </p>
                        <h3 className="mt-0.5 text-xl font-semibold text-[#1C1A16]"
                          style={{ fontFamily: "var(--font-display)" }}>
                          {serie.label}
                        </h3>
                      </div>
                      {serie.badge && (
                        <span className="rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest"
                          style={{ fontFamily: "var(--font-body)", borderColor: serie.accent, color: serie.accent }}>
                          {serie.badge}
                        </span>
                      )}
                    </div>

                    <p className="mb-4 text-xs text-[#6B6560] leading-relaxed"
                      style={{ fontFamily: "var(--font-body)" }}>
                      {serie.description}
                    </p>

                    {/* Mini specs */}
                    <div className="mb-5 grid grid-cols-2 gap-2 border-t border-[#E8E4DB] pt-4">
                      {[
                        { label: "Potencia", value: serie.hpRange },
                        { label: "Carga útil", value: serie.payload },
                        { label: "GVW", value: serie.gvwRange },
                        { label: "Modelos", value: String(serie.modelIds.length) },
                      ].map((spec) => (
                        <div key={spec.label}>
                          <p className="text-[9px] uppercase tracking-wide text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                            {spec.label}
                          </p>
                          <p className="font-data text-xs font-semibold text-[#1C1A16]">
                            {spec.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {serie.modelIds.slice(0, 4).map((id) => (
                          <span key={id}
                            className="font-data rounded-full border border-[#E8E4DB] bg-[#F8F6F0] px-2 py-0.5 text-[9px] font-semibold text-[#6B6560]">
                            {id.replace("kama-","").toUpperCase()}
                          </span>
                        ))}
                        {serie.modelIds.length > 4 && (
                          <span className="rounded-full border border-[#E8E4DB] bg-[#F8F6F0] px-2 py-0.5 text-[9px] font-semibold text-[#9B9590]"
                            style={{ fontFamily: "var(--font-body)" }}>
                            +{serie.modelIds.length - 4}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-[#C4933F] transition-transform group-hover:translate-x-0.5"
                        style={{ fontFamily: "var(--font-body)" }}>
                        Ver →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── KAMA BRAND STRIP ──────────────────────────────────────────────── */}
      <div className="border-t border-[#E8E4DB] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}>
                Fabricante exclusivo
              </p>
              <p className="text-xl font-semibold text-[#1C1A16]" style={{ fontFamily: "var(--font-display)" }}>
                Shandong KAMA Automobile Manufacturing
              </p>
              <p className="mt-1 text-sm text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
                27 modelos · 9 series · Combustión y BEV · RHD disponible en todas las series
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/brands/kama"
                className="rounded-full bg-[#001E50] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#0A2D6E]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Catálogo completo
              </Link>
              <Link
                href="/importacion"
                className="rounded-full border border-[#E8E4DB] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#6B6560] transition-colors hover:border-[#C4933F] hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Importar a pedido
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
