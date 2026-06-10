"use client";

import { useEffect, useRef, useState } from "react";
import { ensureGsap, prefersReducedMotion } from "@/lib/home/animation";

type Props = {
  onComplete?: () => void;
};

export default function SplashScreen({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blade1Ref = useRef<HTMLDivElement>(null);
  const blade2Ref = useRef<HTMLDivElement>(null);
  const blade3Ref = useRef<HTMLDivElement>(null);
  const word1Ref = useRef<HTMLDivElement>(null);
  const word2Ref = useRef<HTMLDivElement>(null);
  const word3Ref = useRef<HTMLDivElement>(null);
  const logoGroupRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const reduced = prefersReducedMotion();

    if (reduced) {
      const t = window.setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 400);
      return () => window.clearTimeout(t);
    }

    const { gsap } = ensureGsap();

    // Set initial states
    gsap.set([word1Ref.current, word2Ref.current, word3Ref.current], {
      opacity: 0,
      x: -90,
      filter: "blur(18px)",
    });
    gsap.set([blade1Ref.current, blade2Ref.current, blade3Ref.current], {
      scaleX: 0,
      transformOrigin: "left center",
      opacity: 1,
    });
    gsap.set(logoGroupRef.current, { y: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
        onComplete?.();
      },
    });

    // ── WINGS ──────────────────────────────────────────────────────────
    // Oxide blade fires first
    tl.to(blade1Ref.current, {
      scaleX: 1,
      duration: 0.22,
      ease: "power3.out",
    }, 0.1)
    .to(blade1Ref.current, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
    }, 0.28)
    // WINGS slams in — fastest, most kinetic
    .to(word1Ref.current, {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      duration: 0.44,
      ease: "power4.out",
    }, 0.22);

    // ── GLOBAL ─────────────────────────────────────────────────────────
    tl.to(blade2Ref.current, {
      scaleX: 1,
      duration: 0.20,
      ease: "power3.out",
    }, 0.88)
    .to(blade2Ref.current, {
      opacity: 0,
      duration: 0.30,
      ease: "power2.in",
    }, 1.04)
    // GLOBAL — heavier, more expansive
    .to(word2Ref.current, {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      duration: 0.50,
      ease: "power3.out",
    }, 0.88);

    // ── TRADE ──────────────────────────────────────────────────────────
    tl.to(blade3Ref.current, {
      scaleX: 1,
      duration: 0.18,
      ease: "power3.out",
    }, 1.62)
    .to(blade3Ref.current, {
      opacity: 0,
      duration: 0.28,
      ease: "power2.in",
    }, 1.76)
    // TRADE — most deliberate, slight overshoot then settle
    .to(word3Ref.current, {
      opacity: 1,
      x: 6,
      filter: "blur(0px)",
      duration: 0.38,
      ease: "power2.out",
    }, 1.62)
    .to(word3Ref.current, {
      x: 0,
      duration: 0.28,
      ease: "power1.inOut",
    }, 2.00);

    // ── COLLECTIVE SETTLE (soul layer) ─────────────────────────────────
    // All three words take a breath together
    tl.to(logoGroupRef.current, {
      y: -4,
      duration: 0.35,
      ease: "power2.out",
    }, 2.35)
    .to(logoGroupRef.current, {
      y: 0,
      duration: 0.28,
      ease: "power2.inOut",
    }, 2.70);

    // ── EXIT — Wings takes off ─────────────────────────────────────────
    // Canvas scales up (departure) while fading
    tl.to(containerRef.current, {
      opacity: 0,
      scale: 1.04,
      duration: 0.55,
      ease: "power2.inOut",
    }, 3.10);

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-harbor"
      aria-hidden="true"
    >
      {/* Oxide accent blades — fire before each word */}
      <div
        ref={blade1Ref}
        className="absolute left-0 h-[3px] w-full bg-oxide"
        style={{ top: "calc(50% - 2.8em)" }}
      />
      <div
        ref={blade2Ref}
        className="absolute left-0 h-[3px] w-full bg-oxide"
        style={{ top: "calc(50% - 0.1em)" }}
      />
      <div
        ref={blade3Ref}
        className="absolute left-0 h-[3px] w-full bg-oxide"
        style={{ top: "calc(50% + 2.6em)" }}
      />

      {/* Logo group — receives collective settle animation */}
      <div ref={logoGroupRef} className="flex flex-col items-start leading-none">
        {/* WINGS */}
        <div
          ref={word1Ref}
          className="wings-display uppercase text-paper"
          style={{ fontSize: "clamp(56px, 14vw, 120px)", lineHeight: 1 }}
        >
          WINGS
        </div>

        {/* GLOBAL */}
        <div
          ref={word2Ref}
          className="wings-display uppercase text-paper"
          style={{ fontSize: "clamp(56px, 14vw, 120px)", lineHeight: 1 }}
        >
          GLOBAL
        </div>

        {/* TRADE */}
        <div
          ref={word3Ref}
          className="wings-display uppercase text-oxide"
          style={{ fontSize: "clamp(56px, 14vw, 120px)", lineHeight: 1 }}
        >
          TRADE
        </div>
      </div>
    </div>
  );
}
