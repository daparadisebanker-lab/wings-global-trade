import Link from "next/link";
import { cookies } from "next/headers";
import CurrencySwitcher from "./CurrencySwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import CategoryMegaMenu from "./CategoryMegaMenu";
import NavLinkWithDropdown from "./NavLinkWithDropdown";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currencies";
import { LANG_COOKIE, DEFAULT_LANG, getTranslations } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/categories";

export default async function Header() {
  const cookieStore = await cookies();
  const currency = cookieStore.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
  const lang     = cookieStore.get(LANG_COOKIE)?.value     ?? DEFAULT_LANG;
  const t        = await getTranslations(lang);

  return (
    <header className="sticky top-0 z-50 border-b border-brown-200 bg-white">
      {/* Top bar */}
      <div className="bg-brown-900 py-2 text-center text-xs tracking-widest text-brown-300 uppercase">
        {t.topBar}
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-4">

          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-wide text-brown-900">
              EURO GLOBAL
            </span>
            <span className="text-[10px] font-light tracking-[0.25em] text-brown-500 uppercase">
              Machinery
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-10 md:flex">
            <CategoryMegaMenu />

            <Link
              href="/"
              className="text-sm font-medium tracking-wide text-brown-600 transition-colors hover:text-brown-900"
            >
              {t.navHome}
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium tracking-wide text-brown-600 transition-colors hover:text-brown-900"
            >
              {t.navAbout}
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium tracking-wide text-brown-600 transition-colors hover:text-brown-900"
            >
              {t.navContact}
            </Link>
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher current={lang} />
            <CurrencySwitcher current={currency} />
            <div className="h-4 w-px bg-brown-200" />
            <Link href="/sign-in" className="btn-secondary !px-4 !py-2 text-xs">
              {t.signIn}
            </Link>
            <Link href="/sellers/post-listing" className="btn-primary !px-4 !py-2 text-xs">
              {t.postListing}
            </Link>
          </div>

          {/* Mobile toggle */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
