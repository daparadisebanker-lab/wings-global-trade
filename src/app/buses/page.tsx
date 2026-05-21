import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Buses y Autocares — Euro Global Machinery",
  description: "Buses urbanos, autocares interurbanos, minibuses y buses escolares de fabricantes asiáticos con entrega en Latinoamérica.",
};

const cat = CATEGORIES.find((c) => c.slug === "buses")!;

export default function BusesPage() {
  return <CategoryHubPage category={cat} />;
}
