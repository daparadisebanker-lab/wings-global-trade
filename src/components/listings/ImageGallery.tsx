"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

interface Props {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: Props) {
  const [active,   setActive]   = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef<number | null>(null);
  const multiple   = images.length > 1;

  const prev = useCallback(
    () => setActive(i => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setActive(i => (i + 1) % images.length),
    [images.length],
  );

  // Keyboard nav & close — only active when lightbox is open
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  // Touch / swipe helpers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (delta >  50) next();
    if (delta < -50) prev();
    touchStart.current = null;
  };

  return (
    <>
      {/* ── Main viewer ───────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div
          className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#EEE9E0]"
          onClick={() => setLightbox(true)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Image
            key={images[active]}
            src={images[active]}
            alt={alt}
            fill
            className="object-cover transition-opacity duration-300"
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
          />

          {/* Expand icon — appears on hover */}
          <div className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>

          {/* Image counter */}
          {multiple && (
            <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              {active + 1} / {images.length}
            </div>
          )}

          {/* Prev / Next arrows — visible on hover, always on mobile */}
          {multiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all sm:opacity-0 sm:group-hover:opacity-100 hover:bg-black/60"
                aria-label="Imagen anterior"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all sm:opacity-0 sm:group-hover:opacity-100 hover:bg-black/60"
                aria-label="Siguiente imagen"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {multiple && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                className={`relative aspect-[4/3] w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-[#EEE9E0] transition-all ${
                  i === active
                    ? "border-[#C4933F]"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-[#C4933F]/40"
                }`}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${alt} – vista ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
            aria-label="Cerrar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image — stopPropagation so clicking image doesn't close lightbox */}
          <div
            className="relative mx-4 aspect-[4/3] w-full max-w-5xl sm:mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={`lb-${images[active]}`}
              src={images[active]}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Prev arrow */}
          {multiple && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25"
              aria-label="Imagen anterior"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {multiple && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25"
              aria-label="Siguiente imagen"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Counter */}
          {multiple && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
              {active + 1} / {images.length}
            </div>
          )}

          {/* Thumbnail strip in lightbox */}
          {multiple && (
            <div
              className="absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative aspect-[4/3] w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === active
                      ? "border-[#C4933F]"
                      : "border-white/20 opacity-50 hover:opacity-100"
                  }`}
                  aria-label={`Ir a imagen ${i + 1}`}
                >
                  <Image src={src} alt={`vista ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
