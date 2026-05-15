import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Euro Global Machinery",
  description: "Learn about Euro Global Machinery — Europe's leading marketplace for tractors, vehicles, and agricultural equipment since 2005.",
};

const MILESTONES = [
  { year: "2005", event: "Founded in Munich, Germany, with 40 listings and a focus on German agricultural machinery." },
  { year: "2009", event: "Expanded to France, Poland, and the Netherlands. Reached 10,000 active listings." },
  { year: "2013", event: "Launched verified dealer programme. 500 dealerships joined in the first year." },
  { year: "2017", event: "Introduced WhatsApp-based enquiry routing, cutting response times by 60%." },
  { year: "2020", event: "Expanded to Latin America with Spanish-language support and regional currency conversion." },
  { year: "2024", event: "Surpassed 52,000 active listings and 3,800 verified dealers across 28 countries." },
];

const VALUES = [
  {
    title: "Transparency",
    body: "Every listing is honest and verifiable. We require accurate condition descriptions and do not allow misleading content.",
  },
  {
    title: "Trust",
    body: "Verified dealer badges are earned, not bought. Our vetting process ensures buyers can trade with confidence.",
  },
  {
    title: "Reach",
    body: "We break down borders. Our platform serves buyers and sellers across Europe and Latin America in their own language and currency.",
  },
];

const TEAM = [
  { name: "Thomas Bauer", role: "Chief Executive Officer", location: "Munich, Germany" },
  { name: "Isabelle Morin", role: "Chief Operating Officer", location: "Lyon, France" },
  { name: "Marek Kowalski", role: "Head of Dealer Relations", location: "Warsaw, Poland" },
  { name: "Ana Ferreira", role: "Head of Marketplace", location: "Lisbon, Portugal" },
  { name: "Jan van der Berg", role: "Head of Technology", location: "Amsterdam, Netherlands" },
  { name: "Carlos Mendez", role: "Director, Latin America", location: "Madrid, Spain" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <div className="border-b border-brown-200 bg-brown-900 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="section-label mb-3 text-brown-500">Our Story</p>
            <h1 className="font-serif text-4xl font-semibold text-cream-50 sm:text-5xl lg:text-6xl">
              About Euro Global Machinery
            </h1>
            <p className="mt-6 text-lg font-light leading-relaxed text-brown-400">
              Since 2005, we have been connecting buyers and sellers of tractors, vehicles, and agricultural machinery across Europe and beyond. What began as a small regional directory has grown into the continent&apos;s most trusted marketplace for professional machinery trade.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="border-b border-brown-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: "52,000+", label: "Active Listings" },
              { value: "3,800+", label: "Verified Dealers" },
              { value: "28",     label: "Countries" },
              { value: "1.2M",   label: "Machines Sold" },
            ].map((s) => (
              <div key={s.label} className="border-l-2 border-brown-300 pl-5">
                <dd className="font-serif text-3xl font-semibold text-brown-900">{s.value}</dd>
                <dt className="mt-1 text-xs uppercase tracking-widest text-brown-500">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="section-label mb-2">Mission</p>
              <h2 className="font-serif text-3xl font-semibold text-brown-900">
                Making Cross-Border Machinery Trade Accessible
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-brown-600">
                The machinery market is fragmented. A dealer in Germany has no easy way to reach a buyer in Portugal, and a farmer in Poland may be unaware of the best prices available in France. We exist to solve that.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-brown-600">
                Our platform removes language, currency, and distance as barriers to trade. Every listing is available in 8 languages with live currency conversion, and our logistics partner network makes cross-border delivery straightforward.
              </p>
            </div>
            <div>
              <p className="section-label mb-2">Values</p>
              <div className="space-y-6">
                {VALUES.map((v) => (
                  <div key={v.title} className="border-l-2 border-brown-300 pl-5">
                    <h3 className="font-serif text-base font-semibold text-brown-900">{v.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-brown-500">{v.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-brown-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">History</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">Two Decades of Growth</h2>
          <div className="divide-y divide-brown-100">
            {MILESTONES.map((m) => (
              <div key={m.year} className="grid py-6 sm:grid-cols-5 sm:gap-10">
                <p className="font-serif text-2xl font-semibold text-brown-300 sm:col-span-1">{m.year}</p>
                <p className="mt-2 text-sm leading-relaxed text-brown-600 sm:col-span-4 sm:mt-0">{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Leadership</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">Our Team</h2>
          <div className="grid gap-px bg-brown-200 border border-brown-200 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white p-7">
                <div className="mb-4 h-12 w-12 bg-brown-100" />
                <p className="font-serif text-base font-semibold text-brown-900">{member.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-brown-500">{member.role}</p>
                <p className="mt-1 text-xs text-brown-400">{member.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-brown-200 bg-brown-900 py-14">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-serif text-2xl font-semibold text-cream-50">Join Our Marketplace</h2>
          <p className="mt-3 text-sm text-brown-400">Whether you are buying or selling, we are here to help.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/agricultural/tractors" className="btn-primary text-xs uppercase tracking-widest">
              Browse Listings
            </Link>
            <Link href="/sellers/post-listing" className="btn-outline-light text-xs uppercase tracking-widest">
              Post a Listing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
