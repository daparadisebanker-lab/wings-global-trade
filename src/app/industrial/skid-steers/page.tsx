import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Skid Steer Loaders for Sale — Wings Global Trade",
  description: "Browse new and used skid steer loaders from verified dealers across Europe.",
};

export default function SkidSteersPage() {
  return (
    <ComingSoonCategory
      title="Skid Steer Loader for Sale"
      filterTypes={["Wheeled", "Tracked"]}
      categorySlug="industrial"
      activeSlug="skid-steers"
    />
  );
}
