import Link from "next/link";
import HorizontalSubtypeSwitcher from "./HorizontalSubtypeSwitcher";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  title?: string;
  filterTypes?: string[];
  categorySlug?: string;
  activeSlug?: string;
}

export default function ComingSoonCategory({ categorySlug, activeSlug }: Props) {
  const category  = categorySlug ? CATEGORIES.find((c) => c.slug === categorySlug) : null;
  const subtype   = category && activeSlug
    ? category.subtypes.find((s) => s.href.endsWith("/" + activeSlug) || s.href.endsWith(activeSlug))
    : null;

  const displayTitle = subtype?.label ?? category?.label ?? "Próximamente";

  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* Page header */}
      <div className="bg-[#001E50] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {category?.label ?? "Catálogo"}
          </p>
          <h1
            className="text-4xl font-semibold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {displayTitle}
          </h1>
          {subtype?.count && (
            <p
              className="mt-3 text-sm text-white/50"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {subtype.count} modelos disponibles para importación
            </p>
          )}
        </div>
      </div>

      {/* Subtype switcher */}
      {category && activeSlug && (
        <HorizontalSubtypeSwitcher category={category} activeSlug={activeSlug} />
      )}

      {/* Coming soon body */}
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E4DB] bg-white px-8 py-24 text-center">
          <div className="mb-6 w-12 h-px bg-[#C4933F]" />
          <p
            className="text-3xl font-semibold text-[#1C1A16] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Catálogo en preparación
          </p>
          <p
            className="max-w-sm text-sm leading-relaxed text-[#6B6560] mb-8"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Estamos cargando los modelos disponibles de{" "}
            <span className="font-medium text-[#1C1A16]">{displayTitle.toLowerCase()}</span>.
            Mientras tanto, contáctanos y te enviamos disponibilidad y precios.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-[#C4933F] px-7 py-3 text-sm font-semibold text-white hover:bg-[#D4A855] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Solicitar cotización
            </Link>
            {category && (
              <Link
                href={category.href}
                className="rounded-full border border-[#E8E4DB] bg-white px-7 py-3 text-sm font-semibold text-[#6B6560] hover:border-[#C4933F] hover:text-[#1C1A16] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ← Ver {category.shortLabel}
              </Link>
            )}
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-8 rounded-2xl border border-[#E8E4DB] bg-white p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { title: "Precio Landed Total",       body: "Flete, aranceles y entrega incluidos en tu cotización." },
              { title: "Fabricantes verificados",   body: "Acceso directo a fabricantes con historial de exportación a Latinoamérica." },
              { title: "Asesoría en español",        body: "Un consultor real te acompaña desde la selección hasta la entrega." },
            ].map((item) => (
              <div key={item.title}>
                <p
                  className="text-sm font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </p>
                <div className="mt-2 h-px w-8 bg-[#C4933F]" />
                <p
                  className="mt-3 text-xs leading-relaxed text-[#6B6560]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
