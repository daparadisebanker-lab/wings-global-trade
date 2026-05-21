import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Maquinaria Agrícola — Euro Global Machinery",
  description: "Tractores, cosechadoras, empacadoras, arados y segadoras importados desde Asia con precio landed total para Latinoamérica.",
};

const cat = CATEGORIES.find((c) => c.slug === "agricultural")!;

export default function AgriculturalPage() {
  return <CategoryHubPage category={cat} />;
}
