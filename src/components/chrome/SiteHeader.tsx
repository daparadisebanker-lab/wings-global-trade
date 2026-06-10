"use client";

import { useEffect } from "react";
import WingsWordmark from "@/components/primitives/WingsWordmark";

/**
 * Locking header (§6.2). Always position: fixed — visually empty (transparent,
 * wordmark hidden) until the hero FLIP handoff completes, which reads as the
 * header "mounting" at the end of the hero pin. Theme (transparent-over-dark /
 * paper-over-light) is driven by [data-theme] on the page root, set here via
 * IntersectionObserver over the section [data-theme-section] markers — no
 * scroll-position math.
 */
export default function SiteHeader() {
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
      // Observe only the top ~6% of the viewport (≈ header height).
      { rootMargin: "0px 0px -94% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className="wings-header fixed inset-x-0 top-0 z-[90] flex h-16 items-center px-6">
      {/* 38px font-size ≈ 28px cap height in Archivo; the hero FLIP pixel-matches
          against this node's measured rect, so the handoff is exact. */}
      <WingsWordmark
        data-header-wordmark
        className="opacity-0"
        style={{ fontSize: "38px" }}
      />
    </header>
  );
}
