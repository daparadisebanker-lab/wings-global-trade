"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { createScene } from "@/lib/home/animation";

/**
 * TransitionBand. 70vh, brand-navy→paper horizontal gradient. A real New
 * Holland side-profile cutout (faces left — its direction of travel) scrubs
 * from viewport center to the left edge: actual product instead of line art,
 * same physical right-to-left motion vocabulary.
 */
export default function TransitionBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const tractorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const tractor = tractorRef.current;
    if (!section || !tractor) return;

    return createScene(section, ({ gsap }) => {
      // Center via xPercent so GSAP's x remains free for travel.
      gsap.set(tractor, { xPercent: -50 });

      // Transform-independent travel distance to the left edge.
      const travel = () => {
        const x = gsap.getProperty(tractor, "x") as number;
        return -(tractor.getBoundingClientRect().left - x);
      };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 30%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(tractor, { x: travel, ease: "none" });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      data-theme-section="light"
      className="relative h-[70vh] overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, var(--color-harbor) 0%, var(--color-paper) 100%)",
      }}
    >
      <div
        ref={tractorRef}
        className="absolute left-1/2 top-1/2 aspect-[4/3] w-[min(56vw,420px)] -translate-y-1/2"
      >
        <Image
          src="/images/listings/unknown-snh704/hero.png"
          alt="Tractor New Holland SNH704 de perfil"
          fill
          sizes="(max-width: 1024px) 56vw, 420px"
          className="object-contain drop-shadow-2xl"
        />
      </div>
    </section>
  );
}
