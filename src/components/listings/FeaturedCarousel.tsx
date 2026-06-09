"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types";
import { ts } from "@/lib/specs-i18n";

interface CarouselLabels {
  hours: string;
  power: string;
  hrsUnit: string;
  hpUnit: string;
  viewDetails: string;
  condNew: string;
  condUsed: string;
  condRefurbished: string;
  viewAllListings: string;
}

interface Props {
  listings: Listing[];
  soldIds?: string[];
  currency?: string;
  labels: CarouselLabels;
  lang?: string;
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

const condStyles: Record<string, string> = {
  new:         "bg-[#004389] text-white",
  used:        "bg-[#C4933F] text-white",
  refurbished: "bg-[#E8E4DB] text-[#1C1A16]",
};

export default function FeaturedCarousel({ listings, soldIds = [], currency = "USD", labels, lang = "es" }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeLen = Math.max(listings.length, 1);
  const next = useCallback(() => setCurrent((c) => (c + 1) % safeLen), [safeLen]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + safeLen) % safeLen), [safeLen]);

  useEffect(() => {
    if (paused || listings.length === 0) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next, paused, listings.length]);

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-sm text-white/40" style={{ fontFamily: "var(--font-body)" }}>
          Catálogo disponible próximamente.
        </p>
        <Link
          href="/agricultural/tractors"
          className="rounded-full bg-[#C4933F] px-10 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#D4A855]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {labels.viewAllListings}
        </Link>
      </div>
    );
  }

  const condLabel: Record<string, string> = {
    new:         labels.condNew,
    used:        labels.condUsed,
    refurbished: labels.condRefurbished,
  };

  const leftIdx  = (current - 1 + listings.length) % listings.length;
  const rightIdx = (current + 1) % listings.length;

  const cards = [
    { idx: leftIdx,  pos: "left"   },
    { idx: current,  pos: "center" },
    { idx: rightIdx, pos: "right"  },
  ];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

      {/* Cards row */}
      <div className="relative flex items-end justify-center gap-3 px-12 sm:gap-5">

        {/* Prev */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#C4933F] text-lg text-white shadow-md transition-colors hover:bg-[#D4A855]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          ‹
        </button>

        {cards.map(({ idx, pos }) => {
          const listing  = listings[idx];
          const isCenter = pos === "center";
          const isSold   = soldIds.includes(listing.id);
          const cover    = listing.images?.[0] ?? PLACEHOLDER;
          const details  = listing.details ?? {};
          const trans    = details.transmission_details ?? {};
          const transLabel =
            listing.transmission ??
            (trans.forward_gears != null && trans.reverse_gears != null
              ? `${trans.forward_gears}F / ${trans.reverse_gears}R`
              : null);

          return (
            <div
              key={`${listing.id}-${pos}`}
              className={`transition-all duration-500 ${
                isCenter
                  ? "relative z-10 w-full max-w-sm -translate-y-5 shadow-2xl opacity-100"
                  : "hidden w-full max-w-xs opacity-50 sm:block"
              }`}
            >
              <article className="overflow-hidden rounded-2xl border border-[#E8E4DB] bg-white">

                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={cover}
                    alt={`${listing.brand} ${listing.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, 384px"
                  />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${condStyles[listing.condition]}`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {condLabel[listing.condition]}
                  </span>

                  {/* SOLD stamp */}
                  {isSold && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                      <div className="-rotate-12 border-4 border-red-500 px-5 py-2">
                        <span className="font-serif text-3xl font-bold uppercase tracking-widest text-red-500">
                          Sold
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5">
                  <p
                    className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#C4933F]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {listing.brand}
                  </p>
                  <h3
                    className="mb-1 text-xl font-semibold leading-snug text-[#1C1A16]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {[listing.year || null, listing.model].filter(Boolean).join(" ")}
                  </h3>

                  <p
                    className="mb-4 text-base italic text-[#6B6560]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Precio a consultar
                  </p>

                  <dl className="grid grid-cols-3 gap-x-3 gap-y-3 border-t border-[#E8E4DB] pt-4 text-xs">
                    <div>
                      <dt
                        className="text-[10px] uppercase tracking-wide text-[#6B6560]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {labels.power}
                      </dt>
                      <dd
                        className="mt-0.5 font-medium text-[#1C1A16]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {listing.horsepower ? `${listing.horsepower} ${labels.hpUnit}` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt
                        className="text-[10px] uppercase tracking-wide text-[#6B6560]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {ts("Transmission", lang)}
                      </dt>
                      <dd
                        className="mt-0.5 font-medium text-[#1C1A16]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {transLabel ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt
                        className="text-[10px] uppercase tracking-wide text-[#6B6560]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {listing.drive_type ? "Tracción" : labels.hours}
                      </dt>
                      <dd
                        className="mt-0.5 font-medium text-[#1C1A16]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {listing.drive_type ??
                          (listing.hours_used != null
                            ? `${listing.hours_used.toLocaleString()} ${labels.hrsUnit}`
                            : "—")}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/agricultural/tractors/${listing.id}`}
                    className="mt-5 flex w-full items-center justify-center rounded-full bg-[#C4933F] py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {labels.viewDetails}
                  </Link>
                </div>
              </article>
            </div>
          );
        })}

        {/* Next */}
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#C4933F] text-lg text-white shadow-md transition-colors hover:bg-[#D4A855]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          ›
        </button>
      </div>

      {/* Dot indicators */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {listings.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-[#C4933F]" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/agricultural/tractors"
          className="rounded-full bg-[#C4933F] px-12 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {labels.viewAllListings}
        </Link>
      </div>
    </div>
  );
}
