"use client";

import { useLayoutEffect, useRef } from "react";
import WingsWordmark from "@/components/primitives/WingsWordmark";
import { createScene, ensureGsap, prefersReducedMotion } from "@/lib/home/animation";

/**
 * Hero (§6.1). 100svh, ink background, wordmark alone. Letters stagger in on
 * load (≤900ms). The section pins for 100vh of scroll while the wordmark
 * FLIPs to its destination in the fixed header (measured pixel-match against
 * the header wordmark node), then the header instance takes over.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const mark = markRef.current;
    const headerMark = document.querySelector<HTMLElement>("[data-header-wordmark]");
    if (!section || !mark) return;

    // Reduced motion: no pin, no scrub. The header wordmark simply appears
    // once the hero scrolls out of view (IntersectionObserver, not animation).
    if (prefersReducedMotion()) {
      if (!headerMark) return;
      const io = new IntersectionObserver(([entry]) => {
        headerMark.style.opacity = entry.isIntersecting ? "0" : "1";
      });
      io.observe(section);
      return () => io.disconnect();
    }

    const { gsap } = ensureGsap();

    // Load: letter stagger — 5 × 60ms + 400ms ≈ 640ms total (§6.1 ≤ 900ms).
    const letters = mark.querySelectorAll("[data-wm-letter]");
    const entrance = gsap.fromTo(
      letters,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, stagger: 0.06, ease: "none" }
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
        // Untransformed origin of the hero mark within the section:
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
      className="wings-wm-dark flex h-[100svh] items-center justify-center overflow-hidden bg-ink"
    >
      <h1 ref={markRef} className="m-0 inline-flex leading-none">
        <WingsWordmark
          className="text-paper"
          style={{ fontSize: "var(--type-hero)" }}
        />
      </h1>
    </section>
  );
}
