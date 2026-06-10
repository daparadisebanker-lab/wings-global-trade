"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categories as defaultCategories, type Category } from "@/lib/home/categories";
import { ensureGsap, prefersReducedMotion } from "@/lib/home/animation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const AUTO_ADVANCE_MS = 5_000;
const SUSPEND_MS = 10_000;

type Props = {
  categories?: Category[];
  initialActiveId?: string;
};

export default function CategoryWindows({
  categories = defaultCategories,
  initialActiveId,
}: Props) {
  const firstId = initialActiveId ?? categories[0]?.id ?? "";
  const [activeId, setActiveId] = useState(firstId);
  const reduced = useReducedMotion();

  const layerRefs = useRef(new Map<string, HTMLDivElement>());
  const mobileLayerRefs = useRef(new Map<string, HTMLDivElement>());
  const suspendUntil = useRef(0);
  const lastAdvance = useRef(Date.now());
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  const activate = (id: string) => {
    lastAdvance.current = Date.now();
    setActiveId(id);
  };
  const suspend = () => {
    suspendUntil.current = Date.now() + SUSPEND_MS;
  };

  // Crossfade image layers on active category change — runs for both viewport sizes.
  useEffect(() => {
    [layerRefs.current, mobileLayerRefs.current].forEach((refMap) => {
      refMap.forEach((el, id) => {
        const opacity = id === activeId ? 1 : 0;
        if (prefersReducedMotion()) {
          el.style.opacity = String(opacity);
        } else {
          const { gsap } = ensureGsap();
          gsap.to(el, { opacity, duration: 0.15, ease: "power1.inOut", overwrite: true });
        }
      });
    });
  }, [activeId]);

  // Auto-advance — suspended after user interaction.
  useEffect(() => {
    if (reduced) return;
    const tick = window.setInterval(() => {
      const now = Date.now();
      if (document.hidden) return;
      if (now < suspendUntil.current) return;
      if (now - lastAdvance.current < AUTO_ADVANCE_MS) return;
      const idx = categories.findIndex((c) => c.id === activeRef.current);
      const next = categories[(idx + 1) % categories.length];
      if (next) activate(next.id);
    }, 500);
    return () => window.clearInterval(tick);
  }, [reduced, categories]);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const activeIdx = categories.findIndex((c) => c.id === activeId);

  // Ref callbacks — separate maps for mobile and desktop so GSAP can target each independently.
  const setLayerRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) layerRefs.current.set(id, el);
    else layerRefs.current.delete(id);
  };
  const setMobileLayerRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) mobileLayerRefs.current.set(id, el);
    else mobileLayerRefs.current.delete(id);
  };

  const mobileImageLayers = categories.map((cat) => (
    <div
      key={cat.id}
      ref={setMobileLayerRef(cat.id)}
      aria-hidden={cat.id !== activeId}
      className="absolute inset-0"
      style={{ opacity: cat.id === firstId ? 1 : 0 }}
    >
      <Image
        src={cat.image}
        alt={cat.alt}
        fill
        sizes="100vw"
        className="object-cover"
        priority={cat.id === firstId}
      />
    </div>
  ));

  const desktopImageLayers = categories.map((cat) => (
    <div
      key={cat.id}
      ref={setLayerRef(cat.id)}
      aria-hidden={cat.id !== activeId}
      className="absolute inset-0"
      style={{ opacity: cat.id === firstId ? 1 : 0 }}
    >
      <Image
        src={cat.desktopImage ?? cat.image}
        alt={cat.alt}
        fill
        sizes="100vw"
        className="object-cover"
        priority={cat.id === firstId}
      />
    </div>
  ));

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE LAYOUT  (hidden on lg+)
          Single full-viewport section: image fills background,
          text overlays on top with gradient for legibility.
      ───────────────────────────────────────────────────────────────────── */}
      <section
        data-theme-section="dark"
        className="relative flex min-h-[100svh] flex-col overflow-hidden lg:hidden"
        onPointerMove={suspend}
        onPointerDown={suspend}
        onKeyDown={suspend}
        onFocus={suspend}
      >
        {/* Background image layers */}
        <div className="absolute inset-0">{mobileImageLayers}</div>

        {/* Gradient: dark at bottom for text, lighter top-to-mid */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-harbor from-30% via-harbor/75 via-60% to-harbor/25" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-8 pt-24">
          <p
            className="uppercase tracking-[0.22em] text-steel"
            style={{ fontFamily: "var(--font-data)", fontSize: "11px" }}
          >
            Categorías
          </p>
          <p
            className="tabular-nums text-steel/60"
            style={{ fontFamily: "var(--font-data)", fontSize: "10px" }}
          >
            {String(activeIdx + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
          </p>
        </div>

        {/* Bottom content — active name + tabs */}
        <div className="relative z-10 mt-auto px-8 pb-14">

          {/* Progress bar — restarts on each activeId change via key */}
          {!reduced && (
            <div className="mb-6 h-[3px] overflow-hidden bg-steel/20">
              <div
                key={activeId}
                className="h-full origin-left bg-oxide"
                style={{ animation: `progressFill ${AUTO_ADVANCE_MS}ms linear forwards` }}
              />
            </div>
          )}

          {/* Active category name */}
          <h2
            className="wings-display uppercase leading-none text-paper"
            style={{ fontSize: "clamp(48px, 13vw, 68px)" }}
          >
            {active?.label}
          </h2>

          {/* Short description */}
          {active?.description && (
            <p
              className="mt-3 text-steel/80"
              style={{ fontFamily: "var(--font-data)", fontSize: "12px", letterSpacing: "0.1em" }}
            >
              {active.description}
            </p>
          )}

          {/* Explore CTA */}
          <Link
            href={active?.href ?? "/categories"}
            className="mt-4 inline-block uppercase tracking-[0.2em] text-paper/70 transition-colors duration-200 hover:text-paper"
            style={{ fontFamily: "var(--font-data)", fontSize: "11px" }}
          >
            Explorar →
          </Link>

          {/* Category tab strip */}
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
            {categories.map((cat) => {
              const isActive = cat.id === activeId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { activate(cat.id); suspend(); }}
                  className="flex flex-col items-start gap-1.5"
                  aria-pressed={isActive}
                >
                  <div
                    className={`h-0.5 w-7 transition-colors duration-300 ${
                      isActive ? "bg-oxide" : "bg-steel/25"
                    }`}
                  />
                  <span
                    className={`uppercase tracking-[0.14em] transition-colors duration-300 ${
                      isActive ? "text-paper" : "text-steel/50"
                    }`}
                    style={{ fontFamily: "var(--font-data)", fontSize: "9px" }}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          DESKTOP LAYOUT  (hidden below lg)
          Full-viewport background image — mirrors mobile layout.
          Left overlay: vertical category list.
          Bottom-right: active category name + description + CTA.
      ───────────────────────────────────────────────────────────────────── */}
      <section
        data-theme-section="dark"
        className="relative hidden min-h-[100svh] flex-col overflow-hidden lg:flex"
        onPointerMove={suspend}
        onPointerDown={suspend}
        onKeyDown={suspend}
        onFocus={suspend}
      >
        {/* Background image layers — full bleed */}
        <div className="absolute inset-0">{desktopImageLayers}</div>

        {/* Bottom-to-top gradient — same as mobile */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-harbor from-30% via-harbor/75 via-60% to-harbor/25" />

        {/* Left vignette for category list legibility */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[420px] bg-gradient-to-r from-harbor/70 to-transparent" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-16 pt-24">
          <p
            className="uppercase tracking-[0.22em] text-steel"
            style={{ fontFamily: "var(--font-data)", fontSize: "11px" }}
          >
            Categorías
          </p>
          <p
            className="tabular-nums text-steel/60"
            style={{ fontFamily: "var(--font-data)", fontSize: "10px" }}
          >
            {String(activeIdx + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
          </p>
        </div>

        {/* Main content row */}
        <div className="relative z-10 flex flex-1">

          {/* Left — vertical category list */}
          <div className="flex w-72 flex-col justify-center px-16 py-12 xl:w-80">
            <ul className="m-0 list-none p-0">
              {categories.map((cat) => {
                const isActive = cat.id === activeId;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onMouseEnter={() => activate(cat.id)}
                      onFocus={() => activate(cat.id)}
                      onClick={() => { activate(cat.id); suspend(); }}
                      aria-pressed={isActive}
                      className={`wings-display block w-full border-l-[3px] py-2.5 pl-5 text-left uppercase transition-colors duration-200 ${
                        isActive
                          ? "border-oxide text-paper"
                          : "border-transparent text-steel/50 hover:text-paper/80"
                      }`}
                      style={{ fontSize: "clamp(20px, 2vw, 30px)", lineHeight: 1.2 }}
                    >
                      {cat.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10">
              <Link
                href="/categories"
                className="inline-block border border-paper/20 px-6 py-2.5 uppercase tracking-[0.14em] text-paper/50 transition-colors duration-200 hover:border-paper/40 hover:text-paper/80"
                style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
              >
                Ver catálogo completo
              </Link>
            </div>
          </div>

          {/* Right — active category detail pushed to bottom */}
          <div className="flex flex-1 flex-col justify-end px-16 pb-16">
            {!reduced && (
              <div className="mb-6 h-[3px] w-20 overflow-hidden bg-steel/20">
                <div
                  key={activeId}
                  className="h-full origin-left bg-oxide"
                  style={{ animation: `progressFill ${AUTO_ADVANCE_MS}ms linear forwards` }}
                />
              </div>
            )}

            <h2
              className="wings-display uppercase leading-none text-paper"
              style={{ fontSize: "clamp(52px, 7vw, 96px)" }}
            >
              {active?.label}
            </h2>

            {active?.description && (
              <p
                className="mt-3 text-steel/80"
                style={{ fontFamily: "var(--font-data)", fontSize: "12px", letterSpacing: "0.1em" }}
              >
                {active.description}
              </p>
            )}

            <Link
              href={active?.href ?? "/categories"}
              className="mt-4 inline-block uppercase tracking-[0.2em] text-paper/70 transition-colors duration-200 hover:text-paper"
              style={{ fontFamily: "var(--font-data)", fontSize: "11px" }}
            >
              Explorar →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
