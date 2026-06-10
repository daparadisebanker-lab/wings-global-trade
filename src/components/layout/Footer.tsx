import Link from "next/link";
import FooterExpand from "@/components/layout/FooterExpand";
import { IconPhone } from "@/components/icons";

const CATALOG_LINKS = [
  { label: "Tractores",              href: "/agricultural/tractors" },
  { label: "Por marca",             href: "/brands"                },
  { label: "New Holland",            href: "/brands/new-holland"    },
  { label: "John Deere",            href: "/brands/john-deere"     },
  { label: "Kubota",                   href: "/brands/kubota"          },
  { label: "Massey Ferguson",          href: "/brands/massey-ferguson" },
];

const IMPORT_LINKS = [
  { label: "Importación a pedido",   href: "/importacion"               },
  { label: "Solicitar cotización",   href: "/cotizar"                   },
  { label: "Zonas Francas",          href: "/importacion#zonas-francas" },
  { label: "Hoja de ruta 2026",      href: "/proximamente"              },
  { label: "Hablar con un asesor",   href: "/contact"                   },
];

const COMPANY_LINKS = [
  { label: "Nosotros",               href: "/about"                     },
  { label: "Operaciones en LATAM",   href: "/about"                     },
  { label: "Zonas Francas",          href: "/importacion#zonas-francas" },
  { label: "Empleos",                href: "/careers"                   },
  { label: "Prensa",                 href: "/press"                     },
];

const CONTACT_LINKS = [
  { label: "Contacto",               href: "/contact" },
  { label: "Solicitar cotización",   href: "/cotizar" },
  { label: "Agendar llamada",        href: "/contact" },
  { label: "Privacidad",             href: "#"        },
  { label: "Términos de Uso",        href: "#"        },
];

const MARKETS = ["Perú", "Bolivia", "Chile", "Paraguay", "Argentina", "Uruguay"];

export default function Footer() {
  return (
    <footer className="bg-[#004389]">

      {/* ── COMPACT BAND — always visible ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Logo + descriptor */}
          <div className="flex flex-col gap-1.5">
            <Link href="/" className="inline-block">
              <img
                src="/wings-logo-complete.svg"
                alt="Wings Global Trade"
                className="h-10 w-auto brightness-0 invert opacity-80"
              />
            </Link>
            <p
              className="max-w-xs text-justify text-xs leading-relaxed text-white/30"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Catálogo propio e importación gestionada para las zonas francas de Latinoamérica.
            </p>
          </div>

          {/* Direct contact */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <a
              href="tel:+51958381473"
              className="flex items-center gap-2 text-xs text-white/45 transition-colors hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <IconPhone className="h-3.5 w-3.5" />
              +51 958 381 473
            </a>
            <a
              href="mailto:ventas@wingsglobaltrade.com"
              className="text-xs text-white/45 transition-colors hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              ventas@wingsglobaltrade.com
            </a>
          </div>

          {/* Legal */}
          <p
            className="text-xs text-white/20"
            style={{ fontFamily: "var(--font-body)" }}
          >
            &copy; {new Date().getFullYear()} Wings Global Trade. Todos los derechos reservados.
          </p>

        </div>
      </div>

      {/* ── EXPANDABLE REGION — toggle + long content ─────────────────────── */}
      <FooterExpand>

        {/* CTA strip */}
        <div className="bg-[#062663]">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className="text-lg font-semibold text-white leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Dos caminos, una decisión.
                </p>
                <p
                  className="mt-1 text-sm text-white/45"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Catálogo propio o importación gestionada — dinos qué necesitas.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/categories"
                  className="rounded-full border border-[#C4933F] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#C4933F] transition-colors hover:bg-[#C4933F] hover:text-white"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Explorar catálogo
                </Link>
                <Link
                  href="/importacion"
                  className="rounded-full border border-white/20 bg-white/8 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white/80 transition-colors hover:border-white/40 hover:bg-white/12 hover:text-white"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Servicio de importación
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Link grid */}
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">

            {/* Column 1 — Catalog */}
            <div>
              <div className="mb-5 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#76A1B2] flex-shrink-0" />
                <h3
                  className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#76A1B2]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Catálogo
                </h3>
              </div>
              <ul className="space-y-3">
                {CATALOG_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 — Import Services */}
            <div>
              <div className="mb-5 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#76A1B2] flex-shrink-0" />
                <h3
                  className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#76A1B2]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Importación
                </h3>
              </div>
              <ul className="space-y-3">
                {IMPORT_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Company */}
            <div>
              <h3
                className="mb-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Empresa
              </h3>
              <ul className="space-y-3">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Contact */}
            <div>
              <h3
                className="mb-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Contacto
              </h3>
              <ul className="space-y-3">
                {CONTACT_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Hubs, markets + legal links */}
        <div className="border-t border-white/8">
          <div className="mx-auto max-w-7xl px-6 py-7 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex flex-col gap-2">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Hubs operativos
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>
                    ZOFRI · Iquique, Chile
                  </span>
                  <span className="text-white/20 text-xs">|</span>
                  <span className="text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>
                    ZOFRATACNA · Tacna, Perú
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  {MARKETS.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-medium tracking-wide text-white/20"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="#"
                  className="text-xs text-white/25 transition-colors hover:text-white/60"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Privacidad
                </Link>
                <Link
                  href="#"
                  className="text-xs text-white/25 transition-colors hover:text-white/60"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Términos de Uso
                </Link>
                <Link
                  href="/admin/login"
                  className="text-xs opacity-0 transition-opacity hover:opacity-100 text-white/30"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Admin
                </Link>
              </div>

            </div>
          </div>
        </div>

      </FooterExpand>

      {/* Spacer: lifts all footer content above the fixed mobile bottom bar */}
      <div className="h-16 md:hidden" aria-hidden="true" />

    </footer>
  );
}
