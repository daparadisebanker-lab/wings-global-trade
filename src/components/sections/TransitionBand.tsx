"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { createScene } from "@/lib/home/animation";

/**
 * TransitionBand. 80vh, brand-navy→paper horizontal gradient. A real New
 * Holland side-profile cutout (faces left — its direction of travel) makes a
 * full-page crossing: enters fully off-screen right, exits fully off-screen
 * left, scrubbed across the band's entire traversal of the viewport.
 * Under prefers-reduced-motion the scene never runs and a scoped CSS rule
 * (.wings-band-tractor) parks the cutout dead-center instead.
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

      // Width via rect — translate doesn't affect it, so this stays
      // transform-independent and safe to re-evaluate on refresh.
      const tractorWidth = () => tractor.getBoundingClientRect().width;
      // From center (x = 0): +halfViewport +halfTractor +40px puts the left
      // edge just past the right viewport edge; mirrored for the exit.
      const offscreen = () => (window.innerWidth + tractorWidth()) / 2 + 40;

      gsap.fromTo(
        tractor,
        { x: offscreen },
        {
          x: () => -offscreen(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      data-theme-section="light"
      className="relative h-[80vh] overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, var(--color-harbor) 0%, var(--color-paper) 100%)",
      }}
    >
      <div
        ref={tractorRef}
        className="wings-band-tractor absolute left-1/2 top-1/2 aspect-[4/3] w-[min(88vw,880px)] -translate-y-1/2"
      >
        <Image
          src="/images/listings/unknown-snh704/hero.png"
          alt="Tractor New Holland SNH704 de perfil"
          fill
          sizes="(max-width: 1024px) 88vw, 880px"
          className="object-contain drop-shadow-2xl"
        />
      </div>
    </section>
  );
}
