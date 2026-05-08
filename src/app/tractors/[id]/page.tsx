import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { listings, getListingById } from "@/data/listings";
import ImageGallery from "@/components/listings/ImageGallery";
import InquiryForm from "@/components/inquiries/InquiryForm";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, formatPrice } from "@/lib/currencies";
import { LANG_COOKIE, DEFAULT_LANG, getTranslations } from "@/lib/i18n";
import type { ListingDetails } from "@/types";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return listings.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = getListingById(params.id);
  if (!listing) return {};
  return {
    title: `${listing.year} ${listing.brand} ${listing.model}`,
    description: `${listing.year} ${listing.brand} ${listing.model} — ${listing.horsepower ?? "—"} hp, ${listing.hours_used?.toLocaleString() ?? "—"} hours. Located in ${listing.location}, ${listing.country}.`,
  };
}

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800&q=80";

export default async function TractorDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const currency = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const lang     = cookieStore.get(LANG_COOKIE)?.value     ?? DEFAULT_LANG;
  const t        = await getTranslations(lang);
  const listing  = getListingById(params.id);
  if (!listing) notFound();

  const condLabel: Record<string, string> = {
    new:         t.condLabelNew,
    used:        t.condLabelUsed,
    refurbished: t.condLabelRefurbished,
  };

  const hpUnit  = t.hpUnit  ?? "hp";
  const hrsUnit = t.hrsUnit ?? "hrs";

  const baseSpecs: { label: string; value: string | number }[] = [
    { label: t.specsMake,         value: listing.brand },
    { label: t.specsModel,        value: listing.model },
    { label: t.specsYear,         value: listing.year },
    { label: t.specsCondition,    value: condLabel[listing.condition] },
    { label: t.specsHorsepower,   value: listing.horsepower   ? `${listing.horsepower} ${hpUnit}`                        : "—" },
    { label: t.specsHours,        value: listing.hours_used != null ? `${listing.hours_used.toLocaleString()} ${hrsUnit}` : "—" },
    { label: t.specsTransmission, value: listing.transmission ?? "—" },
    { label: t.specsDrive,        value: listing.drive_type   ?? "—" },
    { label: t.specsLocation,     value: `${listing.location}, ${listing.country}` },
  ];
  const specs = listing.details?.max_speed_kmh
    ? [...baseSpecs, { label: "Max speed", value: `${listing.details.max_speed_kmh} km/h` }]
    : baseSpecs;

  const galleryImages = listing.images?.length ? listing.images : [PLACEHOLDER];
  const listingTitle = `${listing.year} ${listing.brand} ${listing.model}`;
  const d = listing.details;

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const waText = encodeURIComponent(
    `Hello, I am interested in the ${listingTitle} listed on Euro Global Machinery. Is it still available?`
  );
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : null;

  return (
    <div className="min-h-screen bg-cream-50">

      {/* Breadcrumb */}
      <div className="border-b border-brown-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-3 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-brown-400 uppercase tracking-wide">
            <Link href="/" className="hover:text-brown-700">{t.breadHome}</Link>
            <span>/</span>
            <Link href="/tractors" className="hover:text-brown-700">{t.navTractors}</Link>
            <span>/</span>
            <span className="text-brown-700">{listing.brand} {listing.model}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* Left */}
          <div className="space-y-6 lg:col-span-2">

            {/* Gallery */}
            <ImageGallery images={galleryImages} alt={listingTitle} />

            {/* Title & price */}
            <div className="border border-brown-200 bg-white p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-500">
                    {listing.brand}
                  </p>
                  <h1 className="mt-1 font-serif text-2xl font-semibold text-brown-900 sm:text-3xl">
                    {listing.year} {listing.model}
                  </h1>
                  <p className="mt-1 text-sm text-brown-500">
                    {listing.location}, {listing.country}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-3xl font-semibold text-brown-900">
                    {formatPrice(listing.price, currency)}
                  </p>
                  {d?.vat_excluded && (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-brown-500">
                      VAT excluded
                    </p>
                  )}
                  <p className="mt-1 text-xs uppercase tracking-widest text-brown-400">
                    {condLabel[listing.condition]}
                  </p>
                </div>
              </div>

              {listing.description && (
                <p className="mt-5 border-t border-brown-100 pt-5 text-sm leading-relaxed text-brown-600">
                  {listing.description}
                </p>
              )}
            </div>

            {/* Specs */}
            <div className="border border-brown-200 bg-white p-7">
              <h2 className="mb-5 font-serif text-lg font-semibold text-brown-900">
                {t.specificationsTitle}
              </h2>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                {specs.map((s) => (
                  <div key={s.label}>
                    <dt className="text-[10px] font-semibold uppercase tracking-widest text-brown-400">
                      {s.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-brown-900">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Detailed specs */}
            {d && <DetailedSpecs details={d} />}
          </div>

          {/* Right: inquiry */}
          <div className="mt-6 lg:mt-0">
            <div className="sticky top-24 space-y-5">

              <div className="border border-brown-200 bg-white p-6">
                <h2 className="mb-1 font-serif text-lg font-semibold text-brown-900">
                  {t.contactSeller}
                </h2>
                <p className="mb-5 text-xs uppercase tracking-widest text-brown-400">
                  {t.repliesVia}
                </p>
                <InquiryForm
                  listingId={listing.id}
                  listingTitle={listingTitle}
                  labels={{
                    name:         t.formName,
                    email:        t.formEmail,
                    phone:        t.formPhone,
                    defaultMessage: t.formDefaultMessage(listingTitle),
                    sending:      t.formSending,
                    submit:       t.formSubmit,
                    successTitle: t.formSuccessTitle,
                    successBody:  t.formSuccessBody,
                    successBtn:   t.formSuccessBtn,
                    error:        t.formError,
                  }}
                />
              </div>

              {/* Direct contact */}
              <div className="border border-brown-200 bg-white p-5 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-500">
                  Or contact directly
                </p>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full border border-[#25D366] bg-[#25D366] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                {process.env.CONTACT_EMAIL && (
                  <a
                    href={`mailto:${process.env.CONTACT_EMAIL}?subject=Inquiry: ${listingTitle}`}
                    className="flex items-center justify-center gap-2 w-full border border-brown-700 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brown-700 transition-colors hover:bg-brown-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </a>
                )}
              </div>

              <div className="border border-brown-200 bg-cream-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brown-700">
                  {t.buyerGuidanceTitle}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-brown-500">
                  {t.buyerGuidanceBody}
                </p>
              </div>

              <Link href="/tractors" className="btn-secondary w-full text-center text-xs uppercase tracking-widest">
                {t.backToListings}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function YesNo({ v }: { v: boolean | undefined }) {
  if (v == null) return <span className="text-brown-400">—</span>;
  return v ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brown-700 text-cream-50" aria-label="yes">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5L13 5" />
      </svg>
    </span>
  ) : (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brown-200 text-brown-500" aria-label="no">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </span>
  );
}

type Row = { label: string; value: React.ReactNode };

function SpecGroup({ title, rows }: { title: string; rows: Row[] }) {
  const visible = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== "");
  if (!visible.length) return null;
  return (
    <div className="border-t border-brown-100 px-7 py-6 first:border-t-0">
      <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-brown-700">
        {title}
      </h3>
      <dl className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {visible.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-4 border-b border-brown-100 py-1.5 last:border-b-0 sm:border-b-0"
          >
            <dt className="text-sm text-brown-500">{r.label}</dt>
            <dd className="text-sm font-medium text-brown-900">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DetailedSpecs({ details }: { details: ListingDetails }) {
  const {
    engine,
    transmission_details: tr,
    cabin,
    pto,
    rear_hitch,
    hydraulics,
    tires,
  } = details;

  return (
    <div className="border border-brown-200 bg-white">
      <div className="border-b-2 border-brown-700 px-7 pt-7 pb-4">
        <h2 className="font-serif text-xl font-semibold text-brown-900">Technical Details</h2>
      </div>

      {engine && (
        <SpecGroup
          title="Engine"
          rows={[
            { label: "Engine manufacturer", value: engine.manufacturer },
            { label: "Emissions standard", value: engine.emissions_standard },
          ]}
        />
      )}

      {tr && (
        <SpecGroup
          title="Brakes / Transmission"
          rows={[
            { label: "Creeper (super low gears)", value: <YesNo v={tr.creeper} /> },
            { label: "Drive type", value: tr.drive_type },
            { label: "Reversible driving system", value: <YesNo v={tr.reversible} /> },
            { label: "Forward gears", value: tr.forward_gears },
            { label: "Reverse gears", value: tr.reverse_gears },
            { label: "Transmission type", value: tr.type },
          ]}
        />
      )}

      {cabin && (
        <SpecGroup
          title="Cabin / Platform"
          rows={[
            { label: "Cabin", value: <YesNo v={cabin.cabin} /> },
            { label: "Air conditioning", value: <YesNo v={cabin.air_conditioning} /> },
          ]}
        />
      )}

      {pto && (
        <SpecGroup
          title="PTO"
          rows={[{ label: "Rear PTO RPM", value: pto.rear_pto_rpm }]}
        />
      )}

      {rear_hitch && (
        <SpecGroup
          title="Rear Hitch"
          rows={[{ label: "Three-point hitch category", value: rear_hitch.three_point_category }]}
        />
      )}

      {hydraulics && (
        <SpecGroup
          title="Hydraulics"
          rows={[{ label: "ISOBUS connection", value: <YesNo v={hydraulics.isobus} /> }]}
        />
      )}

      {tires && (
        <SpecGroup
          title="Tires"
          rows={[
            { label: "Front left tire", value: tires.front_left },
            { label: "Front right tire", value: tires.front_right },
            { label: "Rear left tire", value: tires.rear_left },
            { label: "Rear right tire", value: tires.rear_right },
            { label: "Front tire", value: tires.front },
            { label: "Rear tire", value: tires.rear },
          ]}
        />
      )}
    </div>
  );
}
