import type { Metadata } from "next";
import ContactTracks from "@/components/contact/ContactTracks";

export const metadata: Metadata = {
  title: "Solicitar cotización — Euro Global Machinery",
  description: "Cotiza maquinaria de nuestro catálogo o inicia tu importación desde Asia. Precio landed total en menos de 24 horas.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      <div className="bg-[#001E50] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Sin compromiso · Respondemos en &lt; 24 h
          </p>
          <h1
            className="text-4xl font-semibold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Solicitar cotización
          </h1>
          <p
            className="mt-4 max-w-xl text-sm leading-relaxed text-white/60"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Elige tu camino — catálogo propio o importación gestionada desde Asia.
          </p>
        </div>
      </div>

      <ContactTracks />
    </div>
  );
}
