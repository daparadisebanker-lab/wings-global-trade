"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import WingsLogo from "@/components/primitives/WingsLogo";
import { createScene, ensureGsap, prefersReducedMotion } from "@/lib/home/animation";

/**
 * Hero. 100svh of real brand photography (golden-hour New Holland) under an
 * ink scrim, with the actual Wings logo lockup centered. The section pins for
 * 100vh of scroll while the logo FLIPs to its destination in the fixed header
 * (measured pixel-match against the header logo node) — same handoff
 * mechanics as the spec build, now carrying the real mark.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const mark = markRef.current;
    const headerMark = document.querySelector<HTMLElement>("[data-header-wordmark]");
    if (!section || !mark) return;

    // Reduced motion: no pin, no scrub. The header logo simply appears once
    // the hero scrolls out of view (IntersectionObserver, not animation).
    if (prefersReducedMotion()) {
      if (!headerMark) return;
      const io = new IntersectionObserver(([entry]) => {
        headerMark.style.opacity = entry.isIntersecting ? "0" : "1";
      });
      io.observe(section);
      return () => io.disconnect();
    }

    const { gsap } = ensureGsap();

    // Load: quiet fade — the photograph carries the entrance.
    const entrance = gsap.fromTo(
      mark,
      { opacity: 0 },
      { opacity: 1, duration: 0.7, ease: "power1.out", delay: 0.15 }
    );

    const cleanup = createScene(section, ({ gsap }) => {
      if (!headerMark) return;

      gsap.set(mark, { transformOrigin: "left top" });

      // FLIP deltas measured section-relative so they are scroll-independent:
      // while pinned the section sits exactly at the viewport origin.
      const delta = () => {
        const r1 = mark.getBoundingClientRect();
        const r2 = headerMark.getBoundingClientRect();
        const rs = section.getBoundingClientRect();
        const scale = gsap.getProperty(mark, "scaleX") as number;
        const x = gsap.getProperty(mark, "x") as number;
        const y = gsap.getProperty(mark, "y") as number;
        const left = r1.left - rs.left - x;
        const top = r1.top - rs.top - y;
        const height = r1.height / scale;
        return {
          dx: r2.left - left,
          dy: r2.top - top,
          s: r2.height / height,
        };
      };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            onLeave: () => {
              headerMark.style.opacity = "1";
              gsap.set(mark, { opacity: 0 });
            },
            onEnterBack: () => {
              headerMark.style.opacity = "0";
              gsap.set(mark, { opacity: 1 });
            },
          },
        })
        .to(mark, {
          x: () => delta().dx,
          y: () => delta().dy,
          scale: () => delta().s,
          ease: "none",
        });
    });

    return () => {
      entrance.kill();
      cleanup();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-theme-section="dark"
      className="relative flex h-[100svh] items-center justify-center overflow-hidden bg-ink"
    >
      <Image
        src="/Desktop Home/Home Intro.png"
        alt="Tractor New Holland importado por Wings en campo al amanecer"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="wings-hero-scrim absolute inset-0" />

      <div ref={markRef} className="relative z-10 flex flex-col items-center px-6">
        <WingsLogo tone="white" height="clamp(96px, 16vw, 220px)" />
      </div>

      <p
        className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 text-center uppercase tracking-[0.28em] text-paper"
        style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
      >
        Soluciones globales en maquinarias
      </p>
    </section>
  );
}
