"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import WingsLogo from "@/components/primitives/WingsLogo";
import { categories } from "@/lib/home/categories";

const DURATION_MS = 420;
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

const SECONDARY_LINKS = [
  { label: "Catálogo completo", href: "/categories" },
  { label: "Importación desde Asia", href: "/importacion" },
  { label: "Marcas", href: "/brands" },
  { label: "Nosotros", href: "/about" },
  { label: "Contacto", href: "/contact" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Side drawer navigation. Slides in from the right over an ink scrim. Stays
 * mounted while closed so the exit transition can play; `visibility` flips
 * after the transform settles, which also removes the closed drawer from the
 * tab order. Open/close is a UI state — CSS transitions, no GSAP (§ hard rules).
 */
export default function SideDrawer({ open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Capture the trigger so focus can return to it on close.
    lastFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      lastFocused.current?.focus();
    };
  }, [open, onClose]);

  // Visibility flips instantly on open, but only after the slide finishes on
  // close — keeps the exit transition visible without leaving hidden
  // focusable content in the document.
  const visibility = {
    visibility: open ? ("visible" as const) : ("hidden" as const),
    transitionDelay: open ? "0s, 0s" : `0s, ${DURATION_MS}ms`,
  };

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`wings-drawer-scrim fixed inset-0 z-[110] ${
          open ? "" : "pointer-events-none"
        }`}
        style={{
          opacity: open ? 1 : 0,
          transition: `opacity ${DURATION_MS}ms ${EASE}, visibility 0s linear`,
          ...visibility,
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!open}
        className={`wings-drawer-panel fixed inset-y-0 right-0 z-[120] flex w-[min(420px,90vw)] flex-col overflow-y-auto bg-ink px-8 py-8 lg:px-10 ${
          open ? "" : "pointer-events-none"
        }`}
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: `transform ${DURATION_MS}ms ${EASE}, visibility 0s linear`,
          ...visibility,
        }}
      >
        {/* Top row — mark + close */}
        <div className="flex items-center justify-between">
          <WingsLogo tone="white" height={28} />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="-m-2 p-2 text-steel transition-colors duration-200 hover:text-paper"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 3l14 14M17 3L3 17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        {/* Primary nav — the five real catalog categories */}
        <nav aria-label="Categorías" className="mt-12">
          <ul className="m-0 list-none p-0">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={cat.href}
                  onClick={onClose}
                  className="wings-display block border-l-[3px] border-transparent py-2.5 pl-5 uppercase text-steel transition-colors duration-200 hover:border-oxide hover:text-paper focus-visible:border-oxide focus-visible:text-paper"
                  style={{ fontSize: "clamp(26px, 4vw, 36px)", lineHeight: 1.1 }}
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="wings-drawer-hairline my-8 h-px w-full" />

        {/* Secondary nav */}
        <nav aria-label="Navegación secundaria">
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {SECONDARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="uppercase tracking-[0.18em] text-steel transition-colors duration-200 hover:text-paper"
                  style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom — conversion, pinned */}
        <div className="mt-auto pt-12">
          <Link
            href="/cotizacion"
            onClick={onClose}
            className="flex h-14 w-full items-center justify-center bg-oxide uppercase tracking-[0.12em] text-paper transition-[filter] duration-200 hover:brightness-[0.92]"
            style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
          >
            Solicitar cotización
          </Link>
          <a
            href="https://wa.me/51958381473"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2.5 uppercase tracking-[0.18em] text-steel transition-colors duration-200 hover:text-paper"
            style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp directo
          </a>
        </div>
      </div>
    </>
  );
}
