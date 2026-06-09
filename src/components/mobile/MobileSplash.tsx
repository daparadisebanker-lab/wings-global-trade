"use client";

import { useEffect, useState } from "react";

type Phase = "visible" | "fading" | "gone";

export default function MobileSplash() {
  const [phase, setPhase] = useState<Phase>("visible");

  useEffect(() => {
    const fadeStart = setTimeout(() => setPhase("fading"), 2800);
    const unmount  = setTimeout(() => setPhase("gone"),   3400);
    return () => {
      clearTimeout(fadeStart);
      clearTimeout(unmount);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#004389] md:hidden"
      style={{
        opacity:        phase === "fading" ? 0 : 1,
        transform:      phase === "fading" ? "translateX(-28px)" : "translateX(0)",
        transition:     phase === "fading" ? "opacity 0.55s cubic-bezier(0.4,0,1,1), transform 0.55s cubic-bezier(0.4,0,1,1)" : "none",
        pointerEvents:  phase === "fading" ? "none" : "auto",
      }}
    >
      {/* Background — very subtle parallax, no aggressive zoom */}
      <img
        src="/images/splah-hero.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ animation: "splash-drift 4.5s ease-out forwards" }}
      />

      {/* Gradient — sky clear at top, solid brand blue at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,67,137,0.08) 20%, rgba(0,67,137,0.5) 52%, rgba(0,67,137,0.9) 70%, #004389 82%)",
        }}
      />

      {/* Content block — bottom third, left-aligned, matches brandbook layout */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-14">

        {/* Tagline */}
        <p
          className="mb-6 text-[44px] font-extrabold uppercase leading-[0.95] tracking-tight text-white"
          style={{
            fontFamily: "var(--font-display)",
            animation: "splash-up 0.5s cubic-bezier(0,0,0.2,1) 0.18s both",
          }}
        >
          SOLUCIONES<br />
          GLOBALES EN<br />
          MAQUINARIAS
        </p>

        {/* Wings logo */}
        <div style={{ animation: "splash-up 0.5s cubic-bezier(0,0,0.2,1) 0.34s both" }}>
          <img
            src="/wings-logo-complete.svg"
            alt="Wings Global Trade"
            className="h-9 w-auto brightness-0 invert"
          />
        </div>

      </div>

      <style>{`
        @keyframes splash-drift {
          from { transform: scale(1.03) translateX(6px); }
          to   { transform: scale(1.00) translateX(0px); }
        }
        @keyframes splash-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
