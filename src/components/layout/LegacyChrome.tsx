"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the brandbook site chrome (Header/Footer) on the homepage, which
 * carries its own chrome (SiteHeader/FixedBar/SideDrawer). The bottom menu
 * (MobileBottomBar) renders on every route, including "/", outside this gate.
 * Children are server components passed through as-is.
 */
export default function LegacyChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
