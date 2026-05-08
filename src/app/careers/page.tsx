import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers — Euro Global Machinery",
  description: "Join the Euro Global Machinery team and help build Europe's leading machinery marketplace.",
};

const VALUES = [
  {
    title: "Pan-European Team",
    body: "We are a remote-first company with team members across Germany, France, Poland, Spain, Portugal, and the Netherlands.",
  },
  {
    title: "Meaningful Work",
    body: "We connect farmers, dealers, and equipment buyers in ways that genuinely improve their businesses and livelihoods.",
  },
  {
    title: "Ownership Culture",
    body: "Every team member is trusted with real responsibility. We prefer initiative over process and outcomes over activity.",
  },
];

const POSITIONS = [
  {
    title: "Senior Full-Stack Engineer",
    team: "Technology",
    location: "Remote (EU)",
    type: "Full-time",
    description: "Help us scale the platform to handle millions of listings and buyers across Europe.",
  },
  {
    title: "Dealer Account Manager",
    team: "Sales",
    location: "Warsaw or Remote",
    type: "Full-time",
    description: "Onboard and manage relationships with dealers across Poland, Czech Republic, and Hungary.",
  },
  {
    title: "Product Designer",
    team: "Product",
    location: "Remote (EU)",
    type: "Full-time",
    description: "Design clear, professional experiences for buyers and sellers on web and mobile.",
  },
  {
    title: "Country Manager — Italy",
    team: "Operations",
    location: "Milan or Remote",
    type: "Full-time",
    description: "Lead our market expansion in Italy, building dealer and buyer networks from the ground up.",
  },
  {
    title: "Content & SEO Specialist",
    team: "Marketing",
    location: "Remote (EU)",
    type: "Full-time",
    description: "Create multilingual content that drives organic traffic and educates buyers and sellers.",
  },
  {
    title: "Customer Support Specialist",
    team: "Support",
    location: "Remote",
    type: "Part-time",
    description: "Help buyers and sellers resolve enquiries promptly. Fluency in German or French required.",
  },
];

const BENEFITS = [
  { title: "Remote-first", body: "Work from anywhere in Europe with flexible hours." },
  { title: "Competitive salary", body: "Benchmarked annually against European market rates." },
  { title: "Learning budget", body: "€1,500 per year for courses, books, and conferences." },
  { title: "Home office setup", body: "Full equipment allowance for your home workspace." },
  { title: "Paid leave", body: "30 days per year plus national holidays." },
  { title: "Health cover", body: "Private health insurance for you and your family." },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <div className="border-b border-brown-200 bg-brown-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-3 text-brown-500">Join Us</p>
          <h1 className="font-serif text-4xl font-semibold text-cream-50 sm:text-5xl">Careers</h1>
          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-brown-400">
            We are building Europe&apos;s most trusted machinery marketplace. Join a small, focused team with a big mission.
          </p>
        </div>
      </div>

      {/* Culture */}
      <section className="border-b border-brown-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Our Culture</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">How We Work</h2>
          <div className="grid gap-px bg-brown-200 border border-brown-200 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white p-8">
                <h3 className="font-serif text-base font-semibold text-brown-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-500">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Open Positions</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">
            {POSITIONS.length} Open Roles
          </h2>
          <div className="divide-y divide-brown-200 border border-brown-200 bg-white">
            {POSITIONS.map((pos) => (
              <div key={pos.title} className="group flex flex-col gap-3 p-7 transition-colors hover:bg-cream-100 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-serif text-base font-semibold text-brown-900">{pos.title}</h3>
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-brown-400 border border-brown-200 px-2 py-0.5">
                      {pos.type}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-xs text-brown-500">
                    <span>{pos.team}</span>
                    <span>{pos.location}</span>
                  </div>
                  <p className="mt-2 text-sm text-brown-600">{pos.description}</p>
                </div>
                <Link
                  href={`/contact?role=${encodeURIComponent(pos.title)}`}
                  className="btn-secondary shrink-0 text-xs"
                >
                  Apply
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-brown-500">
            Don&apos;t see a fit? Send a speculative application to{" "}
            <a href="mailto:careers@euroglobalexport.com" className="underline hover:text-brown-800">
              careers@euroglobalexport.com
            </a>
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-brown-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-2">Benefits</p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-brown-900">What We Offer</h2>
          <div className="grid gap-px bg-brown-200 border border-brown-200 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white p-7">
                <h3 className="font-serif text-base font-semibold text-brown-900">{b.title}</h3>
                <p className="mt-2 text-sm text-brown-500">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
