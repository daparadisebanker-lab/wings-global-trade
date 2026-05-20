import Link from "next/link";
import { cookies } from "next/headers";
import CurrencySwitcher from "./CurrencySwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import CategoryMegaMenu from "./CategoryMegaMenu";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currencies";
import { LANG_COOKIE, DEFAULT_LANG, getTranslations } from "@/lib/i18n";

export default async function Header() {
  const cookieStore = await cookies();
  const currency = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const lang     = cookieStore.get(LANG_COOKIE)?.value     ?? DEFAULT_LANG;
  const t        = await getTranslations(lang);

  return (
    <header className="sticky top-0 z-50 bg-[#001E50]">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/wings-logo2.svg"
              alt="Euro Global"
              className="h-7 w-auto brightness-0 invert"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <CategoryMegaMenu />

            <Link
              href="/about"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Nosotros
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Contacto
            </Link>

            {/* Importación — gold accent link */}
            <Link
              href="/importacion"
              className="text-sm font-medium text-[#C4933F] transition-colors hover:text-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Importación Asia
            </Link>
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher current={lang} />
            <CurrencySwitcher current={currency} />
            <div className="h-4 w-px bg-white/15" />
            <Link
              href="/sign-in"
              className="rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t.signIn}
            </Link>
            <Link
              href="/sellers/post-listing"
              className="rounded-full bg-[#C4933F] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#D4A855]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t.postListing}
            </Link>
          </div>

          {/* Mobile toggle */}
          <MobileMenu />
        </div>
      </div>

      {/* Bottom border */}
      <div className="border-b border-white/8" />
    </header>
  );
}
