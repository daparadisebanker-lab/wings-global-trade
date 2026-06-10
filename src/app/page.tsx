import type { Metadata } from "next";
import { getListings } from "@data/listings";
import SiteHeader from "@/components/chrome/SiteHeader";
import FixedBar from "@/components/chrome/FixedBar";
import Hero from "@/components/sections/Hero";
import CoverageBand from "@/components/sections/CoverageBand";
import CategoryWindows from "@/components/sections/CategoryWindows";
import FeaturedMachinery from "@/components/sections/FeaturedMachinery";
import ContainerReveal from "@/components/sections/ContainerReveal";
import LogisticsSequence from "@/components/sections/LogisticsSequence";
import TrustSection from "@/components/sections/TrustSection";

export const metadata: Metadata = {
  title: "Wings | Importación de Maquinaria desde Zona Franca — Tacna / Iquique",
  description:
    "Importación de maquinaria agrícola, camiones, buses e industrial desde zona franca (ZofraTacna / ZOFRI). De puerto a planta. Solicita tu cotización.",
  alternates: { canonical: "https://wingsglobaltrade.com" },
};

const BRAND_ROUTES: Record<string, string> = {
  "New Holland": "/brands/new-holland",
  "John Deere": "/brands/john-deere",
  "Massey Ferguson": "/brands/massey-ferguson",
  Kubota: "/brands/kubota",
};

/**
 * Homepage — the scroll-narrative spine of the spec build merged with the
 * real brand (actual logo, brand photography) and the previous homepage's
 * commercial content (live inventory, operation numbers, buyers, brands).
 */
export default async function HomePage() {
  const listings = await getListings();

  // Featured: interleave up to 2 per brand (images-first, HP-desc within brand).
  const brandOrder = ["New Holland", "John Deere", "Kubota", "Massey Ferguson"];
  const perBrand = new Map<string, typeof listings>();
  for (const l of listings) {
    if (!perBrand.has(l.brand)) perBrand.set(l.brand, []);
    perBrand.get(l.brand)!.push(l);
  }
  for (const [, arr] of perBrand) {
    arr.sort((a, b) => {
      const aImg = (a.images?.length ?? 0) > 0;
      const bImg = (b.images?.length ?? 0) > 0;
      if (aImg !== bImg) return aImg ? -1 : 1;
      return (b.horsepower ?? 0) - (a.horsepower ?? 0);
    });
  }
  const featured: typeof listings = [];
  for (let round = 0; round < 2 && featured.length < 6; round++) {
    for (const brand of brandOrder) {
      if (featured.length >= 6) break;
      const arr = perBrand.get(brand) ?? [];
      if (arr.length > round) featured.push(arr[round]);
    }
  }

  const brandCounts = new Map<string, number>();
  for (const l of listings) {
    brandCounts.set(l.brand, (brandCounts.get(l.brand) ?? 0) + 1);
  }
  const brands = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      href: BRAND_ROUTES[name] ?? "/agricultural/tractors",
    }));

  const stats = [
    { value: String(listings.length), label: "Modelos disponibles" },
    { value: String(brandCounts.size), label: "Marcas de fábrica" },
    { value: "12", label: "Países atendidos" },
    { value: "45–90", label: "Días puerta a planta" },
  ];

  return (
    <div
      data-page="wings-home"
      data-theme="dark"
      className="relative pb-0 md:pb-[calc(56px_+_env(safe-area-inset-bottom))]"
    >
      <SiteHeader />
      <Hero />
      <CoverageBand />
      <CategoryWindows />
      <FeaturedMachinery listings={featured} />
      <ContainerReveal />
      <LogisticsSequence />
      <TrustSection stats={stats} brands={brands} />
      <FixedBar />
    </div>
  );
}
