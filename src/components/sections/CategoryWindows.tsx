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

/**
 * CategoryWindows. 50/50 dual panel ≥1024px, stacked below. The index lists
 * the site's REAL catalog categories; the preview crossfades real photography.
 * Hover/focus sets the active category; idle 5s auto-advances; interaction
 * suspends auto-advance for 10s. The active label links to the category route.
 */
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

  // Crossfade the preview layers whenever the active category changes.
  useEffect(() => {
    layerRefs.current.forEach((el, id) => {
      const opacity = id === activeId ? 1 : 0;
      if (prefersReducedMotion()) {
        el.style.opacity = String(opacity);
      } else {
        const { gsap } = ensureGsap();
        gsap.to(el, { opacity, duration: 0.4, ease: "power1.inOut", overwrite: true });
      }
    });
  }, [activeId]);

  // Auto-advance with interaction suspension. Off under reduced motion.
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

  return (
    <section
      data-theme-section="dark"
      className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-2"
    >
      {/* ── Panel A — index ─────────────────────────────────────────────── */}
      <div
        className="wings-wm-panel flex flex-col justify-center bg-harbor px-8 py-20 lg:px-16"
        onPointerMove={suspend}
        onPointerDown={suspend}
        onKeyDown={suspend}
        onFocus={suspend}
      >
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

      {/* ── Panel B — preview ───────────────────────────────────────────── */}
      <div className="relative min-h-[60svh] overflow-hidden bg-graphite lg:min-h-0">
        {categories.map((cat) => (
          <div
            key={cat.id}
            ref={(el) => {
              if (el) layerRefs.current.set(cat.id, el);
              else layerRefs.current.delete(cat.id);
            }}
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
            />
          </div>
        ))}
        <div className="wings-scrim pointer-events-none absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12">
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
  );
}
