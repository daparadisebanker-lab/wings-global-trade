import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getListingById } from "@data/listings";
import ImageGallery from "@/components/listings/ImageGallery";
import InquiryForm from "@/components/inquiries/InquiryForm";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, formatPrice } from "@/lib/currencies";

interface Props { params: { id: string } }

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListingById(params.id);
  if (!listing) return {};
  return {
    title: `${listing.year ?? ""} ${listing.brand} ${listing.model} — Euro Global Machinery`.trim(),
    description: `${listing.brand} ${listing.model} ${listing.year ?? ""} — ${listing.horsepower ?? "—"} hp. Disponible en ${listing.country ?? "—"}. Solicita cotización con precio landed total.`,
  };
}

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

const COND: Record<string, string> = {
  new: "Nuevo",
  used: "Usado",
  refurbished: "Reacondicionado",
};

export default async function TractorDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const currency   = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const listing    = await getListingById(params.id);
  if (!listing) notFound();

  const condLabel     = COND[listing.condition] ?? listing.condition;
  const galleryImages = listing.images?.length ? listing.images : [PLACEHOLDER];
  const listingTitle  = `${listing.year ?? ""} ${listing.brand} ${listing.model}`.trim();

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999000000";
  const waLink   = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola, estoy interesado en el ${listingTitle}. ¿Está disponible?`)}`;

  const specs = [
    { label: "Marca",       value: listing.brand },
    { label: "Modelo",      value: listing.model },
    { label: "Año",         value: listing.year },
    { label: "Condición",   value: condLabel },
    { label: "Potencia",    value: listing.horsepower ? `${listing.horsepower} hp` : "—" },
    { label: "Horas",       value: listing.hours_used != null ? `${listing.hours_used.toLocaleString()} hrs` : "—" },
    { label: "Transmisión", value: listing.transmission ?? "—" },
    { label: "Tracción",    value: listing.drive_type ?? "—" },
    { label: "País",        value: listing.country ?? "—" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      {/* ── Navy header ── */}
      <div className="bg-[#001E50]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <nav
            className="flex items-center gap-2 py-4 text-xs text-white/40"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Link href="/" className="hover:text-white/70 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/agricultural" className="hover:text-white/70 transition-colors">Agrícola</Link>
            <span>/</span>
            <Link href="/agricultural/tractors" className="hover:text-white/70 transition-colors">Tractores</Link>
            <span>/</span>
            <span className="text-white/60">{listing.brand} {listing.model}</span>
          </nav>

          <div className="flex flex-col gap-4 pb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {listing.brand}
              </p>
              <h1
                className="text-3xl font-semibold text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {listingTitle}
              </h1>
              {listing.location && (
                <p className="mt-2 text-sm text-white/50" style={{ fontFamily: "var(--font-body)" }}>
                  {listing.location}{listing.country ? `, ${listing.country}` : ""}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <p
                className="text-3xl font-semibold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatPrice(listing.price, currency)}
              </p>
              <span
                className="mt-1.5 inline-block rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {condLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* Left */}
          <div className="space-y-6 lg:col-span-2">

            <ImageGallery images={galleryImages} alt={listingTitle} />

            {/* Key specs */}
            <div className="rounded-2xl border border-[#E8E4DB] bg-white p-7">
              <h2
                className="mb-5 text-lg font-semibold text-[#1C1A16]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ficha técnica
              </h2>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                {specs.map((s) => (
                  <div key={s.label}>
                    <dt
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {s.label}
                    </dt>
                    <dd
                      className="mt-1 text-sm font-medium text-[#1C1A16]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right — sticky sidebar */}
          <div className="mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-4">

              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-6">
                <h2
                  className="mb-1 text-lg font-semibold text-[#1C1A16]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Consultar disponibilidad
                </h2>
                <p
                  className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-[#9B9590]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Respuesta en &lt; 24 h
                </p>
                <InquiryForm listingId={listing.id} listingTitle={listingTitle} />
              </div>

              <div className="rounded-2xl bg-[#001E50] p-6">
                <p
                  className="mb-3 text-sm text-white/70 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  ¿Prefieres respuesta inmediata? Escríbenos por WhatsApp.
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C4933F] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4A855]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.527 5.845L0 24l6.335-1.502A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.865 0-3.614-.483-5.13-1.33l-.369-.213-3.761.893.952-3.67-.233-.378A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Consultar por WhatsApp
                </a>
              </div>

              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-6">
                <p
                  className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4933F]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  La cotización incluye
                </p>
                <ul className="space-y-2.5">
                  {["Precio del equipo (FOB Asia)", "Flete marítimo", "Aranceles e impuestos", "Entrega hasta destino"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#6B6560]" style={{ fontFamily: "var(--font-body)" }}>
                      <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#C4933F]" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/agricultural/tractors"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E8E4DB] py-3 text-xs font-semibold uppercase tracking-widest text-[#9B9590] transition-colors hover:border-[#C4933F]/40 hover:text-[#C4933F]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ← Volver a tractores
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
