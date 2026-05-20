import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

const footerLinks = {
  "Servicios": [
    { label: "Importación desde Asia",  href: "/importacion"              },
    { label: "Cotización Landed Cost",  href: "/importacion#contacto"     },
    { label: "Sourcing Gestionado",     href: "/sourcing"                 },
    { label: "Zonas Francas",           href: "/importacion#zonas-francas"},
  ],
  "Vendedores": [
    { label: "Publicar Anuncio",        href: "/sellers/post-listing"     },
    { label: "Cuentas Dealer",          href: "/sellers/dealer-accounts"  },
    { label: "Precios y Planes",        href: "/sellers/pricing"          },
    { label: "Recursos",                href: "/sellers/resources"        },
  ],
  "Empresa": [
    { label: "Nosotros",                href: "/about"                    },
    { label: "Contacto",                href: "/contact"                  },
    { label: "Empleos",                 href: "/careers"                  },
    { label: "Prensa",                  href: "/press"                    },
  ],
  "Soporte": [
    { label: "Centro de Ayuda",         href: "#"                         },
    { label: "Política de Privacidad",  href: "#"                         },
    { label: "Términos de Uso",         href: "#"                         },
  ],
};

const MARKETS = ["Colombia", "Perú", "Bolivia", "Chile", "Paraguay", "Argentina", "Uruguay"];

export default function Footer() {
  return (
    <footer className="bg-[#001E50] text-white/50">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-block">
              <img
                src="/wings-logo2.svg"
                alt="Euro Global"
                className="h-7 w-auto brightness-0 invert opacity-80"
              />
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/40" style={{ fontFamily: "var(--font-body)" }}>
              Maquinaria agrícola de Asia con precio landed total — desde el proveedor hasta tu campo en Latinoamérica.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1">
              {MARKETS.map((m) => (
                <span key={m} className="text-[10px] font-medium tracking-wide text-white/25" style={{ fontFamily: "var(--font-body)" }}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Browse by category */}
          <div>
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]" style={{ fontFamily: "var(--font-body)" }}>
              Catálogo
            </h3>
            <ul className="space-y-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={cat.href}
                    className="text-sm text-white/40 transition-colors hover:text-white"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {cat.shortLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Other link groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]" style={{ fontFamily: "var(--font-body)" }}>
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
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
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-6 sm:flex-row">
          <p className="text-xs text-white/20" style={{ fontFamily: "var(--font-body)" }}>
            &copy; {new Date().getFullYear()} Euro Global. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/20" style={{ fontFamily: "var(--font-body)" }}>
            <p>Hubs: ZOFRI Iquique · ZOFRATACNA Tacna</p>
            <Link href="/admin/login" className="opacity-0 hover:opacity-100 transition-opacity">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
