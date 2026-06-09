import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getListingById } from "@data/listings";
import ImageGallery from "@/components/listings/ImageGallery";
import TechnicalSpecs from "@/components/listings/TechnicalSpecs";
import InquiryForm from "@/components/inquiries/InquiryForm";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, formatPrice } from "@/lib/currencies";

interface Props { params: { id: string } }

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListingById(params.id);
  if (!listing) return {};
  return {
    title: `${listing.year ?? ""} ${listing.brand} ${listing.model} — Wings Global Trade`.trim(),
    description: `${listing.brand} ${listing.model} ${listing.year ?? ""} — ${listing.horsepower ?? "—"} hp. Disponible en ${listing.country ?? "—"}. Solicita cotización con precio landed total.`,
  };
}

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

const COND: Record<string, string> = {
  new:         "Nuevo",
  used:        "Usado",
  refurbished: "Reacondicionado",
};

const BRAND_CONTEXT: Record<string, string> = {
  "New Holland":      "fabricado por CNH Industrial",
  "John Deere":       "fabricado por Deere & Company",
  "Massey Ferguson":  "fabricado por AGCO Corporation",
  "Kubota":           "fabricado por Kubota Corporation, Japón",
};

function buildNarrative(listing: NonNullable<Awaited<ReturnType<typeof getListingById>>>): string {
  const hp   = listing.horsepower;
  const brand = listing.brand;
  const model = listing.model;
  const cond  = listing.condition;
  const year  = listing.year;
  const hrs   = listing.hours_used;
  const trans = listing.transmission;
  const drive = listing.drive_type;

  const powerClass =
    hp == null      ? "tractor de trabajo"
    : hp >= 130     ? "tractor de alta potencia"
    : hp >= 80      ? "tractor de potencia media"
    : hp >= 50      ? "tractor versátil"
    : "tractor compacto";

  const brandCtx = BRAND_CONTEXT[brand] ?? `fabricado por ${brand}`;

  const condNote =
    cond === "new"
      ? "Disponible nuevo desde fábrica"
      : cond === "refurbished"
      ? "Reacondicionado a estándar de fábrica"
      : hrs != null
      ? `Con ${hrs.toLocaleString()} horas de uso verificadas`
      : "Disponible para importación";

  const configNote = [
    drive ? drive : null,
    trans ? `transmisión ${trans}` : null,
    hp ? `${hp} hp` : null,
  ].filter(Boolean).join(", ");

  const yearNote = year ? ` ${year}` : "";

  return [
    `El ${brand} ${model}${yearNote} es un ${powerClass} ${brandCtx}, diseñado para operaciones agrícolas exigentes en suelos de labranza, cultivos en hilera y trabajo con implementos hidráulicos de tres puntos.`,
    configNote ? `Configurado con ${configNote} — una combinación que garantiza rendimiento constante bajo carga completa en campo.` : "",
    `${condNote}. Precio landed confirmado por escrito para Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay.`,
  ].filter(Boolean).join(" ");
}

