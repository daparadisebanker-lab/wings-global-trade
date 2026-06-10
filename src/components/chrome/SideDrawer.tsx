"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import WingsLogo from "@/components/primitives/WingsLogo";
import { categories } from "@/lib/home/categories";
import { ensureGsap, prefersReducedMotion } from "@/lib/home/animation";

const SECONDARY_LINKS = [
  { label: "Catálogo completo", href: "/categories" },
  { label: "Importación desde Asia", href: "/importacion" },
  { label: "Marcas", href: "/brands" },
  { label: "Nosotros", href: "/about" },
  { label: "Contacto", href: "/contact" },
];

const BRAND_LINKS = [
  { name: "New Holland",      href: "/brands/new-holland"      },
  { name: "John Deere",       href: "/brands/john-deere"       },
  { name: "Kubota",           href: "/brands/kubota"           },
  { name: "Massey Ferguson",  href: "/brands/massey-ferguson"  },
];

type Props = { open: boolean; onClose: () => void };

export default function SideDrawer({ open, onClose }: Props) {
  const closeRef    = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Animation targets
  const panelRef      = useRef<HTMLDivElement>(null);
  const scrimRef      = useRef<HTMLDivElement>(null);
  const accentRef     = useRef<HTMLDivElement>(null);
  const topRowRef     = useRef<HTMLDivElement>(null);
  const catLabelRef   = useRef<HTMLParagraphElement>(null);
  const catRefs       = useRef<(HTMLLIElement | null)[]>([]);
  const dividerRef    = useRef<HTMLDivElement>(null);
  const secRefs       = useRef<(HTMLLIElement | null)[]>([]);
  const brandsRowRef  = useRef<HTMLDivElement>(null);
  const ctaRef        = useRef<HTMLDivElement>(null);
  const tlRef         = useRef<gsap.core.Timeline | null>(null);

  // Soul layer — ghost category image
  const [ghostCat, setGhostCat] = useState<string | null>(null);

  // ── Accessibility ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      lastFocused.current?.focus();
    };
  }, [open, onClose]);

  // ── GSAP Choreography ────────────────────────────────────────────────────
  useEffect(() => {
    const { gsap } = ensureGsap();
    const reduced  = prefersReducedMotion();

    const panel  = panelRef.current;
    const scrim  = scrimRef.current;
    const accent = accentRef.current;
    const cats   = catRefs.current.filter((el): el is HTMLLIElement => el !== null);
    const secs   = secRefs.current.filter((el): el is HTMLLIElement => el !== null);

    if (open) {
      if (panel) { panel.style.visibility = "visible"; panel.style.pointerEvents = "auto"; }
      if (scrim) { scrim.style.visibility = "visible"; scrim.style.pointerEvents = "auto"; }

      tlRef.current?.kill();

      if (reduced) {
        gsap.set(panel,  { x: 0 });
        gsap.set(scrim,  { opacity: 0.75 });
        gsap.set(accent, { scaleY: 1 });
        gsap.set(
          [topRowRef.current, catLabelRef.current, ...cats, dividerRef.current, ...secs, brandsRowRef.current, ctaRef.current].filter(Boolean),
          { opacity: 1, x: 0, y: 0 }
        );
        return;
      }

      // ── Open timeline ──────────────────────────────────────────────────
      tlRef.current = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Scrim + panel enter simultaneously
      tlRef.current.fromTo(scrim,  { opacity: 0 }, { opacity: 1, duration: 0.5 },  0);
      tlRef.current.fromTo(panel,  { x: "100%" },  { x: "0%", duration: 0.62 },    0);

      // Oxide accent bar — blade reveals from top
      tlRef.current.fromTo(accent,
        { scaleY: 0, transformOrigin: "top" },
        { scaleY: 1, duration: 0.55, ease: "power2.out" },
        0.08
      );

      // Top row drops in
      tlRef.current.fromTo(topRowRef.current,
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.35 },
        0.24
      );

      // Category eyebrow label
      tlRef.current.fromTo(catLabelRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25 },
        0.34
      );

      // Categories cascade in from the right — the One Animation
      if (cats.length > 0) {
        tlRef.current.fromTo(cats,
          { opacity: 0, x: 32 },
          { opacity: 1, x: 0, duration: 0.48, stagger: 0.075, ease: "power2.out" },
          0.3
        );
      }

      // Divider blade reveal from left
      tlRef.current.fromTo(dividerRef.current,
        { scaleX: 0, transformOrigin: "left" },
        { scaleX: 1, duration: 0.5, ease: "power2.inOut" },
        0.65
      );

      // Secondary links float up
      if (secs.length > 0) {
        tlRef.current.fromTo(secs,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.32, stagger: 0.045 },
          0.72
        );
      }

      // Brand chips
      tlRef.current.fromTo(brandsRowRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3 },
        0.88
      );

      // CTA — arrives last, slight upward drift
      tlRef.current.fromTo(ctaRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4 },
        0.92
      );

    } else {
      tlRef.current?.kill();

      if (reduced) {
        gsap.set(panel, { x: "100%" });
        gsap.set(scrim, { opacity: 0 });
        if (panel) { panel.style.visibility = "hidden"; panel.style.pointerEvents = "none"; }
        if (scrim) { scrim.style.visibility = "hidden"; scrim.style.pointerEvents = "none"; }
        return;
      }

      // ── Close timeline ─────────────────────────────────────────────────
      tlRef.current = gsap.timeline({
        onComplete: () => {
          if (panel) { panel.style.visibility = "hidden"; panel.style.pointerEvents = "none"; }
          if (scrim) { scrim.style.visibility = "hidden"; scrim.style.pointerEvents = "none"; }
          setGhostCat(null);
        },
      });

      // Content collapses inward
      tlRef.current.to(
        [ctaRef.current, brandsRowRef.current, ...secs, dividerRef.current, catLabelRef.current].filter(Boolean),
        { opacity: 0, duration: 0.14 }, 0
      );
      tlRef.current.to(cats,
        { opacity: 0, x: 20, duration: 0.2, stagger: { each: 0.03, from: "end" }, ease: "power2.in" }, 0
      );
      tlRef.current.to(topRowRef.current, { opacity: 0, duration: 0.14 }, 0);

      // Panel exits + accent retracts from bottom
      tlRef.current.to(accent,
        { scaleY: 0, transformOrigin: "bottom", duration: 0.32, ease: "power2.in" }, 0.06
      );
      tlRef.current.to(panel,  { x: "100%", duration: 0.42, ease: "power3.in" }, 0.08);
      tlRef.current.to(scrim,  { opacity: 0, duration: 0.38 }, 0);
    }
  }, [open]);

  return (
    <>
      {/* ── Scrim ────────────────────────────────────────────────────────── */}
      <div
        ref={scrimRef}
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[110] bg-harbor/80 backdrop-blur-[1.5px]"
        style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
      />

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!open}
        className="fixed inset-y-0 right-0 z-[120] flex w-[min(480px,100vw)] flex-col overflow-y-auto overflow-x-hidden bg-harbor"
        style={{ transform: "translateX(100%)", visibility: "hidden", pointerEvents: "none" }}
      >
        {/* ── Soul layer: ghost category images ──────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: ghostCat === cat.id ? 0.07 : 0 }}
            >
              <Image
                src={cat.image}
                alt=""
                fill
                sizes="480px"
                className="object-cover object-right"
                aria-hidden
              />
            </div>
          ))}
        </div>

        {/* ── Oxide accent blade — left edge ─────────────────────────────── */}
        <div
          ref={accentRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-oxide"
          style={{ transformOrigin: "top", transform: "scaleY(0)" }}
        />

        {/* ── Inner layout ─────────────────────────────────────────────────  */}
        <div className="relative flex flex-1 flex-col px-10 py-8 pl-[54px]">

          {/* Top row: logo + close */}
          <div
            ref={topRowRef}
            className="flex items-center justify-between"
            style={{ opacity: 0 }}
          >
            <WingsLogo tone="white" height={28} />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="group -m-3 p-3 text-steel transition-colors duration-200 hover:text-paper"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M2 2l14 14M16 2 2 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ── Primary nav ─────────────────────────────────────────────── */}
          <nav aria-label="Categorías" className="mt-10">
            <p
              ref={catLabelRef}
              className="mb-5 uppercase tracking-[0.24em] text-steel/40"
              style={{ fontFamily: "var(--font-data)", fontSize: "9px", opacity: 0 }}
            >
              Categorías
            </p>

            <ul className="m-0 list-none p-0">
              {categories.map((cat, i) => (
                <li
                  key={cat.id}
                  ref={(el) => { catRefs.current[i] = el; }}
                  className="group"
                  style={{ opacity: 0 }}
                  onMouseEnter={() => setGhostCat(cat.id)}
                  onMouseLeave={() => setGhostCat(null)}
                >
                  <Link
                    href={cat.href}
                    onClick={onClose}
                    className="relative flex items-baseline gap-4 border-l-[2px] border-transparent py-[11px] pl-4 transition-all duration-[200ms] hover:border-oxide"
                  >
                    {/* Index number */}
                    <span
                      className="w-4 shrink-0 text-right tabular-nums text-steel/35 transition-colors duration-200 group-hover:text-oxide"
                      style={{ fontFamily: "var(--font-data)", fontSize: "9px", lineHeight: 1 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Label */}
                    <span
                      className="wings-display block uppercase text-steel/70 transition-all duration-[180ms] group-hover:translate-x-1.5 group-hover:text-paper"
                      style={{ fontSize: "clamp(26px, 4.5vw, 38px)", lineHeight: 1.05 }}
                    >
                      {cat.label}
                    </span>

                    {/* Description — slides in on hover (lg only) */}
                    <span
                      className="ml-auto hidden shrink-0 self-center uppercase tracking-[0.1em] text-oxide/0 transition-all duration-200 group-hover:text-oxide/60 lg:block"
                      style={{ fontFamily: "var(--font-data)", fontSize: "8px" }}
                    >
                      {cat.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Divider ────────────────────────────────────────────────────  */}
          <div
            ref={dividerRef}
            className="my-7 h-px w-full bg-steel/15"
            style={{ transform: "scaleX(0)", transformOrigin: "left" }}
          />

          {/* ── Secondary nav ──────────────────────────────────────────────  */}
          <nav aria-label="Navegación secundaria">
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {SECONDARY_LINKS.map((link, i) => (
                <li
                  key={link.href}
                  ref={(el) => { secRefs.current[i] = el; }}
                  style={{ opacity: 0 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="group inline-flex items-center gap-2.5 uppercase tracking-[0.18em] text-steel/70 transition-colors duration-200 hover:text-paper"
                    style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
                  >
                    {link.label}
                    <span className="block h-px w-0 bg-oxide transition-all duration-300 group-hover:w-4" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Brand chips ────────────────────────────────────────────────  */}
          <div ref={brandsRowRef} className="mt-8" style={{ opacity: 0 }}>
            <p
              className="mb-3 uppercase tracking-[0.24em] text-steel/35"
              style={{ fontFamily: "var(--font-data)", fontSize: "8px" }}
            >
              Marcas
            </p>
            <div className="flex flex-wrap gap-2">
              {BRAND_LINKS.map((b) => (
                <Link
                  key={b.name}
                  href={b.href}
                  onClick={onClose}
                  className="border border-steel/20 px-3 py-1.5 uppercase tracking-[0.12em] text-steel/50 transition-all duration-200 hover:border-oxide/50 hover:text-paper"
                  style={{ fontFamily: "var(--font-data)", fontSize: "8px" }}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Bottom CTA ─────────────────────────────────────────────────  */}
          <div ref={ctaRef} className="mt-auto pt-10" style={{ opacity: 0 }}>

            {/* Primary CTA — oxide fill */}
            <Link
              href="/cotizacion"
              onClick={onClose}
              className="relative flex h-14 w-full items-center justify-center overflow-hidden bg-oxide uppercase tracking-[0.14em] text-paper transition-[filter] duration-200 hover:brightness-[0.88]"
              style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
            >
              Solicitar cotización
            </Link>

            {/* WhatsApp secondary CTA */}
            <a
              href="https://wa.me/51958381473"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-3 uppercase tracking-[0.18em] text-steel/60 transition-colors duration-200 hover:text-paper"
              style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp directo
            </a>

          </div>
        </div>
      </div>
    </>
  );
}
