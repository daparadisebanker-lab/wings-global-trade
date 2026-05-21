import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/categories";

interface Props {
  category:         Category;
  comingSoonExtra?: { label: string; unsplashId: string }[];
}

export default function CategoryHubPage({ category, comingSoonExtra = [] }: Props) {
  const activeSubtypes  = category.subtypes.filter((s) => !s.comingSoon);
  const comingSoonItems = category.subtypes.filter((s) => s.comingSoon);
  const allComingSoon   = [...comingSoonItems, ...comingSoonExtra];

  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* Page header — navy */}
      <div className="bg-[#001E50] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Catálogo
          </p>
          <h1
            className="text-4xl font-semibold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {category.label}
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {category.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

        {/* Active sub-types */}
        {activeSubtypes.length > 0 && (
          <>
            <div className="mb-8">
              <p
                className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Tipos de equipo
              </p>
              <h2
                className="text-2xl font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Inventario disponible
              </h2>
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {activeSubtypes.map((sub) =>
                sub.icon ? (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="group flex h-64 flex-col items-center justify-center rounded-2xl border border-[#E8E4DB] bg-white p-6 text-center transition-all duration-300 hover:border-[#C4933F] hover:shadow-[0_4px_24px_rgba(196,147,63,0.12)]"
                  >
                    <div className="relative mb-6 h-20 w-32 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                      <Image
                        src={sub.icon}
                        alt={sub.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p
                      className="text-xl font-semibold text-[#1C1A16]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {sub.label}
                    </p>
                    <p
                      className="mt-2 text-xs font-medium uppercase tracking-widest text-[#C4933F]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {sub.count} modelos
                    </p>
                  </Link>
                ) : (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="group relative h-64 overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={`https://images.unsplash.com/${sub.unsplashId}?w=600&q=80`}
                      alt={sub.label}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-[#001E50]/55 transition-colors duration-300 group-hover:bg-[#001E50]/70" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <p
                        className="text-xl font-semibold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {sub.label}
                      </p>
                      <p
                        className="mt-1 text-xs text-[#C4933F]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {sub.count} modelos
                      </p>
                      <span
                        className="mt-3 inline-block text-xs font-semibold uppercase tracking-widest text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        Ver catálogo →
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          </>
        )}

        {/* Coming-soon items */}
        {allComingSoon.length > 0 && (
          <div className={activeSubtypes.length > 0 ? "mt-10" : ""}>
            {activeSubtypes.length > 0 && (
              <div className="mb-6">
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Próximamente
                </p>
                <h2
                  className="text-xl font-semibold text-[#6B6560]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Más categorías en camino
                </h2>
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allComingSoon.map((item) => (
                <div
                  key={item.label}
                  className="relative h-48 overflow-hidden rounded-2xl cursor-default"
                >
                  <Image
                    src={`https://images.unsplash.com/${item.unsplashId}?w=600&q=80`}
                    alt={item.label}
                    fill
                    className="object-cover grayscale"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[#001E50]/70" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <p
                      className="text-lg font-semibold text-white/50"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.label}
                    </p>
                    <span
                      className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-widest text-[#C4933F]/60"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Próximamente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust strip */}
        <div className="mt-14 rounded-2xl border border-[#E8E4DB] bg-white p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { title: "Precio Landed Total",  body: "Flete, aranceles y entrega incluidos en tu cotización." },
              { title: "Fabricantes verificados", body: "Acceso directo a fabricantes con historial de exportación a Latinoamérica." },
              { title: "Asesoría en español",  body: "Un consultor real te acompaña desde la selección hasta la entrega." },
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
