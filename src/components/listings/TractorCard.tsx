import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types";
import type { Translations } from "@/lib/i18n";
import { formatPrice } from "@/lib/currencies";

const conditionStyles: Record<Listing["condition"], string> = {
  new:         "bg-brown-800 text-cream-50",
  used:        "bg-brown-100 text-brown-700",
  refurbished: "bg-brown-200 text-brown-800",
};

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

export default function TractorCard({
  listing,
  currency = "EUR",
  t,
}: {
  listing: Listing;
  currency?: string;
  t?: Translations;
}) {
  const cover = listing.images?.[0] ?? PLACEHOLDER;

  const condLabel: Record<Listing["condition"], string> = {
    new:         t?.condLabelNew         ?? "New",
    used:        t?.condLabelUsed        ?? "Used",
    refurbished: t?.condLabelRefurbished ?? "Refurbished",
  };

  const hrsUnit  = t?.hrsUnit  ?? "hrs";
  const hpUnit   = t?.hpUnit   ?? "hp";

  return (
    <article className="card group flex flex-col overflow-hidden bg-white">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-brown-100">
        <Image
          src={cover}
          alt={`${listing.year} ${listing.brand} ${listing.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className={`absolute left-0 top-4 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${conditionStyles[listing.condition]}`}>
          {condLabel[listing.condition]}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-brown-500">
          {listing.brand}
        </p>
        <h3 className="mb-3 font-serif text-lg font-semibold leading-snug text-brown-900 group-hover:text-brown-700">
          {listing.year} {listing.model}
        </h3>

        <p className="mb-4 text-xl font-semibold text-brown-800">
          {formatPrice(listing.price, currency)}
        </p>

        {/* Specs */}
        <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-brown-100 pt-4 text-xs">
          <div>
            <dt className="text-brown-400 uppercase tracking-wide">{t?.cardHours ?? "Hours"}</dt>
            <dd className="mt-0.5 font-medium text-brown-800">
              {listing.hours_used != null ? `${listing.hours_used.toLocaleString()} ${hrsUnit}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-brown-400 uppercase tracking-wide">{t?.cardPower ?? "Power"}</dt>
            <dd className="mt-0.5 font-medium text-brown-800">
              {listing.horsepower != null ? `${listing.horsepower} ${hpUnit}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-brown-400 uppercase tracking-wide">{t?.cardLocation ?? "Location"}</dt>
            <dd className="mt-0.5 font-medium text-brown-800 truncate">{listing.location}</dd>
          </div>
          <div>
            <dt className="text-brown-400 uppercase tracking-wide">{t?.cardCountry ?? "Country"}</dt>
            <dd className="mt-0.5 font-medium text-brown-800">{listing.country}</dd>
          </div>
        </dl>

        <Link
          href={`/tractors/${listing.id}`}
          className="btn-primary mt-auto w-full justify-center text-xs tracking-widest uppercase"
        >
          {t?.cardViewDetails ?? "View Details"}
        </Link>
      </div>
    </article>
  );
}
