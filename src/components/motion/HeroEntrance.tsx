"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const TRUST_BADGES = [
  {
    title: "Precio Landed Total",
    body:  "Flete, aranceles y entrega incluidos en tu cotización",
  },
  {
    title: "Sin intermediarios",
    body:  "Acceso directo a fabricantes verificados en China",
  },
  {
    title: "Entrega en 6 países",
    body:  "Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay",
  },
  {
    title: "Asesoría en español",
    body:  "Un consultor real, no un bot",
  },
];

const ease: [number, number, number, number] = [0, 0, 0.2, 1];

export default function HeroEntrance() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-28 text-center lg:px-8">

      {/* Countries badge */}
      <motion.div
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease }}
      >
        <span
          className="text-[11px] font-medium tracking-widest text-white"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Perú · Bolivia · Chile · Paraguay · Argentina · Uruguay
        </span>
      </motion.div>

      {/* H1 — line 1 */}
      <motion.h1
        className="text-5xl font-normal italic leading-tight text-white sm:text-7xl lg:text-[88px]"
        style={{ fontFamily: "var(--font-display)" }}
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.3, ease }}
      >
        Maquinaria de Asia
        <br />
        {/* H1 — line 2 (gold), slight extra delay */}
        <motion.span
          style={{ color: "#F0A030" }}
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.52, ease }}
        >
          con precio landed y entrega garantizada.
        </motion.span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/80"
        style={{ fontFamily: "var(--font-body)", textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.72, ease }}
      >
        Tractores, camiones, buses y equipos industriales — importados directamente
        de fábrica con flete, aranceles y entrega incluidos en cada cotización.
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9, ease }}
      >
        <Link
          href="/cotizar"
          className="rounded-full transition-opacity hover:opacity-90"
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: "#F0A030",
            color: "#1a1a1a",
            padding: "14px 32px",
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          Solicitar cotización
        </Link>
        <Link
          href="/agricultural/tractors"
          className="rounded-full border border-white/25 px-9 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Ver catálogo
        </Link>
      </motion.div>

      {/* Trust badges — stagger in after CTAs */}
      <motion.div
        className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 1.1 } },
        }}
      >
        {TRUST_BADGES.map((b) => (
          <motion.div
            key={b.title}
            className="border-l-2 border-[#C4933F]/40 pl-4 text-left"
            variants={{
              hidden: { opacity: 0, y: 12 },
              show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
            }}
          >
            <p
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {b.title}
            </p>
            <p
              className="mt-1.5 text-xs leading-relaxed text-white/50"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {b.body}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
