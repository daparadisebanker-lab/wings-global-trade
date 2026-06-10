import Link from "next/link";

type Brand = { name: string; count: number; href: string };
type Stat = { value: string; label: string };

const TESTIMONIALS = [
  {
    name: "Andrés Villanueva",
    location: "Santa Cruz, Bolivia",
    machine: "New Holland SNH1304 — 130 hp · 4WD",
    quote:
      "Recibí el tractor en mi finca con todos los documentos de importación resueltos. El precio final fue exactamente el que me cotizaron.",
  },
  {
    name: "Rodrigo Cárdenas",
    location: "Junín, Perú",
    machine: "New Holland SH1004 — 100 hp · Cabina",
    quote:
      "Comparé tres opciones con el asesor y elegimos el modelo que mejor se adaptaba al terreno. El proceso de importación fue completamente transparente.",
  },
  {
    name: "Fernando Aguirre",
    location: "Asunción, Paraguay",
    machine: "Kubota M954K — 95 hp · Serie M",
    quote:
      "El proceso por ZOFRATACNA fue transparente. Me enviaron los documentos de cada etapa. No tuve ninguna sorpresa en aduanas.",
  },
];

type Props = {
  stats: Stat[];
  brands: Brand[];
};

/**
 * Proof — operation numbers, verified buyers, and factory brands restored
 * from the previous homepage, recast in the new visual system. Stats and
 * brand counts are computed from the live catalog. Server component.
 */
export default function TrustSection({ stats, brands }: Props) {
  return (
    <section data-theme-section="light" className="wings-wm-light bg-paper py-24 text-ink">
      <div className="wings-container">
        {/* ── Operation numbers ─────────────────────────────────────────── */}
        <div className="wings-grid mb-24">
          {stats.map((s) => (
            <div
              key={s.label}
              className="col-span-6 border-l-2 border-harbor pl-5 lg:col-span-3"
            >
              <p
                className="wings-display m-0 mb-1"
                style={{ fontSize: "clamp(34px, 3.4vw, 56px)", lineHeight: 1 }}
              >
                {s.value}
              </p>
              <p
                className="m-0 uppercase tracking-[0.18em] text-graphite"
                style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Verified buyers ───────────────────────────────────────────── */}
        <p
          className="mb-10 uppercase tracking-[0.22em] text-graphite"
          style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
        >
          Compradores verificados
        </p>
        <div className="wings-grid mb-24">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="col-span-12 m-0 lg:col-span-4">
              <p
                className="m-0 mb-4 tracking-[0.06em] text-graphite"
                style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
              >
                {t.machine}
              </p>
              <blockquote
                className="m-0 mb-6 border-l-2 border-harbor pl-5"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--type-lead)",
                  lineHeight: 1.5,
                }}
              >
                “{t.quote}”
              </blockquote>
              <figcaption
                className="uppercase tracking-[0.16em] text-graphite"
                style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
              >
                {t.name} — {t.location}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* ── Factory brands ────────────────────────────────────────────── */}
        <p
          className="mb-8 uppercase tracking-[0.22em] text-graphite"
          style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
        >
          Marcas de fábrica · sin representaciones de distribuidor
        </p>
        <div className="grid grid-cols-2 border-l border-t border-steel sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((b) => (
            <Link
              key={b.name}
              href={b.href}
              className="group border-b border-r border-steel px-6 py-8 transition-colors duration-200 hover:bg-harbor"
            >
              <p
                className="m-0 mb-2 uppercase tracking-[0.18em] text-graphite transition-colors duration-200 group-hover:text-steel"
                style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data)" }}
              >
                {b.count} modelos
              </p>
              <p
                className="wings-display m-0 uppercase text-ink transition-colors duration-200 group-hover:text-paper"
                style={{ fontSize: "clamp(16px, 1.4vw, 22px)", lineHeight: 1.1 }}
              >
                {b.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
