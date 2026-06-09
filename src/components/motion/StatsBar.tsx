"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import CountUp from "./CountUp";

const STATS = [
  { numeric: 34,   display: null,    label: "Modelos disponibles",     isFirst: true  },
  { numeric: null, display: "50–140", label: "Rango de potencia (hp)", isFirst: false },
  { numeric: 4,    display: null,    label: "Marcas de fábrica",        isFirst: false },
  { numeric: 6,    display: null,    label: "Países atendidos",         isFirst: false },
];

export default function StatsBar() {
  const ref = useRef<HTMLDListElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="bg-[#001E50] py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl
          ref={ref}
          className="grid grid-cols-2 gap-10 lg:grid-cols-4"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.65s ease, transform 0.65s ease",
          }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} className="border-l-2 border-[#C4933F] pl-6">
              <dd
                className={
                  i === 0
                    ? "text-5xl font-normal italic text-[#C4933F]"
                    : "text-4xl font-semibold text-[#C4933F]"
                }
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.numeric != null ? (
                  <CountUp to={s.numeric} />
                ) : (
                  s.display
                )}
              </dd>
              <dt
                className="mt-1 text-xs uppercase tracking-widest text-white/40"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
