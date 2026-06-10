"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the brandbook site chrome (Header/Footer/WhatsApp/MobileBottomBar) on
 * the homepage, which carries its own chrome per WINGS_HOME_SPEC.md. Inner
 * pages are untouched. Children are server components passed through as-is.
 */
export default function LegacyChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
