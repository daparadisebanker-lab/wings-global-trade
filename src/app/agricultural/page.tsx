import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Agricultural Machinery for Sale — Euro Global Machinery",
  description: "Browse tractors, harvesters, balers, plows, and mowers from verified dealers across Europe.",
};

const cat = CATEGORIES.find((c) => c.slug === "agricultural")!;

export default function AgriculturalPage() {
  return <CategoryHubPage category={cat} />;
}
