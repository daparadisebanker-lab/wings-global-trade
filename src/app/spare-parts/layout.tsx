import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SparePartsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
