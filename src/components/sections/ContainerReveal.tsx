"use client";

import { useLayoutEffect, useRef } from "react";
import WingsWordmark from "@/components/primitives/WingsWordmark";
import { createScene } from "@/lib/home/animation";

/**
 * ContainerReveal (§6.4) — the signature interaction. Pins for 200vh.
 * 0–60%: the oxide container translates in from off-screen right with
 * power2.out mapped across the scrub (deceleration reads as mass).
 * 40–75%: the WINGS wordmark fades in stenciled on the container side, sitting
 * UNDER the corrugation overlay so ridges interrupt the letterforms.
 * 75–100%: one line of copy fades in to the right. X-axis motion only.
 */
export default function ContainerReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stencilRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const stencil = stencilRef.current;
    const copy = copyRef.current;
    if (!section || !container || !stencil || !copy) return;

    return createScene(section, ({ gsap }) => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=200%",
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          container,
          { x: "110vw" },
          { x: 0, duration: 0.6, ease: "power2.out" },
          0
        )
        .fromTo(
          stencil,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: "none" },
          0.4
        )
        .fromTo(
          copy,
          { opacity: 0, x: 32 },
          { opacity: 1, x: 0, duration: 0.25, ease: "none" },
          0.75
        );
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      data-theme-section="dark"
      className="wings-wm-dark relative h-[100svh] overflow-hidden bg-graphite"
    >
      {/* Positioner — static CSS placement; GSAP animates only the inner node's x */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 lg:left-[7%] lg:top-1/2 lg:translate-x-0">
        <div
          ref={containerRef}
          className="relative aspect-[2.4/1] w-[min(86vw,760px)] lg:w-[min(50vw,760px)]"
        >
          {/* body */}
          <div className="absolute inset-0 bg-oxide" />
          {/* stenciled wordmark — under the corrugation so ridges cut the letters */}
          <div
            ref={stencilRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            <WingsWordmark
              className="text-paper"
              style={{ fontSize: "clamp(40px, 6.5vw, 96px)" }}
            />
          </div>
          {/* corrugation overlay — 4px ridge rhythm */}
          <div className="wings-corrugation pointer-events-none absolute inset-0" />
          {/* corner castings */}
          <div className="absolute left-1 top-1 h-4 w-3 border border-ink" />
          <div className="absolute right-1 top-1 h-4 w-3 border border-ink" />
          <div className="absolute bottom-1 left-1 h-4 w-3 border border-ink" />
          <div className="absolute bottom-1 right-1 h-4 w-3 border border-ink" />
          {/* door detail — seam, hinges, lock rod handle */}
          <div className="absolute bottom-2 right-[22%] top-2 border-l border-ink" />
          <div className="absolute right-[22%] top-[20%] h-px w-3 -translate-x-full bg-ink" />
          <div className="absolute bottom-[20%] right-[22%] h-px w-3 -translate-x-full bg-ink" />
          <div className="absolute bottom-[30%] right-[10%] top-[30%] border-l border-ink" />
        </div>
      </div>

      {/* copy — right of the container on desktop, beneath it on mobile */}
      <div className="absolute inset-x-8 top-[64%] lg:inset-x-auto lg:right-[7%] lg:top-1/2 lg:w-[28vw] lg:-translate-y-1/2">
        <p
          ref={copyRef}
          className="m-0 text-paper"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--type-lead)",
            lineHeight: 1.5,
          }}
        >
          Importación de maquinaria desde zona franca. De puerto a planta.
        </p>
      </div>
    </section>
  );
}
