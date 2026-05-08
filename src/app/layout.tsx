import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Euro Global Machinery | Agricultural Equipment Marketplace",
    template: "%s | Euro Global Machinery",
  },
  description:
    "Europe's leading marketplace for new and used agricultural machinery. Browse tractors, harvesters, and farm equipment listings.",
  keywords: ["tractors", "agricultural machinery", "farm equipment", "used tractors"],
  openGraph: {
    type: "website",
    locale: "en_EU",
    siteName: "Euro Global Machinery",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
