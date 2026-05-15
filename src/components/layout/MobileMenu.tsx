"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  // Track which category accordion is open by slug
  const [openCat, setOpenCat] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setOpenCat(null);
  };

  const toggleCat = (slug: string) =>
    setOpenCat((prev) => (prev === slug ? null : slug));

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-brown-600 hover:text-brown-900 md:hidden"
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

      {open && (
        <div className="absolute left-0 right-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-brown-100 bg-white px-6 pb-6 md:hidden">
          <nav className="flex flex-col pt-4">
            <Link
              href="/"
              onClick={close}
              className="border-b border-brown-100 py-3 text-sm font-medium text-brown-700"
            >
              Home
            </Link>

            {CATEGORIES.map((cat) =>
              cat.subtypes.length > 0 ? (
                /* Category with sub-types → accordion */
                <div key={cat.slug} className="border-b border-brown-50">
                  <button
                    onClick={() => toggleCat(cat.slug)}
                    className="flex w-full items-center justify-between py-4 text-sm font-semibold tracking-wide text-brown-800"
                  >
                    <span>{cat.label}</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-300 ${openCat === cat.slug ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openCat === cat.slug && (
                    <div className="grid grid-cols-1 gap-1 pb-4 pr-2">
                      {cat.subtypes.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={close}
                          className="flex items-center gap-4 rounded-sm bg-cream-50/50 px-3 py-2.5 transition-colors active:bg-cream-100"
                        >
                          <div className="relative h-8 w-10 flex-shrink-0 opacity-70">
                            {sub.icon ? (
                              <Image
                                src={sub.icon}
                                alt={sub.label}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="h-full w-full border border-dashed border-brown-200" />
                            )}
                          </div>
                          <div className="flex flex-1 items-center justify-between">
                            <span className="text-xs font-medium text-brown-700">{sub.label}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-brown-400">{sub.count}</span>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={cat.href}
                        onClick={close}
                        className="mt-2 block rounded-sm border border-brown-100 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-brown-500"
                      >
                        Explore All {cat.shortLabel} →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                /* Category without sub-types → direct link */
                <Link
                  key={cat.slug}
                  href={cat.href}
                  onClick={close}
                  className="border-b border-brown-50 py-4 text-sm font-semibold text-brown-800"
                >
                  {cat.label}
                </Link>
              )
            )}

            <Link
              href="/about"
              onClick={close}
              className="border-b border-brown-100 py-3 text-sm font-medium text-brown-700"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={close}
              className="border-b border-brown-100 py-3 text-sm font-medium text-brown-700"
            >
              Contact
            </Link>
          </nav>
          <div className="mt-5 flex flex-col gap-3">
            <Link href="/sign-in" onClick={close} className="btn-secondary w-full text-center">Sign In</Link>
            <Link href="/sellers/post-listing" onClick={close} className="btn-primary w-full text-center">Post Listing</Link>
          </div>
        </div>
      )}
    </>
  );
}
