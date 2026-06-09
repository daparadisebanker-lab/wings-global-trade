import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types";

const TRUCK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80";

function isBEV(listing: Listing): boolean {
  const fuelType = (listing.details as any)?.engine?.fuel_type ?? "";
  return fuelType.includes("Eléctrico") || fuelType.includes("BEV");
}

function SpecRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-[#6B6560]"
        style={{ fontFamily: "var(--font-body)" }}>{label}</dt>
      <dd className="font-data font-medium text-[#1C1A16] text-xs mt-0.5 truncate">
        {value}
      </dd>
    </div>
  );
}

export default function TruckCard({
  listing,
  serieSlug,
  currency = "USD",
}: {
  listing: Listing;
  serieSlug: string;
  currency?: string;
}) {
  const cover    = listing.images?.[0] ?? TRUCK_PLACEHOLDER;
  const d        = listing.details as any ?? {};
  const engine   = d.engine ?? {};
  const dims     = d.dimensions ?? {};
  const specs    = d.specs ?? {};
  const battery  = d.battery ?? {};
  const tires    = d.tires ?? {};

  const bev = isBEV(listing);

  const fuelType = engine.fuel_type ?? null;
  const engineModel = engine.model ?? null;
  const engineSubtitle = engineModel ?? fuelType ?? null;

  // Fuel badge label
  let fuelBadge = fuelType ?? "—";
  if (fuelType?.includes("Eléctrico") || fuelType?.includes("BEV")) {
    fuelBadge = "BEV";
  } else if (engine.emission_standard) {
    fuelBadge = engine.emission_standard;
  }

  const fuelBadgeClass = bev
    ? "bg-[#001E50] text-[#2DD4BF]"
    : "bg-[#1C1A16] text-white";

  const gvwDisplay = dims.gvw_kg != null
    ? `${(dims.gvw_kg / 1000).toFixed(1)}T`
    : null;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-[#E8E4DB] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)] ${bev ? "border-l-2 border-l-[#2DD4BF]" : ""}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F6F0]">
        <Image
          src={cover}
          alt={`${listing.brand} ${listing.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Fuel type badge */}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${fuelBadgeClass}`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {fuelBadge}
        </span>
        {/* Drive badge */}
        {listing.drive_type && (
          <span
            className="absolute right-3 top-3 rounded-full bg-[#001E50]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {listing.drive_type}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">

        {/* Brand + availability */}
        <div className="mb-1 flex items-center justify-between">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            KAMA
          </p>
          <span
            className="flex items-center gap-1 text-[9px] font-semibold text-[#4B9E5F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4B9E5F]" />
            Disponible
          </span>
        </div>

        {/* Title */}
        <h3
          className="mb-1 text-xl font-semibold leading-snug text-[#1C1A16]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {listing.model}
        </h3>

        {/* Engine subtitle */}
        {engineSubtitle && (
          <p className="mb-3 truncate text-xs text-[#6B6560]"
            style={{ fontFamily: "var(--font-body)" }}>{engineSubtitle}</p>
        )}

        {/* Price → Quote only */}
        <p
          className="mb-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#C4933F]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Precio a consultar
        </p>

        {/* Spec grid */}
        <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#E8E4DB] pt-4 text-xs">
          <SpecRow
            label="Potencia"
            value={listing.horsepower != null ? `${listing.horsepower} hp` : null}
          />
          <SpecRow
            label="Carga útil"
            value={specs.payload_t != null ? `${specs.payload_t}T` : null}
          />
          <SpecRow label="GVW" value={gvwDisplay} />
          <SpecRow label="Combustible" value={fuelType} />
          {bev ? (
            <>
              <SpecRow
                label="Autonomía"
                value={specs.range_km_wltp != null ? `${specs.range_km_wltp} km WLTP` : null}
              />
              <SpecRow
                label="Batería"
                value={
                  battery.capacity_kwh != null
                    ? `${battery.capacity_kwh} kWh${battery.brand ? ` (${battery.brand})` : ""}`
                    : null
                }
              />
            </>
          ) : (
            <>
              <SpecRow label="Transmisión" value={listing.transmission} />
              <SpecRow label="Norma" value={engine.emission_standard} />
            </>
          )}
        </dl>

        <Link
          href={`/brands/kama/${serieSlug}/${listing.id}`}
          className="mt-auto flex w-full items-center justify-center rounded-full bg-[#C4933F] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Solicitar cotización
        </Link>
      </div>

      {/* Wings import micro-CTA */}
      <div className="border-t border-[#E8E4DB] px-5 pb-3 pt-2">
        <p className="text-[10px] text-[#1C1A16]/35" style={{ fontFamily: "var(--font-body)" }}>
          ¿No es lo que buscas?{" "}
          <Link href="/importacion" className="font-semibold text-[#C4933F] hover:underline">
            Impórtalo →
          </Link>
        </p>
      </div>
    </article>
  );
}
