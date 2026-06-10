import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types";
import type { Translations } from "@/lib/i18n";
import { ts } from "@/lib/specs-i18n";

const conditionStyles: Record<Listing["condition"], string> = {
  new:         "bg-[#004389] text-white",
  used:        "bg-[#C4933F]/15 text-[#C4933F]",
  refurbished: "bg-[#E8E4DB] text-[#6B6560]",
};

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

function SpecRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt
        className="text-[9px] uppercase tracking-wider text-[#9B9590]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </dt>
      <dd
        className="mt-0.5 truncate text-xs font-medium text-[#1C1A16]"
        style={{ fontFamily: "var(--font-data)" }}
      >
        {value}
      </dd>
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

  const title       = [listing.year || null, listing.brand, listing.model].filter(Boolean).join(" ");
  const driveType   = listing.drive_type ?? trans.drive_type;
  const transLabel  =
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
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E4DB] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_6px_28px_rgba(0,0,0,0.09)] hover:-translate-y-0.5">

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#FAFAFA]">
        <Image
          src={cover}
          alt={`${listing.brand} ${listing.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Condition badge */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest backdrop-blur-sm ${conditionStyles[listing.condition]}`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {condLabel[listing.condition]}
        </span>
        {/* Drive badge */}
        {driveType && (
          <span
            className="absolute right-3 top-3 rounded-full bg-[#004389]/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {driveType}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">

        {/* Brand eyebrow */}
        <p
          className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-[#C4933F]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {listing.brand}
        </p>

        {/* Title */}
        <h3
          className="mb-4 text-xl font-semibold leading-snug text-[#1C1A16]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {listing.model}{listing.year ? ` · ${listing.year}` : ""}
        </h3>

        {/* Hero spec — HP as dominant signal */}
        {listing.horsepower != null && (
          <div className="mb-4 flex items-baseline gap-2 border-b border-[#E8E4DB] pb-4">
            <span
              className="text-4xl font-semibold leading-none text-[#1C1A16]"
              style={{ fontFamily: "var(--font-data)" }}
            >
              {listing.horsepower}
            </span>
            <span
              className="text-sm text-[#9B9590]"
              style={{ fontFamily: "var(--font-data)" }}
            >
              {t?.hpUnit ?? "hp"}
            </span>
            {listing.hours_used != null && (
              <>
                <span className="text-[#E8E4DB] ml-1">·</span>
                <span
                  className="text-sm text-[#9B9590]"
                  style={{ fontFamily: "var(--font-data)" }}
                >
                  {listing.hours_used.toLocaleString()} {t?.hrsUnit ?? "hrs"}
                </span>
              </>
            )}
          </div>
        )}

        {/* Spec grid */}
        <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <SpecRow label={ts("Transmission", lang)} value={transLabel} />
          <SpecRow label={ts("PTO (Power Take-Off)", lang)} value={ptoLabel} />
          <SpecRow label={ts("Tires", lang)} value={tiresLabel} />
          <SpecRow label={ts("Operating weight", lang)} value={weightLabel} />
        </dl>

        {/* CTA — cotización en 24 h */}
        <div className="mt-auto space-y-2">
          <Link
            href={`/agricultural/tractors/${listing.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C4933F] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t?.cardViewDetails ?? "Ver modelo"}
          </Link>
          <p
            className="text-center text-[9px] text-[#9B9590]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Cotización landed en 24 h · Sin compromiso
          </p>
        </div>
      </div>

      {/* Import escape valve */}
      <div className="border-t border-[#E8E4DB] px-5 pb-3 pt-2.5">
        <p className="text-[10px] text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
          ¿No es este modelo?{" "}
          <Link href="/importacion" className="font-semibold text-[#C4933F] hover:underline">
            Impórtalo desde fábrica →
          </Link>
        </p>
      </div>
    </article>
  );
}
