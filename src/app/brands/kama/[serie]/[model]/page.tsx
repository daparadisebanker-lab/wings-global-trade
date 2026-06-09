import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { getListingById } from "@data/listings";
import InquiryForm from "@/components/inquiries/InquiryForm";
import { KAMA_SERIES, getSeriesBySlug } from "@/lib/kama-series";

interface PageProps {
  params: { serie: string; model: string };
}

const TRUCK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80";

const WA_NUMBER = "51958381473";

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

  const listingTitle = `KAMA ${listing.model}`;
  const cover = listing.images?.[0] ?? TRUCK_PLACEHOLDER;

  const waMessage = `Hola, estoy interesado en el KAMA ${listing.model} (${serie.label}). ¿Está disponible y cuál es el precio landed total?`;
  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;

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
            {/* Hero image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#E8E4DB]">
              <Image
                src={cover}
                alt={listingTitle}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, calc(100vw - 420px)"
              />
            </div>

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

              {/* WhatsApp CTA */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#001E50] py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.527 5.845L0 24l6.335-1.502A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.865 0-3.614-.483-5.13-1.33l-.369-.213-3.761.893.952-3.67-.233-.378A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Consultar por WhatsApp
              </a>

              {/* Trust bullets */}
              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-5">
                <ul className="space-y-2.5">
                  {[
                    "Precio landed total: flete + aranceles + entrega",
                    "Plazo estimado: 45–90 días desde confirmación",
                    "Operamos desde ZOFRI y ZOFRATACNA",
                    "Respondemos en menos de 24 h",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-xs text-[#6B6560]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <div className="h-1 w-1 flex-shrink-0 rounded-full bg-[#C4933F]" />
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
        className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-white/10 bg-[#001E50] px-4 py-3 md:hidden"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#25D366", fontFamily: "var(--font-body)" }}
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <Link
          href={`/brands/kama/${serie.slug}`}
          className="flex flex-1 items-center justify-center rounded-full bg-[#C4933F] py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Solicitar cotización
        </Link>
      </div>
    </div>
  );
}
