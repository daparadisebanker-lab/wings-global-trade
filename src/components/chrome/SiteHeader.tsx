"use client";

import { useEffect, useState } from "react";
import WingsLogo from "@/components/primitives/WingsLogo";
import SideDrawer from "@/components/chrome/SideDrawer";

/**
 * Locking header. Always position: fixed — visually empty (transparent, logo
 * hidden) until the hero FLIP handoff completes, which reads as the header
 * "mounting" at the end of the hero pin. Theme (transparent-over-dark /
 * paper-over-light) is driven by [data-theme] on the page root, set here via
 * IntersectionObserver over the section [data-theme-section] markers — no
 * scroll-position math. Also owns the side-drawer open state.
 */
export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-page="wings-home"]');
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-theme-section]")
    );
    if (!root || sections.length === 0) return;

    const intersecting = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) intersecting.set(entry.target, entry.isIntersecting);
        // The section currently under the header band = last one in DOM order
        // still intersecting the top sliver of the viewport.
        const active = sections.filter((s) => intersecting.get(s)).pop();
        if (active?.dataset.themeSection) {
          root.dataset.theme = active.dataset.themeSection;
        }
      },
      // Observe only the top ~7% of the viewport (≈ header height).
      { rootMargin: "0px 0px -93% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <header className="wings-header fixed inset-x-0 top-0 z-[90] flex h-20 items-center justify-between px-6">
        {/* The hero FLIP pixel-matches against this node's measured rect.
            data-header-logo-img switches white↔navy with the header theme. */}
        <WingsLogo data-header-wordmark height={48} className="opacity-0 wings-header-logo" />

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          className="flex items-center gap-3 uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
        >
          {/* Two staggered lines, asymmetric — currentColor follows the header theme */}
          <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden="true">
            <path d="M0 3.25h26" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 8.75h18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Menú
        </button>
      </header>

      {/* Sibling of <header>, never a child — the header's z-[90] stacking
          context would cap the drawer below the z-[100] fixed CTA bar. */}
      <SideDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
