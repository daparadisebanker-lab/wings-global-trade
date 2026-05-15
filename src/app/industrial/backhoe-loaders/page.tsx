import type { Metadata } from "next";
import ComingSoonCategory from "@/components/listings/ComingSoonCategory";

export const metadata: Metadata = {
  title: "Backhoe Loaders for Sale — Euro Global Machinery",
  description: "Browse new and used backhoe loaders from verified dealers across Europe.",
};

export default function BackhoeLoadersPage() {
  return (
    <ComingSoonCategory
      title="Backhoe Loader for Sale"
      filterTypes={["4x4", "2WS", "4WS"]}
      categorySlug="industrial"
      activeSlug="backhoe-loaders"
    />
  );
}
