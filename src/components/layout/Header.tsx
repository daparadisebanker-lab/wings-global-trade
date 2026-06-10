"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";
import CategoryMegaMenu from "./CategoryMegaMenu";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 16);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: scrolled
          ? "rgba(0,67,137,0.95)"
          : "rgba(0,67,137,0.80)",
        WebkitBackdropFilter: "blur(12px)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.14)"
          : "1px solid rgba(255,255,255,0)",
        transition:
          "background-color 300ms cubic-bezier(0.4,0,0.2,1), border-color 300ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/wings-logo-complete.svg"
              alt="Wings Global Trade"
              className="h-12 w-auto brightness-0 invert md:h-14"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <CategoryMegaMenu />

            <Link
              href="/about"
              className="text-sm font-medium text-[rgba(244,242,237,0.7)] transition-colors hover:text-[#F4F2ED]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Nosotros
            </Link>

            <Link
              href="/proximamente"
              className="text-sm font-medium text-[rgba(244,242,237,0.5)] transition-colors hover:text-[#F4F2ED]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Hoja de ruta
            </Link>
          </nav>

          {/* Desktop right — dual business model CTAs */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/importacion"
              className="flex items-center gap-1.5 rounded-full border-[1.5px] border-[rgba(244,242,237,0.22)] px-5 py-2 text-xs font-semibold text-[rgba(244,242,237,0.8)] transition-colors hover:border-[rgba(244,242,237,0.45)] hover:bg-[rgba(244,242,237,0.06)] hover:text-[#F4F2ED]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Importar desde Asia
              <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15M19.5 4.5H8.25M19.5 4.5v11.25" />
              </svg>
            </Link>
            <Link
              href="/cotizar"
              className="rounded-full bg-[#C4933F] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar cotización
            </Link>
          </div>

          {/* Mobile toggle */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
