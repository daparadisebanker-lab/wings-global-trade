import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { getListings } from "@data/listings";
import FeaturedCarousel from "@/components/listings/FeaturedCarousel";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currencies";
import { LANG_COOKIE, DEFAULT_LANG, getTranslations } from "@/lib/i18n";
import { CATEGORIES, ALL_SUBTYPES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Euro Global Machinery — Europe's Agricultural Machinery Marketplace",
};

const HERO_BG     = "/images/hero.jpg";
const FEATURED_BG = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80";
const CTA_BG      = "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&q=80";

const SOLD_IDS: string[] = [];

const TRUST_BADGES = [
  { title: "Certified Inspection",  body: "Every machine professionally verified before listing" },
  { title: "Secure Transaction",    body: "Escrow payment service available on all purchases" },
  { title: "Farm Delivery",         body: "Door-to-door logistics across 28 European countries" },
  { title: "Registration Support",  body: "Full cross-border documentation handled for you" },
];

// Derived from central config — no hardcoding needed here

const BRANDS = [
  "John Deere", "Fendt", "Claas", "New Holland",
  "Massey Ferguson", "Deutz-Fahr", "Case IH", "Valtra",
];

const TESTIMONIALS = [
  {
    name: "Thomas Bauer",
    location: "Bavaria, Germany",
    machine: "Fendt 724 Vario — purchased from Poland",
    quote: "I found a machine I could not source locally. The inspection report gave me complete confidence to buy across borders.",
    img: "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=500&q=80",
  },
  {
    name: "Carlos Mendez",
    location: "Castile, Spain",
    machine: "John Deere 8R — purchased from Germany",
    quote: "I have now purchased three machines through Euro Global. The logistics team made cross-border delivery completely straightforward.",
    img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&q=80",
  },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const currency = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const lang     = cookieStore.get(LANG_COOKIE)?.value     ?? DEFAULT_LANG;
  const [t, allListings] = await Promise.all([
    getTranslations(lang),
    getListings(),
  ]);
  const listings = allListings.slice(0, 6);

  const stats = [
    { label: t.statListings,  value: "52,000+" },
    { label: t.statDealers,   value: "3,800+"  },
    { label: t.statCountries, value: "28"       },
    { label: t.statSold,      value: "1.2M"     },
  ];

  const benefits = [
    { num: "01", title: t.whyReason1Title, body: t.whyReason1Body },
    { num: "02", title: t.whyReason2Title, body: t.whyReason2Body },
    { num: "03", title: t.whyReason3Title, body: t.whyReason3Body },
  ];

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center">
        <Image
          src={HERO_BG}
          alt="European agricultural landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-cream-50/55" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-28 text-center lg:px-8">
          <p className="section-label mb-4 text-brown-700">{t.heroLabel}</p>
          <h1 className="font-serif text-5xl font-semibold leading-tight text-brown-900 drop-shadow-sm sm:text-6xl lg:text-7xl">
            {t.heroLine1}<br />
            <span className="text-brown-700">Agricultural Machine</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-brown-800">
            Thousands of new and used tractors, harvesters, balers, and agricultural equipment from verified dealers across Europe.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-10 flex max-w-3xl flex-col border border-brown-600 bg-brown-800/90 backdrop-blur-sm sm:flex-row">
            <select className="flex-1 border-0 bg-transparent px-5 py-4 text-sm text-brown-300 focus:outline-none focus:ring-0">
              <option value="" className="bg-brown-900">{t.allCategories}</option>
              {CATEGORIES.map((cat) =>
                cat.subtypes.length > 0 ? (
                  <optgroup key={cat.slug} label={cat.shortLabel} className="bg-brown-900">
                    {cat.subtypes.map((sub) => (
                      <option key={sub.href} value={sub.href} className="bg-brown-900">
                        {sub.label}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <option key={cat.slug} value={cat.href} className="bg-brown-900">
                    {cat.shortLabel}
                  </option>
                )
              )}
            </select>
            <div className="hidden w-px bg-brown-600 sm:block" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="flex-[2] border-0 bg-transparent px-5 py-4 text-sm text-cream-50 placeholder-brown-500 focus:outline-none focus:ring-0"
            />
            <Link
              href="/agricultural/tractors"
              className="bg-brown-500 px-10 py-4 text-center text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brown-400"
            >
              {t.searchBtn}
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <span className="pt-0.5 text-xs uppercase tracking-widest text-brown-800">{t.popular}</span>
            {["John Deere 6M", "Fendt 700", "New Holland T7", "Claas Axion"].map((term) => (
              <Link
                key={term}
                href="/agricultural/tractors"
                className="text-xs text-brown-700 underline-offset-2 hover:text-brown-900 hover:underline"
              >
                {term}
              </Link>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-16 grid grid-cols-2 gap-px border border-brown-700 bg-brown-700 lg:grid-cols-4">
            {TRUST_BADGES.map((b) => (
              <div key={b.title} className="bg-brown-900/70 px-6 py-5 text-left backdrop-blur-sm">
                <p className="font-serif text-sm font-semibold text-cream-100">{b.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-brown-400">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS CAROUSEL ────────────────────────────────── */}
      <section
        className="relative py-20"
        style={{ backgroundImage: `url('${FEATURED_BG}')`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-brown-900/85" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="section-label mb-2 text-brown-500">{t.featuredLabel}</p>
              <h2 className="font-serif text-3xl font-semibold text-cream-50">{t.featuredTitle}</h2>
            </div>
            <Link
              href="/agricultural/tractors"
              className="hidden text-xs font-semibold uppercase tracking-widest text-brown-300 underline-offset-4 hover:text-cream-50 hover:underline sm:block"
            >
              {t.viewAllListings} →
            </Link>
          </div>

          <FeaturedCarousel
            listings={listings}
            soldIds={SOLD_IDS}
            currency={currency}
            labels={{
              hours:           t.cardHours,
              power:           t.cardPower,
              hrsUnit:         t.hrsUnit,
              hpUnit:          t.hpUnit,
              viewDetails:     t.cardViewDetails,
              condNew:         t.condLabelNew,
              condUsed:        t.condLabelUsed,
              condRefurbished: t.condLabelRefurbished,
              viewAllListings: t.viewAllListings,
            }}
            lang={lang}
          />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────── */}
      <section className="bg-brown-900 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-10 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border-l-2 border-brown-700 pl-6">
                <dd className="font-serif text-4xl font-semibold text-cream-50">{s.value}</dd>
                <dt className="mt-1 text-xs uppercase tracking-widest text-brown-500">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── MACHINERY TYPES ───────────────────────────────────────────── */}
      <section className="bg-cream-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <p className="section-label mb-2">Browse by Type</p>
            <h2 className="font-serif text-3xl font-semibold text-brown-900">Most Popular Machinery Types</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {ALL_SUBTYPES.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                className="group relative h-48 overflow-hidden"
              >
                <Image
                  src={`https://images.unsplash.com/${sub.unsplashId}?w=400&q=80`}
                  alt={sub.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-brown-900/60 transition-colors duration-300 group-hover:bg-brown-900/75" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                  <span className="font-serif text-sm font-semibold leading-tight text-cream-50">
                    {sub.label}
                  </span>
                  <span className="mt-1 text-[10px] text-brown-300">
                    {sub.count} {t.listings}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="border-y border-brown-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="section-label mb-2">Client Stories</p>
              <h2 className="font-serif text-3xl font-semibold text-brown-900">What Our Buyers Say</h2>
            </div>
            <Link href="/agricultural/tractors" className="hidden text-xs font-semibold uppercase tracking-widest text-brown-400 underline-offset-4 hover:text-brown-900 hover:underline sm:block">
              View More Listings →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {TESTIMONIALS.map((item) => (
              <div key={item.name} className="flex flex-col gap-0 border border-brown-200 sm:flex-row">
                <div className="relative h-52 w-full shrink-0 sm:h-auto sm:w-48">
                  <Image
                    src={item.img}
                    alt={item.machine}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 192px"
                  />
                </div>
                <div className="flex flex-col justify-center p-7">
                  <p className="font-serif text-base font-semibold text-brown-900">{item.name}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-widest text-brown-400">{item.location}</p>
                  <p className="mt-4 text-sm leading-relaxed text-brown-600">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <p className="mt-4 text-xs italic text-brown-400">{item.machine}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR BRANDS ────────────────────────────────────────────── */}
      <section className="bg-cream-100 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <p className="section-label mb-2">Inventory</p>
            <h2 className="font-serif text-3xl font-semibold text-brown-900">Popular Brands</h2>
          </div>
          <div className="grid grid-cols-2 gap-px border border-brown-200 bg-brown-200 sm:grid-cols-4">
            {BRANDS.map((brand) => (
              <Link
                key={brand}
                href={`/agricultural/tractors?brand=${encodeURIComponent(brand)}`}
                className="group flex items-center justify-center bg-white px-6 py-10 transition-colors hover:bg-brown-900"
              >
                <span className="font-serif text-lg font-semibold text-brown-500 transition-colors group-hover:text-cream-50">
                  {brand}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NUMBERED BENEFITS ─────────────────────────────────────────── */}
      <section className="border-y border-brown-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <p className="section-label mb-2">{t.whyLabel}</p>
            <h2 className="font-serif text-3xl font-semibold text-brown-900">{t.whyTitle}</h2>
          </div>
          <div className="grid gap-px border border-brown-200 bg-brown-200 sm:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.num} className="bg-white p-10">
                <p className="font-serif text-7xl font-semibold leading-none text-brown-100">{b.num}</p>
                <h3 className="mt-5 font-serif text-lg font-semibold text-brown-900">{b.title}</h3>
                <div className="mt-3 h-px w-12 bg-brown-300" />
                <p className="mt-4 text-sm leading-relaxed text-brown-500">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SELLER CTA ────────────────────────────────────────────────── */}
      <section
        className="relative py-28"
        style={{ backgroundImage: `url('${CTA_BG}')`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-brown-900/85" />
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center lg:px-8">
          <p className="section-label mb-3 text-brown-500">{t.ctaLabel}</p>
          <h2 className="font-serif text-4xl font-semibold text-cream-50 sm:text-5xl">{t.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-lg text-base font-light leading-relaxed text-brown-300">
            {t.ctaBody}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sellers/post-listing" className="btn-primary px-10 text-xs uppercase tracking-widest">
              {t.ctaBtn}
            </Link>
            <Link href="/sellers/dealer-accounts" className="btn-outline-light px-10 text-xs uppercase tracking-widest">
              {t.ctaBtnSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
