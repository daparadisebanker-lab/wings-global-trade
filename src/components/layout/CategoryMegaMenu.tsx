"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { CATEGORIES, type Category } from "@/lib/categories";

export default function CategoryMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Link
        href="/categories"
        className={`flex items-center gap-1.5 py-5 text-sm font-medium transition-colors ${
          isOpen ? "text-white" : "text-white/70 hover:text-white"
        }`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        Catálogo
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {isOpen && (
        <div className="absolute left-0 top-full z-[100] flex w-[780px] -translate-x-4 overflow-hidden rounded-2xl border border-white/10 bg-[#001240] shadow-[0_24px_64px_rgba(0,0,0,0.4)]">

          {/* Sidebar */}
          <div className="w-56 border-r border-white/8 py-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                onMouseEnter={() => setActiveCategory(cat)}
                className={`flex cursor-pointer items-center justify-between px-5 py-3.5 transition-colors ${
                  activeCategory?.slug === cat.slug
                    ? "border-r-2 border-[#C4933F] bg-white/6 text-white"
                    : "text-white/50 hover:bg-white/4 hover:text-white/80"
                }`}
              >
                <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>
                  {cat.label}
                </span>
                <svg className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>

          {/* Subcategories panel */}
          <div className="flex-1 max-h-[480px] overflow-y-auto p-7">
            <div className="mb-5 border-b border-white/8 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]" style={{ fontFamily: "var(--font-body)" }}>
                {activeCategory?.label}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                {activeCategory?.description}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-x-6 gap-y-5">
              {activeCategory?.subtypes.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-start gap-3"
                >
                  <div className="relative h-10 w-14 flex-shrink-0 rounded-lg bg-white/5 p-1.5 transition-colors group-hover:bg-white/10">
                    {sub.icon ? (
                      <Image
                        src={sub.icon}
                        alt={sub.label}
                        fill
                        className="object-contain p-1 opacity-50 transition-opacity group-hover:opacity-80 brightness-0 invert"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#C4933F]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/70 transition-colors group-hover:text-white" style={{ fontFamily: "var(--font-body)" }}>
                      {sub.label}
                    </p>
                    <p className="text-[10px] text-[#C4933F]/70" style={{ fontFamily: "var(--font-body)" }}>
                      {sub.count} modelos
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href={activeCategory?.href || "#"}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/60 transition-colors hover:border-[#C4933F] hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Ver todo {activeCategory?.shortLabel} →
              </Link>
              <Link
                href="/categories"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-semibold uppercase tracking-widest text-[#C4933F]/50 transition-colors hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Todos los servicios ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
