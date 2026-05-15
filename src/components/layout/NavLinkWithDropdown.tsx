"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import type { SubType } from "@/lib/categories";

interface Props {
  label: string;
  href: string;
  /** Sub-types shown in the dropdown (e.g. Tractors, Harvesters…) */
  subtypes?: SubType[];
  allLabel?: string;
}

export default function NavLinkWithDropdown({
  label,
  href,
  subtypes = [],
  allLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasDropdown = subtypes.length > 0;

  const handleEnter = () => {
    if (!hasDropdown) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleLeave = () => {
    if (!hasDropdown) return;
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-medium tracking-wide text-brown-600 transition-colors hover:text-brown-900"
      >
        {label}
        {hasDropdown && (
          <svg
            className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </Link>

      {hasDropdown && open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 border border-brown-200 bg-white shadow-lg">
          {/* invisible hover bridge */}
          <div className="absolute -top-2 left-1/2 h-2 w-4 -translate-x-1/2" />
          <ul className="py-2">
            {subtypes.map((sub) => (
              <li key={sub.href}>
                <Link
                  href={sub.href}
                  className="flex items-center justify-between px-5 py-2 text-sm text-brown-700 transition-colors hover:bg-cream-100 hover:text-brown-900"
                >
                  <span>{sub.label}</span>
                  <span className="text-[10px] text-brown-400">{sub.count}</span>
                </Link>
              </li>
            ))}
            {allLabel && (
              <li className="mt-1 border-t border-brown-100">
                <Link
                  href={href}
                  className="block px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-brown-500 transition-colors hover:bg-cream-100 hover:text-brown-900"
                >
                  {allLabel} →
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
