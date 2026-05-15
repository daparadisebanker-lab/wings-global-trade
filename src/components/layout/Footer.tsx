import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

const footerLinks = {
  Sellers: [
    { label: "Post a Listing",   href: "/sellers/post-listing"    },
    { label: "Dealer Accounts",  href: "/sellers/dealer-accounts" },
    { label: "Pricing",          href: "/sellers/pricing"         },
    { label: "Seller Resources", href: "/sellers/resources"       },
  ],
  Company: [
    { label: "About Us", href: "/about"   },
    { label: "Contact",  href: "/contact" },
    { label: "Careers",  href: "/careers" },
    { label: "Press",    href: "/press"   },
  ],
  Support: [
    { label: "Help Center",    href: "#" },
    { label: "Safety Tips",    href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Use",   href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-brown-200 bg-brown-900 text-brown-300">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-serif text-base font-semibold tracking-wide text-cream-100">
                EURO GLOBAL
              </span>
              <span className="mt-0.5 text-[10px] font-light tracking-[0.25em] text-brown-400 uppercase">
                Machinery
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-brown-400">
              Europe&apos;s leading marketplace for agricultural machinery. Connecting buyers and sellers worldwide since 2005.
            </p>
            <div className="mt-6 flex gap-4 text-xs tracking-widest text-brown-500 uppercase">
              {["DE", "FR", "PL", "UK", "NL", "IT"].map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </div>

          {/* Browse by category */}
          <div>
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-brown-500">
              Browse
            </h3>
            <ul className="space-y-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={cat.href}
                    className="text-sm font-medium text-brown-300 transition-colors hover:text-cream-100"
                  >
                    {cat.shortLabel}
                  </Link>
                  {cat.subtypes.length > 0 && (
                    <ul className="mt-1.5 ml-3 space-y-1.5 border-l border-brown-800 pl-3">
                      {cat.subtypes.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className="text-xs text-brown-500 transition-colors hover:text-brown-300"
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Other static link groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-brown-500">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-brown-400 transition-colors hover:text-cream-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-brown-800 pt-6 sm:flex-row">
          <p className="text-xs text-brown-600">
            &copy; {new Date().getFullYear()} Euro Global Machinery Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-brown-600">
            <p>Registered in the European Union</p>
            <Link href="/admin/login" className="opacity-10 hover:opacity-100 transition-opacity">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
