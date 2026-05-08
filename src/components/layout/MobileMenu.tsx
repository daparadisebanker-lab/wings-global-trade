"use client";

import Link from "next/link";
import { useState } from "react";

const TRACTOR_BRANDS = [
  "John Deere", "Fendt", "New Holland", "Claas",
  "Massey Ferguson", "Deutz-Fahr", "Case IH", "Valtra",
];

const TRUCK_BRANDS = [
  "Volvo", "Mercedes-Benz", "Scania", "DAF",
  "MAN", "Iveco", "Renault Trucks",
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [tractorsOpen, setTractorsOpen] = useState(false);
  const [trucksOpen, setTrucksOpen] = useState(false);

  const close = () => {
    setOpen(false);
    setTractorsOpen(false);
    setTrucksOpen(false);
  };

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

            {/* Tractors with sub-menu */}
            <div className="border-b border-brown-100">
              <button
                onClick={() => setTractorsOpen((v) => !v)}
                className="flex w-full items-center justify-between py-3 text-sm font-medium text-brown-700"
              >
                <span>Tractors</span>
                <svg
                  className={`h-3 w-3 transition-transform ${tractorsOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {tractorsOpen && (
                <ul className="mb-3 ml-3 space-y-2 border-l border-brown-200 pl-4">
                  {TRACTOR_BRANDS.map((b) => (
                    <li key={b}>
                      <Link
                        href={`/tractors?brand=${encodeURIComponent(b)}`}
                        onClick={close}
                        className="block py-1 text-sm text-brown-600 hover:text-brown-900"
                      >
                        {b}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/tractors"
                      onClick={close}
                      className="block py-1 text-xs font-semibold uppercase tracking-widest text-brown-500"
                    >
                      All Tractors →
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Trucks with sub-menu */}
            <div className="border-b border-brown-100">
              <button
                onClick={() => setTrucksOpen((v) => !v)}
                className="flex w-full items-center justify-between py-3 text-sm font-medium text-brown-700"
              >
                <span>Trucks</span>
                <svg
                  className={`h-3 w-3 transition-transform ${trucksOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {trucksOpen && (
                <ul className="mb-3 ml-3 space-y-2 border-l border-brown-200 pl-4">
                  {TRUCK_BRANDS.map((b) => (
                    <li key={b}>
                      <Link
                        href={`/trucks?brand=${encodeURIComponent(b)}`}
                        onClick={close}
                        className="block py-1 text-sm text-brown-600 hover:text-brown-900"
                      >
                        {b}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/trucks"
                      onClick={close}
                      className="block py-1 text-xs font-semibold uppercase tracking-widest text-brown-500"
                    >
                      All Trucks →
                    </Link>
                  </li>
                </ul>
              )}
            </div>

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
