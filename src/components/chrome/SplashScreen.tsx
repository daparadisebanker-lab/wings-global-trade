"use client";

import { useEffect, useRef, useState } from "react";
import { ensureGsap, prefersReducedMotion } from "@/lib/home/animation";

type Props = {
  onComplete?: () => void;
};

// ─── SVG letterforms — Asset 1/2/3 with fill="currentColor" ─────────────────

function WingsSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 309.2 55.46"
      className={className}
      style={style}
      aria-hidden="true"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M251.78,55.46c-5.78,0-12.68-.71-20.69-2.13l2.66-13.77c2.23.66,5.38,1.29,9.43,1.9,4.06.61,7.28.91,9.66.91.81,0,1.7-.05,2.66-.15s2.02-.29,3.16-.57c1.14-.28,2.09-.74,2.85-1.37.76-.63,1.14-1.38,1.14-2.24,0-1.47-1.75-2.28-5.25-2.43-2.08-.1-3.93-.24-5.55-.42-1.62-.18-3.45-.55-5.48-1.1-2.03-.56-3.72-1.28-5.06-2.17-1.34-.89-2.49-2.12-3.42-3.69-.94-1.57-1.41-3.4-1.41-5.48,0-3.6.84-6.99,2.51-10.16,1.67-3.17,4.01-5.74,7-7.72,4.92-3.25,11.79-4.87,20.62-4.87,7.51,0,13.62.58,18.34,1.75l-2.66,13.47c-6.8-1.52-12.1-2.28-15.9-2.28-2.03,0-4.22.3-6.58.91-2.36.61-3.54,1.62-3.54,3.04,0,.51.71.96,2.13,1.37.96.25,3.04.63,6.24,1.14,2.03.3,3.66.58,4.91.84,1.24.25,2.78.7,4.6,1.33,1.83.63,3.26,1.37,4.3,2.21,1.04.84,1.95,1.97,2.74,3.39.79,1.42,1.18,3.07,1.18,4.94,0,3.6-.93,7.1-2.78,10.5-1.85,3.4-4.27,6.04-7.27,7.91-5.12,3.3-11.97,4.94-20.54,4.94Z"/>
      <path fillRule="evenodd" d="M199.43,55c-3.4,0-6.57-.39-9.51-1.18s-5.59-1.98-7.95-3.58c-2.36-1.6-4.22-3.73-5.59-6.39-1.37-2.66-2.05-5.72-2.05-9.17,0-5.07,1.2-10.18,3.61-15.33,2.41-5.15,5.62-9.19,9.62-12.13,6.09-4.62,14.3-6.92,24.65-6.92,6.19,0,13.46.98,19.65,2.45l-2.31,12.57c-6.09-1.06-11.84-1.86-14.83-1.86-3.3,0-5.99.16-8.06.49-2.08.33-4.02,1-5.82,2.02-1.8,1.01-3.22,2.47-4.26,4.37-1.04,1.9-1.86,4.37-2.47,7.42-.51,2.38-.76,4.51-.76,6.39,0,3.3.87,5.45,2.62,6.47,1.75,1.01,4.43,1.52,8.03,1.52l2.36-.15,3.17-.48,1.27-5.36-8.39-.12,2.37-12.57,23.33.02-5.47,28.79c-9.13,1.83-16.86,2.74-23.2,2.74Z"/>
      <polygon fillRule="evenodd" points="101.11 54.24 82.78 54.24 93.12 .99 111.46 .99 101.11 54.24"/>
      <path fillRule="evenodd" d="M27.31,54.24H5.48C3.75,37.86,1.93,20.11,0,.99h18.11l1.75,36.59h.68L34.46,1.07h18.72l-.61,36.52h.76L69,.99h17.19l-24.88,53.25h-20.85l-.53-29.06h-.76l-11.87,29.06Z"/>
      <path fillRule="evenodd" d="M163.92,54.34l6.59-34.68c2.45-12.91-2.24-18.67-15.15-18.67h-36.23l-10.11,53.36h19.02l7.35-38.81h13.45c1.66.04,3.13,1.59,2.76,4.11l-6.57,34.66,18.89.04Z"/>
      <path fillRule="evenodd" d="M307.82,9.71c-.36,2.83-2.88,5.19-6.12,4.8-2.82-.34-5.24-2.92-4.81-6.22.36-2.79,2.92-5.12,6.16-4.74,2.8.33,5.19,2.92,4.78,6.17h0ZM301.39,2.23c-3.47.47-6.41,3.66-5.85,7.76.48,3.5,3.71,6.41,7.8,5.83,3.42-.48,6.32-3.68,5.8-7.72-.45-3.48-3.68-6.43-7.75-5.87Z"/>
      <path fillRule="evenodd" d="M300.72,8.54v-1.96c1.07-.04,2.84-.24,2.84.96,0,1.22-1.71,1.08-2.84,1h0ZM299.24,12.69h1.49s0-2.97,0-2.97c1.94-.16,2.01,1.39,3.03,2.96l1.81.02c-.12-.33-1.23-2.19-1.54-2.58-.26-.32-.41-.4-.76-.6.2-.12.54-.17.77-.28.77-.39,1.21-1.11,1.09-2.08-.15-1.23-1.15-1.75-2.49-1.75h-3.4s0,7.28,0,7.28Z"/>
    </svg>
  );
}

function GlobalSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 325.96 55.31"
      className={className}
      style={style}
      aria-hidden="true"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M52.26,33.46l2.7-12.48h-27.52l-2.77,13.22h12.01l-1.55,7.28H15.7l5.94-27.65h31.43L55.97.34h-25.9C12.94.34,7.34,4.79,3.63,22.19l-2.43,11.26c-3.71,17.4.88,21.85,18.08,21.85h5.6c17.13,0,23.74-4.45,27.39-21.85Z"/>
      <polygon fillRule="evenodd" points="97.92 54.97 100.82 41.48 74.99 41.48 83.76 .34 67.57 .34 55.9 54.97 97.92 54.97"/>
      <path fillRule="evenodd" d="M157.68,33.46l2.5-11.67c3.64-17.4-1.01-21.79-18.14-21.79h-7.28c-17.2,0-23.68,4.38-27.38,21.79l-2.5,11.67c-3.71,17.4.88,21.85,18.08,21.85h7.28c17.2,0,23.74-4.45,27.45-21.85h0ZM139.74,41.48h-20.37l5.94-27.65h20.3l-5.87,27.65Z"/>
      <path fillRule="evenodd" d="M216.16,38.24c1.28-5.73.4-9.44-3.71-12.41,5.33-3.24,7.15-6.48,8.16-11.53,1.89-9.11-2.02-13.96-12.88-13.96h-34.74l-11.67,54.64h33.39c12.01,0,19.09-5.4,21.45-16.73h0ZM203.14,21.72h-18.48l1.69-7.89h18.48l-1.69,7.89h0ZM199.56,41.48h-19.16l1.69-7.89h19.22l-1.75,7.89Z"/>
      <path fillRule="evenodd" d="M275.98,54.97L268.22.34h-21.58l-31.16,54.64h15.11l6-10.32h22.33l1.48,10.32h15.58ZM256.96,31.77h-13.02l10.39-18.28,2.63,18.28Z"/>
      <polygon fillRule="evenodd" points="323.06 54.97 325.96 41.48 300.12 41.48 308.89 .34 292.71 .34 281.04 54.97 323.06 54.97"/>
    </svg>
  );
}

function TradeSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 284.16 54.64"
      className={className}
      style={style}
      aria-hidden="true"
      fill="currentColor"
    >
      <polygon fillRule="evenodd" points="50.45 13.49 53.29 0 2.9 0 0 13.49 17.13 13.49 8.36 54.64 24.55 54.64 33.32 13.49 50.45 13.49"/>
      <path fillRule="evenodd" d="M106.7,15.92c2.36-11.26-1.15-15.92-14.1-15.92h-33.66l-11.67,54.64h16.26l3.98-18.75h18.55l-3.98,18.75h16.32l2.56-12.21c1.48-7.01,2.97-11.6-3.37-14.97,4.79-2.29,7.69-4.99,9.11-11.53h0ZM88.96,22.46h-18.62l1.96-8.97h18.55l-1.89,8.97Z"/>
      <path fillRule="evenodd" d="M163.83,54.64L156.07,0h-21.58l-31.16,54.64h15.11l6-10.32h22.33l1.48,10.32h15.58ZM144.81,31.43h-13.02l10.39-18.28,2.63,18.28Z"/>
      <path fillRule="evenodd" d="M225.28,32.71l2.36-10.86c3.71-17.4-.94-21.85-18.14-21.85h-28.94l-11.67,54.64h29c17.13,0,23.74-4.52,27.39-21.92h0ZM207.33,41.15h-19.36l5.94-27.66h19.29l-5.87,27.66Z"/>
      <polygon fillRule="evenodd" points="272.49 54.64 275.39 41.15 247.94 41.15 249.49 33.93 276 33.93 278.76 20.71 252.32 20.71 253.87 13.49 281.26 13.49 284.16 0 240.52 0 228.85 54.64 272.49 54.64"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SplashScreen({ onComplete }: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const blade1Ref      = useRef<HTMLDivElement>(null);
  const blade2Ref      = useRef<HTMLDivElement>(null);
  const blade3Ref      = useRef<HTMLDivElement>(null);
  const word1Ref       = useRef<HTMLDivElement>(null);
  const word2Ref       = useRef<HTMLDivElement>(null);
  const word3Ref       = useRef<HTMLDivElement>(null);
  const logoGroupRef   = useRef<HTMLDivElement>(null);
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

    gsap.set([word1Ref.current, word2Ref.current, word3Ref.current], {
      opacity: 0,
      x: -80,
      filter: "blur(16px)",
    });
    gsap.set([blade1Ref.current, blade2Ref.current, blade3Ref.current], {
      scaleX: 0,
      transformOrigin: "left center",
      opacity: 1,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
        onComplete?.();
      },
    });

    // ── WINGS ──────────────────────────────────────────────────────────
    tl.to(blade1Ref.current, {
      scaleX: 1,
      duration: 0.22,
      ease: "power3.out",
    }, 0.1)
    .to(blade1Ref.current, { opacity: 0, duration: 0.35, ease: "power2.in" }, 0.28)
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
    .to(blade2Ref.current, { opacity: 0, duration: 0.30, ease: "power2.in" }, 1.04)
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
    .to(blade3Ref.current, { opacity: 0, duration: 0.28, ease: "power2.in" }, 1.76)
    // Deliberate entry with slight overshoot, then settle
    .to(word3Ref.current, {
      opacity: 1,
      x: 6,
      filter: "blur(0px)",
      duration: 0.38,
      ease: "power2.out",
    }, 1.62)
    .to(word3Ref.current, { x: 0, duration: 0.28, ease: "power1.inOut" }, 2.00);

    // ── COLLECTIVE SETTLE (soul layer) ─────────────────────────────────
    tl.to(logoGroupRef.current, { y: -4, duration: 0.35, ease: "power2.out" }, 2.35)
      .to(logoGroupRef.current, { y: 0,  duration: 0.28, ease: "power2.inOut" }, 2.70);

    // ── EXIT — Wings takes off ─────────────────────────────────────────
    tl.to(containerRef.current, {
      opacity: 0,
      scale: 1.04,
      duration: 0.55,
      ease: "power2.inOut",
    }, 3.10);

    return () => { tl.kill(); };
  }, [onComplete]);

  if (!visible) return null;

  const svgH = "clamp(36px, 9vw, 80px)";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-harbor"
      aria-hidden="true"
    >
      {/* Oxide accent blades */}
      <div ref={blade1Ref} className="absolute left-0 h-[3px] w-full bg-oxide"
           style={{ top: "calc(50% - 3.2em)" }} />
      <div ref={blade2Ref} className="absolute left-0 h-[3px] w-full bg-oxide"
           style={{ top: "calc(50% - 0.2em)" }} />
      <div ref={blade3Ref} className="absolute left-0 h-[3px] w-full bg-oxide"
           style={{ top: "calc(50% + 2.8em)" }} />

      {/* Logo group — receives collective settle */}
      <div ref={logoGroupRef} className="flex flex-col items-start gap-[0.55em]">

        {/* WINGS */}
        <div ref={word1Ref} className="text-paper">
          <WingsSvg style={{ height: svgH, width: "auto", display: "block" }} />
        </div>

        {/* GLOBAL */}
        <div ref={word2Ref} className="text-paper">
          <GlobalSvg style={{ height: svgH, width: "auto", display: "block" }} />
        </div>

        {/* TRADE — oxide */}
        <div ref={word3Ref} className="text-oxide">
          <TradeSvg style={{ height: svgH, width: "auto", display: "block" }} />
        </div>

      </div>
    </div>
  );
}
