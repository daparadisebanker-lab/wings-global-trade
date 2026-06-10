"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCatalog,
  IconImport,
  IconQuote,
  IconWhatsApp,
} from "@/components/icons";

const WA_URL = "https://wa.me/51958381473";

const ITEMS = [
  { label: "Catálogo", href: "/categories", Icon: IconCatalog },
  { label: "Importar", href: "/importacion", Icon: IconImport },
  { label: "Cotizar", href: "/cotizar", Icon: IconQuote },
] as const;

/** Blue-family detector: navy/brand blues trigger the inverse (white) mode. */
function isBlue(rgb: string): boolean {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return false;
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return b > 70 && b > r + 30 && b > g + 20;
}

/**
 * Bottom action bar — brand navy by default. When the page section behind it
 * is ALSO blue (navy panels, footer), it inverts: white bar, navy icons, so
 * it never disappears blue-on-blue. Press/active state is gold. Mode is
 * detected by sampling the effective background color just above the bar on
 * scroll (rAF-throttled), so it works on every route without page markup.
 */
export default function MobileBottomBar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [inverse, setInverse] = useState(false);

  useEffect(() => {
    let raf = 0;

    const sample = () => {
      raf = 0;
      const nav = navRef.current;
      if (!nav) return;
      const y = Math.max(0, nav.getBoundingClientRect().top - 2);
      let el = document.elementFromPoint(window.innerWidth / 2, y) as HTMLElement | null;
      let bg = "";
      while (el && el !== document.documentElement) {
        const c = getComputedStyle(el).backgroundColor;
        if (c && c !== "transparent" && !c.startsWith("rgba(0, 0, 0, 0)")) {
          bg = c;
          break;
        }
        el = el.parentElement;
      }
      setInverse(isBlue(bg));
    };

    const queue = () => {
      if (!raf) raf = requestAnimationFrame(sample);
    };
    sample();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [pathname]);

  const itemClass = (active: boolean) =>
    `group flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 pb-1.5 pt-2 transition-colors duration-200 active:text-gold ${
      active
        ? "text-gold"
        : inverse
          ? "text-navy/65 hover:text-navy focus-visible:text-navy"
          : "text-white/65 hover:text-white focus-visible:text-white"
    }`;

  // Fixed 30px — a % height collapses in an auto-height flex row.
  const divider = (
    <span
      aria-hidden="true"
      className={`h-[30px] w-px self-center transition-colors duration-300 ${
        inverse ? "bg-navy/15" : "bg-white/15"
      }`}
    />
  );

  return (
    <nav
      ref={navRef}
      aria-label="Navegación inferior"
      className={`fixed bottom-0 left-0 right-0 z-40 flex border-t transition-colors duration-300 md:hidden ${
        inverse ? "border-navy/15 bg-warm-white" : "border-white/15 bg-navy"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS.map(({ label, href, Icon }, i) => {
        const active = pathname.startsWith(href);
        return (
          <Fragment key={href}>
            {i > 0 && divider}
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={itemClass(active)}
            >
              <Icon className="h-[22px] w-[22px]" />
              <span
                className="text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {label}
              </span>
              <span
                aria-hidden="true"
                className={`h-0.5 w-4 rounded-full bg-gold transition-opacity duration-200 ${
                  active ? "opacity-100" : "opacity-0 group-active:opacity-100"
                }`}
              />
            </Link>
          </Fragment>
        );
      })}
      {divider}
      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className={itemClass(false)}>
        <span className="relative">
          <IconWhatsApp className="h-[22px] w-[22px]" />
          <span
            className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#25D366" }}
            aria-hidden="true"
          />
        </span>
        <span
          className="text-[9.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          WhatsApp
        </span>
        <span
          aria-hidden="true"
          className="h-0.5 w-4 rounded-full bg-gold opacity-0 transition-opacity duration-200 group-active:opacity-100"
        />
      </a>
    </nav>
  );
}
