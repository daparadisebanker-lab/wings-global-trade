"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);

  const close = () => { setOpen(false); setOpenCat(null); };
  const toggleCat = (slug: string) => setOpenCat((prev) => (prev === slug ? null : slug));

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-white/70 hover:text-white md:hidden"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <div className={`absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#001240] px-6 pb-8 md:hidden transition-all duration-200 ease-out ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
          <nav className="flex flex-col pt-3">

            {/* ── Dual business model cards ─────────────────────────── */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <Link
                href="/categories"
                onClick={close}
                className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 transition-colors hover:bg-white/8"
              >
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]" style={{ fontFamily: "var(--font-body)" }}>
                  Catálogo propio
                </span>
                <span className="text-sm font-semibold text-white leading-tight" style={{ fontFamily: "var(--font-body)" }}>
                  Ver inventario
                </span>
                <span className="mt-0.5 text-[10px] text-white/40" style={{ fontFamily: "var(--font-body)" }}>
                  Maquinaria disponible →
                </span>
              </Link>
              <Link
                href="/importacion"
                onClick={close}
                className="flex flex-col gap-1 rounded-xl border border-[#C4933F]/30 bg-[#C4933F]/8 px-4 py-3.5 transition-colors hover:bg-[#C4933F]/12"
              >
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]" style={{ fontFamily: "var(--font-body)" }}>
                  Importación Asia
                </span>
                <span className="text-sm font-semibold text-white leading-tight" style={{ fontFamily: "var(--font-body)" }}>
                  Importar producto
                </span>
                <span className="mt-0.5 text-[10px] text-white/40" style={{ fontFamily: "var(--font-body)" }}>
                  Gestión completa →
                </span>
              </Link>
            </div>

            {/* ── Category accordion ────────────────────────────────── */}
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/25" style={{ fontFamily: "var(--font-body)" }}>
              Catálogo por categoría
            </p>

            {CATEGORIES.map((cat) =>
              cat.subtypes.length > 0 ? (
                <div key={cat.slug} className="border-b border-white/8">
                  <button
                    onClick={() => toggleCat(cat.slug)}
                    className="flex w-full items-center justify-between py-3.5 text-sm font-semibold text-white/80"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <span>{cat.label}</span>
                    <svg
                      className={`h-4 w-4 text-white/40 transition-transform duration-200 ${openCat === cat.slug ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openCat === cat.slug && (
                    <div className="grid grid-cols-1 gap-1 pb-4">
                      {cat.subtypes.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={close}
                          className="flex items-center gap-4 rounded-xl bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/8"
                        >
                          <div className="relative h-7 w-9 flex-shrink-0 opacity-60">
                            {sub.icon ? (
                              <Image src={sub.icon} alt={sub.label} fill className="object-contain brightness-0 invert" />
                            ) : (
                              <div className="h-full w-full rounded border border-dashed border-white/20" />
                            )}
                          </div>
                          <div className="flex flex-1 items-center justify-between">
                            <span className="text-xs font-medium text-white/70" style={{ fontFamily: "var(--font-body)" }}>{sub.label}</span>
                            <span className="text-[10px] font-semibold text-[#C4933F]" style={{ fontFamily: "var(--font-body)" }}>{sub.count}</span>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={cat.href}
                        onClick={close}
                        className="mt-1 block rounded-full border border-white/10 py-2.5 text-center text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:border-white/20 hover:text-white/70"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        Ver todo {cat.shortLabel} →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={cat.slug}
                  href={cat.href}
                  onClick={close}
                  className="border-b border-white/8 py-3.5 text-sm font-semibold text-white/80"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {cat.label}
                </Link>
              )
            )}

            {/* ── Secondary links ───────────────────────────────────── */}
            <Link
              href="/about"
              onClick={close}
              className="border-b border-white/8 py-3.5 text-sm font-medium text-white/50 hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Nosotros
            </Link>
            <Link
              href="/contact"
              onClick={close}
              className="py-3.5 text-sm font-medium text-white/50 hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Contacto
            </Link>
          </nav>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/contact"
              onClick={close}
              className="w-full rounded-full bg-[#C4933F] py-3 text-center text-sm font-semibold text-white hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar cotización
            </Link>
          </div>
      </div>
    </>
  );
}
