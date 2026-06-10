import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomBar from "@/components/layout/MobileBottomBar";
import SplashScreen from "@/components/chrome/SplashScreen";
import LegacyChrome from "@/components/layout/LegacyChrome";
import JsonLd from "@/components/seo/JsonLd";

const BASE = "https://wingsglobaltrade.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Wings Global Trade",
  "url": BASE,
  "logo": `${BASE}/logo.png`,
  "description": "Importador de maquinaria agrícola, camiones y vehículos comerciales desde Asia para Latinoamérica. Precio landed total — flete, aranceles y entrega incluidos — para Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay.",
  "foundingDate": "2020",
  "areaServed": ["PE", "BO", "CL", "PY", "AR", "UY", "GT", "SV", "HN", "NI", "CR", "PA"],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+51958381473",
    "contactType": "sales",
    "availableLanguage": "Spanish",
    "contactOption": "TollFree",
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "PE",
  },
  "sameAs": [BASE],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Wings Global Trade | Maquinaria desde Asia para Latinoamérica",
    template: "%s | Wings Global Trade",
  },
  description:
    "Tractores New Holland, John Deere, Massey Ferguson y Kubota — más 27 modelos de camiones KAMA. Importación directa desde Asia con precio landed total: flete, aranceles y entrega hasta tu campo. Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay.",
  openGraph: {
    type: "website",
    locale: "es_419",
    siteName: "Wings Global Trade",
    url: BASE,
    title: "Wings Global Trade | Maquinaria desde Asia para Latinoamérica",
    description:
      "Importación directa de tractores y camiones desde Asia. Precio landed total — sin costos ocultos. 12 países de entrega en Latinoamérica.",
    images: [
      {
        url: `${BASE}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "Wings Global Trade — Maquinaria agrícola importada desde Asia para LATAM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wings Global Trade | Maquinaria desde Asia para Latinoamérica",
    description:
      "Tractores y camiones importados desde Asia. Precio landed total para Perú, Bolivia, Chile y más.",
    images: [`${BASE}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: BASE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE">
      <body className="flex min-h-screen flex-col">
        <SplashScreen />
        <JsonLd schema={organizationSchema} />
        {/* Brandbook chrome hides on "/" — the homepage carries its own
            chrome (SiteHeader / FixedBar) per WINGS_HOME_SPEC.md */}
        <LegacyChrome>
          <Header />
        </LegacyChrome>
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <LegacyChrome>
          <Footer />
        </LegacyChrome>
        <MobileBottomBar />
      </body>
    </html>
  );
}
