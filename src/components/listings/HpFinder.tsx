"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const HECTARE_RANGES = [
  { label: "Menos de 20 ha",  hpMin: 40,  hpMax: 70  },
  { label: "20 – 100 ha",     hpMin: 70,  hpMax: 120 },
  { label: "100 – 500 ha",    hpMin: 120, hpMax: 160 },
  { label: "Más de 500 ha",   hpMin: 160, hpMax: 210 },
];

const BRANDS = ["New Holland", "John Deere", "Massey Ferguson", "Kubota"];

export default function HpFinder() {
  const router = useRouter();
  const [hectares, setHectares] = useState("");
  const [brand, setBrand] = useState("");

  function handleSearch() {
    const range = HECTARE_RANGES.find((r) => r.label === hectares);
    const params = new URLSearchParams();
    if (range) {
      params.set("hpMin", String(range.hpMin));
      params.set("hpMax", String(range.hpMax));
    }
    if (brand) params.set("brand", brand);
    router.push(`/agricultural/tractors?${params.toString()}`);
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm">
      <div className="grid sm:grid-cols-3">
        <div className="border-b border-white/10 sm:border-b-0 sm:border-r">
          <label className="block px-5 pt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40"
            style={{ fontFamily: "var(--font-body)" }}>
            Superficie de trabajo
          </label>
          <select
            value={hectares}
            onChange={(e) => setHectares(e.target.value)}
            className="w-full border-0 bg-transparent px-5 pb-4 pt-1 text-sm text-white focus:outline-none"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <option value="" className="bg-[#062663] text-white">¿Cuántas hectáreas?</option>
            {HECTARE_RANGES.map((r) => (
              <option key={r.label} value={r.label} className="bg-[#062663] text-white">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border-b border-white/10 sm:border-b-0 sm:border-r">
          <label className="block px-5 pt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40"
            style={{ fontFamily: "var(--font-body)" }}>
            Marca preferida
          </label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full border-0 bg-transparent px-5 pb-4 pt-1 text-sm text-white focus:outline-none"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <option value="" className="bg-[#062663] text-white">Todas las marcas</option>
            {BRANDS.map((b) => (
              <option key={b} value={b} className="bg-[#062663] text-white">{b}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 bg-[#C4933F] px-6 py-5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Ver modelos disponibles
        </button>
      </div>
    </div>
  );
}
