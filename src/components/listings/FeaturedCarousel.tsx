"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types";
import { formatPrice } from "@/lib/currencies";

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
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

const condStyles: Record<string, string> = {
  new:         "bg-brown-800 text-cream-50",
  used:        "bg-brown-100 text-brown-700",
  refurbished: "bg-brown-200 text-brown-800",
};

export default function FeaturedCarousel({ listings, soldIds = [], currency = "EUR", labels }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % listings.length), [listings.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + listings.length) % listings.length), [listings.length]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next, paused]);

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
      <div className="relative flex items-end justify-center gap-3 px-10 sm:gap-5">

        {/* Prev */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 border border-brown-600 bg-brown-900/80 px-3 py-5 text-xl text-cream-200 transition-colors hover:bg-brown-700"
        >
          ‹
        </button>

        {cards.map(({ idx, pos }) => {
          const listing  = listings[idx];
          const isCenter = pos === "center";
          const isSold   = soldIds.includes(listing.id);
          const cover    = listing.images?.[0] ?? PLACEHOLDER;

          return (
            <div
              key={`${listing.id}-${pos}`}
              className={`transition-all duration-500 ${
                isCenter
                  ? "relative z-10 w-full max-w-sm -translate-y-5 shadow-2xl opacity-100"
                  : "hidden w-full max-w-xs opacity-50 sm:block"
              }`}
            >
              <article className="bg-white">

                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={cover}
                    alt={`${listing.year} ${listing.brand} ${listing.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, 384px"
                  />
                  <span className={`absolute left-0 top-4 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${condStyles[listing.condition]}`}>
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
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-500">
                    {listing.brand}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold leading-snug text-brown-900">
                    {listing.year} {listing.model}
                  </h3>

                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-brown-100 pt-3 text-xs">
                    <div>
                      <p className="uppercase tracking-wide text-brown-400">Year</p>
                      <p className="mt-0.5 font-medium text-brown-800">{listing.year}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-brown-400">{labels.power}</p>
                      <p className="mt-0.5 font-medium text-brown-800">
                        {listing.horsepower ? `${listing.horsepower} ${labels.hpUnit}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-brown-400">{labels.hours}</p>
                      <p className="mt-0.5 font-medium text-brown-800">
                        {listing.hours_used != null
                          ? `${listing.hours_used.toLocaleString()} ${labels.hrsUnit}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-serif text-xl font-semibold text-brown-900">
                      {formatPrice(listing.price, currency)}
                    </p>
                    <Link
                      href={`/tractors/${listing.id}`}
                      className="text-xs font-semibold uppercase tracking-widest text-brown-600 underline-offset-2 hover:underline"
                    >
                      {labels.viewDetails}
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          );
        })}

        {/* Next */}
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 border border-brown-600 bg-brown-900/80 px-3 py-5 text-xl text-cream-200 transition-colors hover:bg-brown-700"
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
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 transition-all duration-300 ${
              i === current ? "w-6 bg-brown-300" : "w-1.5 bg-brown-600"
            }`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link href="/tractors" className="btn-primary px-12 text-xs uppercase tracking-widest">
          {labels.viewAllListings}
        </Link>
      </div>
    </div>
  );
}
