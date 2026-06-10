"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      className="fixed right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E4DB] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.10)] transition-all duration-200 hover:border-[#C4933F] hover:shadow-[0_2px_16px_rgba(196,147,63,0.25)] md:right-6 md:h-11 md:w-11"
      style={{ bottom: "calc(72px + env(safe-area-inset-bottom))" }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 12V4M4 8l4-4 4 4" stroke="#1C1A16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
