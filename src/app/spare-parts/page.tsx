import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Spare Parts & Components — Euro Global Machinery",
  description: "Used engines from Japan, new engines from China, transmissions, axles, and aftermarket components for trucks, buses, and heavy equipment.",
};

const cat = CATEGORIES.find((c) => c.slug === "spare-parts")!;

export default function SparePartsPage() {
  return <CategoryHubPage category={cat} />;
}
