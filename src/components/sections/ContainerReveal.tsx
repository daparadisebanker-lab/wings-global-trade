"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import WingsLogo from "@/components/primitives/WingsLogo";
import { createScene } from "@/lib/home/animation";

/**
 * ContainerReveal — the signature interaction. Pins for 200vh against the
 * real container-port photograph (graphite-tinted so it reads as backdrop).
 * 0–60%: the oxide container translates in from off-screen right with
 * power2.out mapped across the scrub (deceleration reads as mass).
 * 40–75%: the real Wings logo fades in stenciled on the container side,
 * sitting UNDER the corrugation overlay so ridges interrupt the mark.
 * 75–100%: one line of copy fades in. X-axis motion only.
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
      className="relative h-[100svh] overflow-hidden bg-graphite"
    >
      {/* Real port photography, tinted to backdrop level */}
      <Image
        src="/hero-bg.png"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="wings-photo-tint absolute inset-0" />

      {/* Positioner — static CSS placement; GSAP animates only the inner node's x */}
      <div className="absolute left-1/2 top-[38%] z-10 -translate-x-1/2 -translate-y-1/2 lg:left-[7%] lg:top-1/2 lg:translate-x-0">
        <div
          ref={containerRef}
          className="relative aspect-[2.4/1] w-[min(86vw,760px)] shadow-2xl"
        >
          {/* body */}
          <div className="absolute inset-0 bg-oxide" />
          {/* stenciled real logo — under the corrugation so ridges cut the mark */}
          <div
            ref={stencilRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            <WingsLogo tone="white" height="clamp(56px, 9vw, 130px)" className="opacity-90" />
          </div>
          {/* corrugation overlay — 4px ridge rhythm */}
          <div className="wings-corrugation pointer-events-none absolute inset-0" />
          {/* corner castings */}
          <div className="absolute left-1 top-1 h-4 w-3 border border-ink" />
          <div className="absolute right-1 top-1 h-4 w-3 border border-ink" />
          <div className="absolute bottom-1 left-1 h-4 w-3 border border-ink" />
          <div className="absolute bottom-1 right-1 h-4 w-3 border border-ink" />
          {/* door detail — seam, hinges, lock rod */}
          <div className="absolute bottom-2 right-[22%] top-2 border-l border-ink" />
          <div className="absolute right-[22%] top-[20%] h-px w-3 -translate-x-full bg-ink" />
          <div className="absolute bottom-[20%] right-[22%] h-px w-3 -translate-x-full bg-ink" />
          <div className="absolute bottom-[30%] right-[10%] top-[30%] border-l border-ink" />
        </div>
      </div>

      {/* copy — right of the container on desktop, beneath it on mobile */}
      <div className="absolute inset-x-8 top-[64%] z-10 lg:inset-x-auto lg:right-[7%] lg:top-1/2 lg:w-[28vw] lg:-translate-y-1/2">
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
