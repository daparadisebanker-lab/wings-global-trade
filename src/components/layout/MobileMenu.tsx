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
        className="p-2 text-[rgba(244,242,237,0.7)] hover:text-[#F4F2ED] md:hidden"
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

      <div
        className={`absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto px-6 pb-8 md:hidden transition-all duration-200 ease-out ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
        style={{
          backgroundColor: "rgba(6,38,99,0.97)",
          WebkitBackdropFilter: "blur(12px)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.14)",
        }}
      >
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
              cat.subtypes.some(s => !s.comingSoon) ? (
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
                      {cat.subtypes.filter((s) => !s.comingSoon).map((sub) => (
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
              className="py-3.5 text-sm font-medium text-white/50 hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Nosotros
            </Link>
          </nav>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/cotizar"
              onClick={close}
              className="w-full rounded-full bg-[#C4933F] py-3 text-center text-sm font-semibold text-white hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar cotización
            </Link>
            <a
              href="https://wa.me/51958381473"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 py-3 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/18"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>
      </div>
    </>
  );
}
