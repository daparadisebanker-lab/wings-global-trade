import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sourcing B2B con IA | Wings Global Trade",
  description: "Plataforma de sourcing B2B con inteligencia artificial. Cotizamos, negociamos y coordinamos la importación de cualquier producto industrial desde fabricantes verificados en China.",
};

export default function SourcingPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-[#004389] px-6 py-24 text-center"
    >
      {/* Eyebrow badge */}
      <span
        className="mb-8 inline-block rounded-full border border-[#C4933F] px-4 py-1 text-xs tracking-wide text-[#C4933F]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Plataforma B2B — Próximamente
      </span>

      {/* H1 */}
      <h1
        className="max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tight text-white md:text-6xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Sourcing desde Asia con inteligencia artificial.
      </h1>

      {/* Subtitle */}
      <p
        className="mb-12 mt-6 max-w-xl text-lg leading-relaxed text-white/60"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Cotizamos, negociamos y coordinamos la importación de cualquier producto
        industrial desde fabricantes verificados en China — con IA que trabaja por ti.
      </p>

      {/* Interest form */}
      <form action="#" className="mb-16 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="Tu correo empresarial"
          className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#C4933F] transition-colors duration-200"
          style={{ fontFamily: "var(--font-body)" }}
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-full bg-[#C4933F] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#D4A855]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Unirse a lista de acceso
        </button>
      </form>

      {/* Feature bullets */}
      <div className="mb-16 grid gap-4 text-left sm:grid-cols-3 max-w-2xl">
        {[
          { label: "Cotización en 48 h", desc: "IA escanea fabricantes verificados y compara precios ex-works." },
          { label: "Negociación asistida", desc: "Tu asesor Wings coordina condiciones, muestras y contratos." },
          { label: "Logística total", desc: "Flete, consolidación, aduana y entrega en destino incluidos." },
        ].map((f) => (
          <div key={f.label} className="rounded-2xl border border-white/10 p-5">
            <p
              className="mb-1 text-sm font-semibold text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {f.label}
            </p>
            <p
              className="text-xs leading-relaxed text-white/40"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Back link */}
      <Link
        href="/agricultural/tractors"
        className="text-sm text-white/40 transition-colors duration-200 hover:text-white/70"
        style={{ fontFamily: "var(--font-body)" }}
      >
        ← Ver catálogo disponible
      </Link>
    </main>
  );
}
