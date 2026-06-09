import Link from "next/link";
import MobileMenu from "./MobileMenu";
import CategoryMegaMenu from "./CategoryMegaMenu";

export default function Header() {

  return (
    <header className="sticky top-0 z-50 bg-[#001E50]">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/wings-logo2.svg"
              alt="Wings Global Trade"
              className="h-10 w-auto brightness-0 invert md:h-12"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <CategoryMegaMenu />

            <Link
              href="/camiones"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Camiones
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Nosotros
            </Link>

            <Link
              href="/proximamente"
              className="text-sm font-medium text-white/50 transition-colors hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Hoja de ruta
            </Link>
          </nav>

          {/* Desktop right — dual business model CTAs */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/importacion"
              className="flex items-center gap-1.5 rounded-full border-[1.5px] border-white/20 px-5 py-2 text-xs font-semibold text-white/75 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Importar desde Asia
              <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15M19.5 4.5H8.25M19.5 4.5v11.25" />
              </svg>
            </Link>
            <Link
              href="/cotizar"
              className="rounded-full bg-[#C4933F] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar cotización
            </Link>
          </div>

          {/* Mobile toggle */}
          <MobileMenu />
        </div>
      </div>

      {/* Bottom border */}
      <div className="border-b border-white/8" />
    </header>
  );
}
