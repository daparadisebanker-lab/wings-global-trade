import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types";
import type { Translations } from "@/lib/i18n";
import { ts } from "@/lib/specs-i18n";

const conditionStyles: Record<Listing["condition"], string> = {
  new:         "bg-[#001E50] text-white",
  used:        "bg-[#C4933F] text-white",
  refurbished: "bg-[#E8E4DB] text-[#1C1A16]",
};

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

function SpecRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-[#6B6560]"
        style={{ fontFamily: "var(--font-body)" }}>{label}</dt>
      <dd className="mt-0.5 truncate font-medium text-[#1C1A16]"
        style={{ fontFamily: "var(--font-body)" }}>{value}</dd>
    </div>
  );
}

export default function TractorCard({
  listing,
  currency = "USD",
  t,
  lang = "es",
}: {
  listing: Listing;
  currency?: string;
  t?: Translations;
  lang?: string;
}) {
  const cover   = listing.images?.[0] ?? PLACEHOLDER;
  const details = listing.details ?? {};
  const engine  = details.engine ?? {};
  const trans   = details.transmission_details ?? {};
  const pto     = details.pto ?? {};
  const tires   = details.tires ?? {};
  const dims    = details.dimensions ?? {};

  const condLabel: Record<Listing["condition"], string> = {
    new:         t?.condLabelNew         ?? "Nuevo",
    used:        t?.condLabelUsed        ?? "Usado",
    refurbished: t?.condLabelRefurbished ?? "Reacondicionado",
  };

  const title = [listing.year || null, listing.model].filter(Boolean).join(" ");
  const driveType  = listing.drive_type ?? trans.drive_type;
  const engineLabel = [engine.manufacturer, engine.model].filter(Boolean).join(" ") || null;
  const transLabel =
    listing.transmission ??
    (trans.forward_gears != null && trans.reverse_gears != null
      ? `${trans.forward_gears}F / ${trans.reverse_gears}R`
      : null);
  const ptoLabel    = pto.rear_pto_rpm ? `${pto.rear_pto_rpm} rpm` : null;
  const tiresLabel  =
    tires.front && tires.rear
      ? `${tires.front} / ${tires.rear}`
      : tires.front ?? tires.rear ?? null;
  const weightLabel = dims.operating_weight_kg
    ? `${dims.operating_weight_kg.toLocaleString()} kg`
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E4DB] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)]">

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-[#F8F6F0]">
        <Image
          src={cover}
          alt={`${listing.brand} ${listing.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Condition badge */}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${conditionStyles[listing.condition]}`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {condLabel[listing.condition]}
        </span>
        {/* Drive badge */}
        {driveType && (
          <span
            className="absolute right-3 top-3 rounded-full bg-[#001E50]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {driveType}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">

        {/* Brand */}
        <p
          className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#C4933F]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {listing.brand}
        </p>

        {/* Title */}
        <h3
          className="mb-1 text-xl font-semibold leading-snug text-[#1C1A16]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>

        {/* Engine subtitle */}
        {engineLabel && (
          <p className="mb-3 truncate text-xs text-[#6B6560]"
            style={{ fontFamily: "var(--font-body)" }}>{engineLabel}</p>
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
            label={t?.cardPower ?? "Potencia"}
            value={listing.horsepower != null ? `${listing.horsepower} ${t?.hpUnit ?? "hp"}` : null}
          />
          <SpecRow
            label={t?.cardHours ?? "Horas"}
            value={listing.hours_used != null ? `${listing.hours_used.toLocaleString()} ${t?.hrsUnit ?? "hrs"}` : null}
          />
          <SpecRow label={ts("Transmission", lang)} value={transLabel} />
          <SpecRow label={ts("PTO (Power Take-Off)", lang)} value={ptoLabel} />
          <SpecRow label={ts("Tires", lang)} value={tiresLabel} />
          <SpecRow label={ts("Operating weight", lang)} value={weightLabel} />
        </dl>

        <Link
          href={`/agricultural/tractors/${listing.id}`}
          className="mt-auto flex w-full items-center justify-center rounded-full bg-[#C4933F] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t?.cardViewDetails ?? "Solicitar cotización"}
        </Link>
      </div>
    </article>
  );
}
