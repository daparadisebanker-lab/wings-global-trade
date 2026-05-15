import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types";
import type { Translations } from "@/lib/i18n";
import { ts } from "@/lib/specs-i18n";
import { formatPrice } from "@/lib/currencies";

const conditionStyles: Record<Listing["condition"], string> = {
  new:         "bg-brown-800 text-cream-50",
  used:        "bg-amber-700 text-cream-50",
  refurbished: "bg-brown-200 text-brown-800",
};

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

// ── Helper: render a spec row ─────────────────────────────────────────────────
function SpecRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt className="text-brown-400 uppercase tracking-wide text-[10px]">{label}</dt>
      <dd className="mt-0.5 font-medium text-brown-800 truncate">{value}</dd>
    </div>
  );
}

export default function TractorCard({
  listing,
  currency = "EUR",
  t,
  lang = "en",
}: {
  listing: Listing;
  currency?: string;
  t?: Translations;
  lang?: string;
}) {
  const cover      = listing.images?.[0] ?? PLACEHOLDER;
  const details    = listing.details ?? {};
  const engine     = details.engine     ?? {};
  const trans      = details.transmission_details ?? {};
  const pto        = details.pto        ?? {};
  const tires      = details.tires      ?? {};
  const dims       = details.dimensions ?? {};

  const condLabel: Record<Listing["condition"], string> = {
    new:         t?.condLabelNew         ?? "New",
    used:        t?.condLabelUsed        ?? "Used",
    refurbished: t?.condLabelRefurbished ?? "Refurbished",
  };

  // ── Price display ─────────────────────────────────────────────────────────
  const priceDisplay =
    listing.price != null && listing.price > 0
      ? formatPrice(listing.price, currency)
      : "Price on request";

  // ── Title: year only if not null ──────────────────────────────────────────
  const title = [listing.year, listing.model].filter(Boolean).join(" ");

  // ── Drive badge ───────────────────────────────────────────────────────────
  const driveType = listing.drive_type ?? trans.drive_type;

  // ── Engine label ──────────────────────────────────────────────────────────
  const engineLabel = [engine.manufacturer, engine.model].filter(Boolean).join(" ") || null;

  // ── Transmission label ────────────────────────────────────────────────────
  const transLabel =
    listing.transmission ??
    (trans.forward_gears != null && trans.reverse_gears != null
      ? `${trans.forward_gears}F / ${trans.reverse_gears}R`
      : null);

  // ── PTO ───────────────────────────────────────────────────────────────────
  const ptoLabel = pto.rear_pto_rpm ? `${pto.rear_pto_rpm} rpm` : null;

  // ── Tires ─────────────────────────────────────────────────────────────────
  const tiresLabel =
    tires.front && tires.rear
      ? `${tires.front} / ${tires.rear}`
      : tires.front ?? tires.rear ?? null;

  // ── Weight ────────────────────────────────────────────────────────────────
  const weightLabel = dims.operating_weight_kg
    ? `${dims.operating_weight_kg.toLocaleString()} kg`
    : null;

  // ── Location display ──────────────────────────────────────────────────────
  const locationDisplay =
    listing.location && listing.country
      ? `${listing.location}, ${listing.country}`
      : listing.location ?? listing.country ?? null;

  return (
    <article className="card group flex flex-col overflow-hidden bg-white">

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-brown-100">
        <Image
          src={cover}
          alt={`${listing.brand} ${listing.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Condition badge */}
        <span className={`absolute left-0 top-4 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${conditionStyles[listing.condition]}`}>
          {condLabel[listing.condition]}
        </span>
        {/* Drive badge */}
        {driveType && (
          <span className="absolute right-0 top-4 bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
            {driveType}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">

        {/* Brand */}
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-brown-500">
          {listing.brand}
        </p>

        {/* Title */}
        <h3 className="mb-1 font-serif text-lg font-semibold leading-snug text-brown-900 group-hover:text-brown-700">
          {title}
        </h3>

        {/* Engine subtitle */}
        {engineLabel && (
          <p className="mb-3 text-xs text-brown-400 truncate">{engineLabel}</p>
        )}

        {/* Price */}
        <p className={`mb-4 text-xl font-semibold ${listing.price ? "text-brown-800" : "text-brown-400 italic text-base"}`}>
          {priceDisplay}
        </p>

        {/* Spec grid */}
        <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-brown-100 pt-4 text-xs">
          <SpecRow
            label={t?.cardPower ?? "Power"}
            value={listing.horsepower != null ? `${listing.horsepower} ${t?.hpUnit ?? "hp"}` : null}
          />
          <SpecRow
            label={t?.cardHours ?? "Hours"}
            value={listing.hours_used != null ? `${listing.hours_used.toLocaleString()} ${t?.hrsUnit ?? "hrs"}` : null}
          />
          <SpecRow label={ts("Transmission", lang)} value={transLabel} />
          <SpecRow label={ts("PTO (Power Take-Off)", lang)} value={ptoLabel} />
          <SpecRow label={ts("Tires", lang)}        value={tiresLabel} />
          <SpecRow label={ts("Operating weight", lang)} value={weightLabel} />
          {locationDisplay && (
            <div className="col-span-2">
              <dt className="text-brown-400 uppercase tracking-wide text-[10px]">
                {t?.cardLocation ?? "Location"}
              </dt>
              <dd className="mt-0.5 font-medium text-brown-800 truncate">{locationDisplay}</dd>
            </div>
          )}
        </dl>

        <Link
          href={`/agricultural/tractors/${listing.id}`}
          className="btn-primary mt-auto w-full justify-center text-xs tracking-widest uppercase"
        >
          {t?.cardViewDetails ?? "View Details"}
        </Link>
      </div>
    </article>
  );
}
