import type { Metadata } from "next";
import CategoryHubPage from "@/components/listings/CategoryHubPage";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Trucks & Heavy Vehicles for Sale — Euro Global Machinery",
  description: "Browse tractor trucks, dump trucks, cargo, tanker, and refrigerated vehicles — new and used from verified dealers.",
};

const cat = CATEGORIES.find((c) => c.slug === "trucks")!;

export default function TrucksPage() {
  return <CategoryHubPage category={cat} />;
}
