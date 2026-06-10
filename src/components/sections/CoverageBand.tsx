"use client";

import { useLayoutEffect, useRef } from "react";
import { createScene } from "@/lib/home/animation";

// Geographic scope — all of Latin America: 6 South + 6 Central.
const SOUTH = ["Perú", "Bolivia", "Chile", "Argentina", "Paraguay", "Uruguay"];
const CENTRAL = ["Guatemala", "El Salvador", "Honduras", "Nicaragua", "Costa Rica", "Panamá"];

/**
 * CoverageBand — replaces the tractor crossing. Pure bold typography about
 * the operation's geography: two oversized rows of country names (South
 * America solid navy, Central America outlined) counter-scrub horizontally as
 * the band traverses the viewport. Reduced motion: static type, no scrub.
 */
export default function CoverageBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowARef = useRef<HTMLDivElement>(null);
  const rowBRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const rowA = rowARef.current;
    const rowB = rowBRef.current;
    if (!section || !rowA || !rowB) return;

    return createScene(section, ({ gsap }) => {
      const overflow = (el: HTMLElement) =>
        Math.max(0, el.scrollWidth - window.innerWidth);
      const trigger = {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      };
      gsap.fromTo(rowA, { x: 0 }, { x: () => -overflow(rowA), ease: "none", scrollTrigger: trigger });
      gsap.fromTo(rowB, { x: () => -overflow(rowB) }, { x: 0, ease: "none", scrollTrigger: { ...trigger } });
    });
  }, []);

  // Repeated once so the rows always overflow the viewport (motion never dies
  // on ultra-wide screens).
  const renderRow = (names: string[], outline: boolean) =>
    [...names, ...names].map((name, i) => (
      <span key={`${name}-${i}`} className="inline-flex items-baseline">
        <span className={outline ? "wings-text-outline" : ""}>{name}</span>
        <span aria-hidden="true" className="mx-5 text-oxide">·</span>
      </span>
    ));

  return (
    <section
      ref={sectionRef}
      data-theme-section="light"
      className="overflow-hidden bg-paper py-24 text-ink lg:py-32"
    >
      <div className="wings-container mb-16">
        <p
          className="mb-4 uppercase tracking-[0.22em] text-graphite"
          style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
        >
          Cobertura regional — 12 países
        </p>
        <h2
          className="wings-display m-0 uppercase text-harbor"
          style={{ fontSize: "clamp(44px, 7vw, 110px)", lineHeight: 0.98 }}
        >
          Toda
          <br />
          Latinoamérica
        </h2>
        <p
          className="mt-6 max-w-xl text-graphite"
          style={{ fontFamily: "var(--font-body)", fontSize: "var(--type-lead)", lineHeight: 1.5 }}
        >
          Sudamérica y Centroamérica. Entrega de puerto a planta.
        </p>
      </div>

      {/* Country names — accessible summary once, marquee rows decorative */}
      <p className="sr-only">
        {[...SOUTH, ...CENTRAL].join(", ")}.
      </p>
      <div aria-hidden="true">
        <div
          ref={rowARef}
          className="wings-display w-max whitespace-nowrap uppercase text-harbor"
          style={{ fontSize: "clamp(40px, 5.5vw, 84px)", lineHeight: 1.15 }}
        >
          {renderRow(SOUTH, false)}
        </div>
        <div
          ref={rowBRef}
          className="wings-display mt-2 w-max whitespace-nowrap uppercase"
          style={{ fontSize: "clamp(40px, 5.5vw, 84px)", lineHeight: 1.15 }}
        >
          {renderRow(CENTRAL, true)}
        </div>
      </div>
    </section>
  );
}