export default async function TractorDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const currency    = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const listing     = await getListingById(params.id);
  if (!listing) notFound();

  const condLabel     = COND[listing.condition] ?? listing.condition;
  const galleryImages = listing.images?.length ? listing.images : [PLACEHOLDER];
  const listingTitle  = `${listing.year ?? ""} ${listing.brand} ${listing.model}`.trim();
  const priceDisplay  = listing.price ? formatPrice(listing.price, currency) : null;

  const narrative = buildNarrative(listing);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51934987440";
  const waLink   = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola, estoy interesado en el ${listingTitle}. ¿Está disponible?`)}`;

  const specs = [
    { label: "Marca",       value: listing.brand },
    { label: "Año",         value: listing.year },
    { label: "Condición",   value: condLabel },
    { label: "Potencia",    value: listing.horsepower ? `${listing.horsepower} hp` : "—" },
    { label: "Horas de uso",value: listing.hours_used != null ? `${listing.hours_used.toLocaleString()} hrs` : "—" },
    { label: "Transmisión", value: listing.transmission ?? "—" },
    { label: "Tracción",    value: listing.drive_type ?? "—" },
    { label: "País",        value: listing.country ?? "—" },
  ].filter((s) => s.value && s.value !== "—");

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* Breadcrumb */}
        <nav
          className="mb-8 flex items-center gap-2 text-xs text-[#9B9590]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Link href="/" className="hover:text-[#1C1A16] transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/agricultural" className="hover:text-[#1C1A16] transition-colors">Agrícola</Link>
          <span>/</span>
          <Link href="/agricultural/tractors" className="hover:text-[#1C1A16] transition-colors">Tractores</Link>
          <span>/</span>
          <span className="text-[#6B6560]">{listing.brand} {listing.model}</span>
        </nav>

        {/* Main grid */}
        <div className="lg:grid lg:gap-12" style={{ gridTemplateColumns: "1fr 360px" }}>

          {/* ── Left ── */}
          <div>
            <ImageGallery images={galleryImages} alt={listingTitle} />

            {/* Identity */}
            <div className="mt-8">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {listing.brand}
              </p>
              {(() => {
                const brandSlug: Record<string, string> = {
                  "New Holland": "new-holland",
                  "John Deere": "john-deere",
                  "Massey Ferguson": "massey-ferguson",
                  "Kubota": "kubota",
                };
                const slug = brandSlug[listing.brand];
                return slug ? (
                  <Link
                    href={`/brands/${slug}`}
                    className="mt-1 inline-block text-xs text-[#C4933F] hover:underline"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Ver todos los tractores {listing.brand} →
                  </Link>
                ) : null;
              })()}
              <h1
                className="mt-2 text-4xl font-semibold text-[#1C1A16] leading-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {listing.model}{listing.year ? ` · ${listing.year}` : ""}
              </h1>
              {listing.location && (
                <p className="mt-2 text-sm text-[#9B9590]" style={{ fontFamily: "var(--font-body)" }}>
                  {listing.location}{listing.country ? `, ${listing.country}` : ""}
                </p>
              )}
            </div>

            {/* Price row */}
            <div className="mt-6 border-b border-[#E8E4DB] pb-6">
              <div className="flex items-baseline justify-between">
                {priceDisplay ? (
                  <p className="text-3xl font-semibold text-[#1C1A16]" style={{ fontFamily: "var(--font-display)" }}>
                    {priceDisplay}
                  </p>
                ) : (
                  <p className="text-xl font-medium text-[#6B6560]" style={{ fontFamily: "var(--font-display)" }}>
                    Precio a consultar
                  </p>
                )}
                <span
                  className="text-xs font-semibold uppercase tracking-widest text-[#9B9590]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {condLabel}
                </span>
              </div>
              <p
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#C4933F]/20 bg-[#C4933F]/5 px-3 py-1 text-[10px] font-semibold text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <svg className="h-2.5 w-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                Precio incluye flete · aranceles · entrega
              </p>
            </div>

            {/* Product narrative */}
            <div className="mt-8">
              <p
                className="text-sm leading-relaxed text-[#6B6560]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {narrative}
              </p>
            </div>

            {/* Quick specs */}
            {specs.length > 0 && (
              <div className="mt-8">
                <p
                  className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B9590]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Especificaciones
                </p>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
                  {specs.map((s) => (
                    <div key={s.label}>
                      <dt
                        className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {s.label}
                      </dt>
                      <dd
                        className="mt-1.5 text-sm font-medium text-[#1C1A16]"
                        style={{ fontFamily: "var(--font-data)" }}
                      >
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Full technical spec sheet */}
            <TechnicalSpecs listing={listing} />
          </div>

          {/* ── Right — sticky sidebar ── */}
          <div className="mt-10 lg:mt-0">
            <div className="sticky top-24 space-y-4">

              {/* Inquiry */}
              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-6">
                <h2
                  className="mb-1 text-xl font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Solicitar cotización
                </h2>
                <p
                  className="mb-5 text-xs text-[#9B9590]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Respondemos en menos de 24 horas.
                </p>
                <InquiryForm listingId={listing.id} listingTitle={listingTitle} />
              </div>

              {/* WhatsApp */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#001E50] py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.527 5.845L0 24l6.335-1.502A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.865 0-3.614-.483-5.13-1.33l-.369-.213-3.761.893.952-3.67-.233-.378A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Consultar por WhatsApp
              </a>

              {/* Trust */}
              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-5">
                <ul className="space-y-2.5">
                  {[
                    "Un precio incluye: flete, aranceles y entrega en tu país",
                    `Tractor confirmado con ficha técnica antes de pagar`,
                    "Plazo: 45–90 días desde tu confirmación escrita",
                    "Entregamos en 6 países · ZOFRI + ZOFRATACNA",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
                      <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#C4933F]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/agricultural/tractors"
                className="block text-center text-xs text-[#9B9590] transition-colors hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ← Volver a tractores
              </Link>

            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-white/10 bg-[#001E50] px-4 py-3 md:hidden"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#25D366", fontFamily: "var(--font-body)" }}
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <Link
          href="/cotizar"
          className="flex flex-1 items-center justify-center rounded-full bg-[#C4933F] py-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Solicitar cotización
        </Link>
      </div>

      {/* Wings Import CTA */}
      <div
        className="mt-16 rounded-2xl px-8 py-12"
        style={{ background: "#001240" }}
      >
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ¿No encontraste exactamente lo que buscas?
            </h2>
            <p
              className="mt-2 max-w-lg text-sm leading-relaxed text-white/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Importamos cualquier modelo desde fábrica — precio landed total con flete, aranceles y entrega incluida.
            </p>
          </div>
          <Link
            href="/importacion"
            className="flex-shrink-0 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#C4933F", fontFamily: "var(--font-body)" }}
          >
            Solicitar importación →
          </Link>
        </div>
      </div>
    </div>
  );
}
