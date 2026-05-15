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
    <div 
      className="relative" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-2 py-6 text-sm font-semibold tracking-wide transition-colors ${
          isOpen ? "text-brown-900" : "text-brown-600 hover:text-brown-900"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
        Browse Categories
      </button>

      {/* Mega Menu Overlay */}
      {isOpen && (activeCategory || CATEGORIES.length > 0) && (
        <div className="absolute left-0 top-full z-[100] flex w-[850px] -translate-x-12 border border-brown-200 bg-white shadow-2xl overflow-hidden rounded-sm transition-all duration-300 ease-out">
          
          {/* Sidebar: Main Categories */}
          <div className="w-64 border-r border-brown-100 bg-cream-50/50">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                onMouseEnter={() => setActiveCategory(cat)}
                className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-all duration-150 ${
                  activeCategory?.slug === cat.slug
                    ? "bg-white text-brown-900 border-r-2 border-brown-900"
                    : "text-brown-500 hover:bg-white hover:text-brown-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
                <svg className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>

          {/* Panel: Subcategories Grid */}
          <div className="flex-1 p-8 bg-white max-h-[600px] overflow-y-auto">
            <div className="mb-6 border-b border-brown-100 pb-4">
              <h3 className="font-serif text-xl font-semibold text-brown-900">
                {activeCategory?.label}
              </h3>
              <p className="mt-1 text-xs text-brown-400">
                Explore our full inventory of {activeCategory?.label.toLowerCase()}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-x-8 gap-y-6">
              {activeCategory?.subtypes.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-start gap-3 transition-colors"
                >
                  <div className="relative h-12 w-16 flex-shrink-0 bg-cream-50 rounded p-1 transition-colors group-hover:bg-brown-50">
                    {sub.icon ? (
                      <Image
                        src={sub.icon}
                        alt={sub.label}
                        fill
                        className="object-contain p-1 opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center border border-dashed border-brown-200">
                        <span className="text-[10px] text-brown-300">SVG</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-brown-800 group-hover:text-brown-900 transition-colors">
                      {sub.label}
                    </p>
                    <p className="text-[10px] uppercase tracking-tighter text-brown-400">
                      {sub.count} Units
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-10">
              <Link
                href={activeCategory?.href || "#"}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 border border-brown-200 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brown-600 transition-all hover:border-brown-900 hover:bg-brown-900 hover:text-white"
              >
                View All {activeCategory?.label} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
