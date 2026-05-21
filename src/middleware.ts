import { type NextRequest, NextResponse } from "next/server";
import { getCurrencyForCountry, CURRENCY_COOKIE } from "@/lib/currencies";
import { getLanguageForCountry, LANG_COOKIE } from "@/lib/i18n";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const country = request.headers.get("x-vercel-ip-country") ?? "DE";

  if (!request.cookies.get(CURRENCY_COOKIE)) {
    response.cookies.set(CURRENCY_COOKIE, getCurrencyForCountry(country), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  if (!request.cookies.get(LANG_COOKIE)) {
    response.cookies.set(LANG_COOKIE, getLanguageForCountry(country), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
