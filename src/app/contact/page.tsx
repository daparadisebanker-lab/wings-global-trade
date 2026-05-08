import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Euro Global Machinery",
  description: "Get in touch with the Euro Global Machinery team for support, sales, or general enquiries.",
};

const OFFICES = [
  {
    city: "Munich",
    country: "Germany (HQ)",
    address: "Schillerstrasse 14, 80336 Munich",
    phone: "+49 89 2000 1234",
    email: "info@euroglobalexport.com",
  },
  {
    city: "Warsaw",
    country: "Poland",
    address: "ul. Marszałkowska 84, 00-514 Warsaw",
    phone: "+48 22 500 9900",
    email: "poland@euroglobalexport.com",
  },
  {
    city: "Madrid",
    country: "Spain",
    address: "Calle de Alcalá 50, 28014 Madrid",
    phone: "+34 91 700 4400",
    email: "iberia@euroglobalexport.com",
  },
];

const TOPICS = [
  { value: "general",  label: "General Enquiry" },
  { value: "listing",  label: "Help with a Listing" },
  { value: "dealer",   label: "Dealer Account" },
  { value: "report",   label: "Report a Listing" },
  { value: "press",    label: "Press & Media" },
  { value: "other",    label: "Other" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream-50">

      {/* Header */}
      <div className="border-b border-brown-200 bg-brown-900 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="section-label mb-3 text-brown-500">Get in Touch</p>
          <h1 className="font-serif text-4xl font-semibold text-cream-50 sm:text-5xl">Contact</h1>
          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-brown-400">
            Our team is available Monday to Friday, 08:00–18:00 CET. We aim to respond to all enquiries within one business day.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="border border-brown-200 bg-white p-8 sm:p-10">
              <h2 className="mb-2 font-serif text-2xl font-semibold text-brown-900">Send Us a Message</h2>
              <p className="mb-8 text-sm text-brown-500">
                Fill in the form and we will get back to you within one business day.
              </p>
              <form className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Full Name</label>
                    <input type="text" placeholder="Your name" className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Email Address</label>
                    <input type="email" placeholder="you@example.com" className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Phone (optional)</label>
                    <input type="tel" placeholder="+49 …" className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Topic</label>
                    <select className="input-field">
                      {TOPICS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">Message</label>
                  <textarea rows={6} placeholder="Describe your question or request…" className="input-field resize-none" />
                </div>
                <button type="submit" className="btn-primary w-full text-xs uppercase tracking-widest">
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick contact */}
            <div className="border border-brown-200 bg-white p-7">
              <h3 className="mb-5 font-serif text-base font-semibold text-brown-900">Direct Contact</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-400">General</p>
                  <p className="mt-1 text-brown-700">info@euroglobalexport.com</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-400">Dealer Support</p>
                  <p className="mt-1 text-brown-700">dealers@euroglobalexport.com</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-400">Press</p>
                  <p className="mt-1 text-brown-700">press@euroglobalexport.com</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-400">Hours</p>
                  <p className="mt-1 text-brown-700">Mon–Fri, 08:00–18:00 CET</p>
                </div>
              </div>
            </div>

            {/* Offices */}
            <div className="border border-brown-200 bg-white p-7">
              <h3 className="mb-5 font-serif text-base font-semibold text-brown-900">Our Offices</h3>
              <div className="space-y-6">
                {OFFICES.map((o) => (
                  <div key={o.city}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-400">{o.city} — {o.country}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-brown-600">{o.address}</p>
                    <p className="mt-1 text-xs text-brown-500">{o.phone}</p>
                    <p className="mt-0.5 text-xs text-brown-500">{o.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
