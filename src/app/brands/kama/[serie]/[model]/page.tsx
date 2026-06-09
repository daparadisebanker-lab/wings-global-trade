import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getListingById } from "@data/listings";
import ImageGallery from "@/components/listings/ImageGallery";
import InquiryForm from "@/components/inquiries/InquiryForm";
import { KAMA_SERIES, getSeriesBySlug } from "@/lib/kama-series";

interface PageProps {
  params: { serie: string; model: string };
}

const TRUCK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80";

export async function generateStaticParams() {
  return KAMA_SERIES.flatMap((s) =>
    s.modelIds.map((id) => ({ serie: s.slug, model: id }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await getListingById(params.model);
  if (!listing) return { title: "Modelo no encontrado" };
  const serie = getSeriesBySlug(params.serie);
  return {
    title: `KAMA ${listing.model}${serie ? ` — ${serie.label}` : ""} | Wings Global Trade`,
    description: `${listing.brand} ${listing.model} — ${listing.horsepower ?? "—"} hp. Importación con precio landed total para Latinoamérica.`,
  };
}

export const dynamic = "force-dynamic";

function buildTruckNarrative(
  listing: NonNullable<Awaited<ReturnType<typeof getListingById>>>,
  serie: NonNullable<ReturnType<typeof getSeriesBySlug>>,
): string {
  const d       = listing.details as any ?? {};
  const engine  = d.engine ?? {};
  const dims    = d.dimensions ?? {};
  const specs   = d.specs ?? {};
  const battery = d.battery ?? {};

  const bev      = (engine.fuel_type ?? "").includes("Eléctrico") || (engine.fuel_type ?? "").includes("BEV");
  const payload  = specs.payload_t;
  const gvw      = dims.gvw_kg ? `${(dims.gvw_kg / 1000).toFixed(1)}T` : null;
  const range    = bev && specs.range_km_wltp ? `${specs.range_km_wltp} km WLTP` : null;
  const emission = !bev && engine.emission_standard ? engine.emission_standard : null;

  const configParts = [
    listing.horsepower ? `${listing.horsepower} hp` : null,
    gvw ? `GVW ${gvw}` : null,
    emission ? emission : null,
  ].filter(Boolean).join(", ");

  if (bev) {
    return [
      `El KAMA ${listing.model} es un camión de carga eléctrico (BEV) de la serie ${serie.label}, diseñado para distribución urbana de última milla con cero emisiones locales.`,
      range ? `Autonomía de ${range} en ciclo WLTP — suficiente para múltiples rutas de reparto sin carga intermedia.` : "",
      battery.capacity_kwh ? `Batería de ${battery.capacity_kwh} kWh${battery.brand ? ` ${battery.brand}` : ""} con garantía de fabricante. Disponible con precio landed total confirmado por escrito para Latinoamérica.` : "Disponible con precio landed total confirmado por escrito para Latinoamérica.",
    ].filter(Boolean).join(" ");
  }

  const useCaseByLabel: Record<string, string> = {
    "Mini Truck":   "distribución local, pequeños comercios y transporte de carga ligera",
    "Pick-up":      "uso mixto comercial-personal, transporte de materiales y logística ligera",
    "Medium Cargo": "transporte de carga seca entre ciudades y distribución regional",
    "Heavy Cargo":  "transporte de carga pesada, materiales de construcción y logística de larga distancia",
  };
  const useCase = useCaseByLabel[serie.label] ?? "transporte de carga comercial";

  return [
    `El KAMA ${listing.model} es un camión de la serie ${serie.label} de Shandong KAMA Automobile Manufacturing, diseñado para ${useCase}.`,
    configParts ? `Equipado con ${configParts} — cumple con las normas de circulación vigentes en los 6 países de entrega.` : "",
    `Precio landed total confirmado por escrito: incluye flete desde fábrica, aranceles de importación y entrega en tu país. Plazo: 45–90 días desde tu confirmación.`,
  ].filter(Boolean).join(" ");
}

function isBEV(d: any): boolean {
  const ft = d?.engine?.fuel_type ?? "";
  return ft.includes("Eléctrico") || ft.includes("BEV");
}

function fmtMm(mm?: number): string | null {
  if (mm == null) return null;
  const m = Math.floor(mm / 1000);
  const cm = Math.round((mm % 1000) / 10);
  return `${m}m ${cm.toString().padStart(2, "0")}cm`;
}

function SpecItem({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="rounded-xl border border-[#E8E4DB] bg-white p-4">
      <dt
        className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </dt>
      <dd
        className="mt-1.5 font-data text-sm font-medium text-[#1C1A16]"
      >
        {value}
      </dd>
    </div>
  );
}

export default async function KamaTruckDetailPage({ params }: PageProps) {
  // cookies() must be called before any async work in dynamic pages
  await cookies();

  const [listing, serie] = await Promise.all([
    getListingById(params.model),
    Promise.resolve(getSeriesBySlug(params.serie)),
  ]);

  if (!listing || listing.brand !== "KAMA") notFound();
  if (!serie) notFound();

  const d       = listing.details as any ?? {};
  const engine  = d.engine ?? {};
  const dims    = d.dimensions ?? {};
  const specs   = d.specs ?? {};
  const battery = d.battery ?? {};
  const tires   = d.tires ?? {};

  const bev = isBEV(d);

  const listingTitle   = `KAMA ${listing.model}`;
  const galleryImages  = listing.images?.length ? listing.images : [TRUCK_PLACEHOLDER];
  const narrative      = buildTruckNarrative(listing, serie);

  const tiresLabel =
    tires.all ?? (tires.front && tires.rear ? `${tires.front} / ${tires.rear}` : tires.front ?? tires.rear ?? null);

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* Breadcrumb */}
        <nav
          className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[#9B9590]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Link href="/" className="transition-colors hover:text-[#1C1A16]">Inicio</Link>
          <span>/</span>
          <Link href="/camiones" className="transition-colors hover:text-[#1C1A16]">Camiones</Link>
          <span>/</span>
          <Link href="/brands/kama" className="transition-colors hover:text-[#1C1A16]">KAMA</Link>
          <span>/</span>
          <Link href={`/brands/kama/${serie.slug}`} className="transition-colors hover:text-[#1C1A16]">
            {serie.label}
          </Link>
          <span>/</span>
          <span className="text-[#6B6560]">{listing.model}</span>
        </nav>

        {/* Main grid */}
        <div className="lg:grid lg:gap-12" style={{ gridTemplateColumns: "1fr 360px" }}>

          {/* ── Left column ── */}
          <div>
            {/* Image gallery */}
            <ImageGallery images={galleryImages} alt={listingTitle} />

            {/* Identity */}
            <div className="mt-8">
              <div className="flex items-center gap-2">
                <div className="h-1 w-5 rounded-full" style={{ backgroundColor: serie.accent }} />
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-body)", color: serie.accent }}
                >
                  KAMA — {serie.label}
                </p>
              </div>
              <h1
                className="mt-2 text-4xl font-semibold leading-tight text-[#1C1A16] sm:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {listing.model}
              </h1>
              {engine.fuel_type && (
                <p className="mt-1 text-sm text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
                  {engine.fuel_type}
                </p>
              )}
            </div>

            {/* Price row */}
            <div className="mt-6 border-b border-[#E8E4DB] pb-6">
              <p
                className="text-xl font-medium text-[#6B6560]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Precio a consultar
              </p>
              <p
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#C4933F]/20 bg-[#C4933F]/5 px-3 py-1 text-[10px] font-semibold text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <svg className="h-2.5 w-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                Precio incluye flete · aranceles · entrega
              </p>
            </div>

            {/* BEV distinction strip */}
            {bev && (
              <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-[#2DD4BF]/30 bg-[#001E50]/5 px-5 py-4">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#2DD4BF">
                    <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2z"/>
                  </svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#2DD4BF]"
                    style={{ fontFamily: "var(--font-body)" }}>
                    Eléctrico BEV · Cero emisiones
                  </span>
                </div>
                {specs.range_km_wltp != null && (
                  <div className="flex items-baseline gap-1">
                    <span className="font-data text-xl font-semibold text-[#1C1A16]">{specs.range_km_wltp}</span>
                    <span className="text-xs text-[#9B9590]" style={{ fontFamily: "var(--font-data)" }}>km WLTP</span>
                  </div>
                )}
                {battery.capacity_kwh != null && (
                  <div className="flex items-baseline gap-1">
                    <span className="font-data text-xl font-semibold text-[#1C1A16]">{battery.capacity_kwh}</span>
                    <span className="text-xs text-[#9B9590]" style={{ fontFamily: "var(--font-data)" }}>kWh</span>
                  </div>
                )}
                {battery.charging && (
                  <span className="text-xs text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
                    Carga: {battery.charging}
                  </span>
                )}
              </div>
            )}

            {/* Product narrative */}
            <div className="mt-8">
              <p
                className="text-sm leading-relaxed text-[#6B6560]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {narrative}
              </p>
            </div>

            {/* ── Specs técnicas ── */}
            <div className="mt-10">
              <p
                className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B9590]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Especificaciones técnicas
              </p>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <SpecItem label="Potencia" value={listing.horsepower != null ? `${listing.horsepower} hp` : null} />
                <SpecItem label="Motor" value={engine.model} />
                <SpecItem label="Combustible" value={engine.fuel_type} />
                <SpecItem label="Tracción" value={listing.drive_type} />
                {!bev && <SpecItem label="Transmisión" value={listing.transmission} />}
                {!bev && <SpecItem label="Norma emisión" value={engine.emission_standard} />}
                {bev && (
                  <SpecItem
                    label="Autonomía"
                    value={specs.range_km_wltp != null ? `${specs.range_km_wltp} km WLTP` : null}
                  />
                )}
                {bev && battery.capacity_kwh != null && (
                  <SpecItem
                    label="Batería"
                    value={`${battery.capacity_kwh} kWh · ${battery.brand ?? ""} ${battery.type ?? ""}`.trim().replace(/\s+/g, " ")}
                  />
                )}
                {bev && battery.charging && (
                  <SpecItem label="Carga" value={battery.charging} />
                )}
                {engine.power_kw != null && (
                  <SpecItem label="Potencia kW" value={`${engine.power_kw} kW`} />
                )}
                {engine.peak_power_kw != null && (
                  <SpecItem label="Pico kW" value={`${engine.peak_power_kw} kW (${engine.peak_hp ?? "—"} hp)`} />
                )}
              </dl>
            </div>

            {/* ── Dimensiones y peso ── */}
            {(dims.length_mm != null || dims.gvw_kg != null || specs.payload_t != null) && (
              <div className="mt-10">
                <p
                  className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B9590]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Dimensiones y peso
                </p>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <SpecItem label="Longitud" value={fmtMm(dims.length_mm)} />
                  <SpecItem label="Anchura" value={fmtMm(dims.width_mm)} />
                  <SpecItem label="Altura" value={fmtMm(dims.height_mm)} />
                  <SpecItem
                    label="Tara"
                    value={dims.curb_weight_kg != null ? `${dims.curb_weight_kg.toLocaleString()} kg` : null}
                  />
                  <SpecItem
                    label="GVW"
                    value={dims.gvw_kg != null ? `${dims.gvw_kg.toLocaleString()} kg` : null}
                  />
                  <SpecItem
                    label="Carga útil"
                    value={specs.payload_t != null ? `${specs.payload_t}T` : null}
                  />
                  <SpecItem
                    label="Entre ejes"
                    value={dims.wheelbase_mm != null ? `${dims.wheelbase_mm} mm` : null}
                  />
                  <SpecItem label="Caja de carga" value={dims.cargo_box} />
                  <SpecItem
                    label="Velocidad máx."
                    value={specs.max_speed_kmh != null ? `${specs.max_speed_kmh} km/h` : null}
                  />
                </dl>
              </div>
            )}

            {/* ── Neumáticos ── */}
            {tiresLabel && (
              <div className="mt-10">
                <p
                  className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B9590]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Neumáticos
                </p>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {tires.all ? (
                    <SpecItem label="Todos" value={tires.all} />
                  ) : (
                    <>
                      <SpecItem label="Delanteros" value={tires.front} />
                      <SpecItem label="Traseros" value={tires.rear} />
                    </>
                  )}
                </dl>
              </div>
            )}

            {/* Back link */}
            <div className="mt-10">
              <Link
                href={`/brands/kama/${serie.slug}`}
                className="text-xs text-[#9B9590] transition-colors hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ← Volver a {serie.label}
              </Link>
            </div>
          </div>

          {/* ── Right — sticky sidebar ── */}
          <div className="mt-10 lg:mt-0">
            <div className="sticky top-24 space-y-4">

              {/* Inquiry form */}
              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-6">
                <h2
                  className="mb-1 text-xl font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Solicitar cotización
                </h2>
                <p
                  className="mb-5 text-xs text-[#9B9590]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Respondemos en menos de 24 horas.
                </p>
                <InquiryForm listingId={listing.id} listingTitle={listingTitle} />
              </div>

              {/* Trust bullets */}
              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-5">
                <ul className="space-y-2.5">
                  {[
                    "Un precio: flete + aranceles + entrega en tu país",
                    `Camión confirmado con ficha técnica antes de pagar`,
                    "Plazo: 45–90 días desde tu confirmación escrita",
                    "Entregamos en 6 países · ZOFRI + ZOFRATACNA",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-xs text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#C4933F]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Back to all series */}
              <Link
                href="/brands/kama"
                className="block text-center text-xs text-[#9B9590] transition-colors hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ← Volver a todas las series
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#001E50] px-4 py-3 md:hidden"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <Link
          href="/cotizar"
          className="flex w-full items-center justify-center rounded-full bg-[#C4933F] py-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Solicitar cotización
        </Link>
      </div>
    </div>
  );
}
