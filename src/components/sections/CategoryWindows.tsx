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

  // Crossfade image layers on active category change.
  useEffect(() => {
    layerRefs.current.forEach((el, id) => {
      const opacity = id === activeId ? 1 : 0;
      if (prefersReducedMotion()) {
        el.style.opacity = String(opacity);
      } else {
        const { gsap } = ensureGsap();
        gsap.to(el, { opacity, duration: 0.15, ease: "power1.inOut", overwrite: true });
      }
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

  // Shared ref callback — registers each image layer by category ID.
  const setLayerRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) layerRefs.current.set(id, el);
    else layerRefs.current.delete(id);
  };

  // Image layers rendered once — shared between mobile and desktop layouts
  // via absolute positioning inside each respective container.
  const imageLayers = categories.map((cat) => (
    <div
      key={cat.id}
      ref={setLayerRef(cat.id)}
      aria-hidden={cat.id !== activeId}
      className="absolute inset-0"
      style={{ opacity: cat.id === firstId ? 1 : 0 }}
    >
      <Image
        src={cat.image}
        alt={cat.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
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
        <div className="absolute inset-0">{imageLayers}</div>

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
          Original 50/50 split: text list left, crossfading image right.
      ───────────────────────────────────────────────────────────────────── */}
      <section
        data-theme-section="dark"
        className="hidden min-h-[100svh] lg:grid lg:grid-cols-2"
        onPointerMove={suspend}
        onPointerDown={suspend}
        onKeyDown={suspend}
        onFocus={suspend}
      >
        {/* Panel A — index */}
        <div className="wings-wm-panel flex flex-col justify-center bg-harbor px-16 py-20">
          <p
            className="mb-10 uppercase tracking-[0.22em] text-steel"
            style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
          >
            Soluciones globales en maquinaria
          </p>

          <ul className="m-0 list-none p-0">
            {categories.map((cat) => {
              const isActive = cat.id === activeId;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onMouseEnter={() => activate(cat.id)}
                    onFocus={() => activate(cat.id)}
                    onClick={() => activate(cat.id)}
                    aria-pressed={isActive}
                    className={`wings-display block w-full border-l-[3px] py-3 pl-5 text-left uppercase transition-colors duration-200 ${
                      isActive
                        ? "border-oxide text-paper"
                        : "border-transparent text-steel hover:text-paper"
                    }`}
                    style={{ fontSize: "clamp(28px, 3vw, 44px)", lineHeight: 1.1 }}
                  >
                    {cat.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-12">
            <Link
              href="/categories"
              className="inline-block border border-paper px-8 py-3 uppercase tracking-[0.16em] text-paper transition-colors duration-200 hover:bg-paper hover:text-harbor"
              style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
            >
              Ver catálogo completo
            </Link>
          </div>
        </div>

        {/* Panel B — crossfading preview */}
        <div className="relative overflow-hidden bg-graphite">
          {imageLayers}
          <div className="wings-scrim pointer-events-none absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 p-12">
            {active && (
              <Link
                href={active.href}
                className="group inline-block"
                aria-label={`Ver categoría ${active.label}`}
              >
                <span
                  className="wings-display block uppercase text-paper underline-offset-8 group-hover:underline"
                  style={{ fontSize: "var(--type-title)", lineHeight: 1 }}
                >
                  {active.label}
                </span>
                <span
                  className="mt-3 inline-block uppercase tracking-[0.2em] text-steel transition-colors duration-200 group-hover:text-paper"
                  style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
                >
                  Explorar →
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
