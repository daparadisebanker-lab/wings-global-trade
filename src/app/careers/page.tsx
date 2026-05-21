import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Empleos — Wings Global Trade",
  description: "Únete al equipo de Wings Global Trade. Próximamente posiciones disponibles.",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="bg-[#001E50] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Únete al equipo
          </p>
          <h1
            className="text-4xl font-semibold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Empleos
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
        <p
          className="text-xl font-semibold text-[#1C1A16]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          No hay posiciones abiertas en este momento.
        </p>
        <p
          className="mt-4 text-sm leading-relaxed text-[#6B6560]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Estamos en crecimiento. Si quieres trabajar con nosotros escríbenos a{" "}
          <a
            href="mailto:ventas@wingsglobaltrade.com"
            className="text-[#C4933F] underline-offset-2 hover:underline"
          >
            ventas@wingsglobaltrade.com
          </a>{" "}
          con tu perfil y el área donde crees que puedes aportar.
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
