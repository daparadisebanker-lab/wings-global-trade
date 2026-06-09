import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prensa — Wings Global Trade",
  description: "Recursos de prensa y contacto para periodistas. Wings Global Trade.",
};

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-[#004389] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Medios
          </p>
          <h1
            className="text-4xl font-semibold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Prensa
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
        <p
          className="text-xl font-semibold text-[#1C1A16]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sala de prensa en construcción.
        </p>
        <p
          className="mt-4 text-sm leading-relaxed text-[#6B6560]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Para consultas de prensa, entrevistas o recursos de medios escríbenos a{" "}
          <a
            href="mailto:ventas@wingsglobaltrade.com"
            className="text-[#C4933F] underline-offset-2 hover:underline"
          >
            ventas@wingsglobaltrade.com
          </a>
          .
        </p>
        <Link
          href="/"
          className="mt-10 inline-block text-xs font-semibold uppercase tracking-widest text-[#9B9590] transition-colors hover:text-[#C4933F]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
