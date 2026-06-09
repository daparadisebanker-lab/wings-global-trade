import type { MetadataRoute } from "next";
import { getListings } from "@data/listings";
import { KAMA_SERIES } from "@/lib/kama-series";

const BASE = "https://wingsglobaltrade.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getListings();

  const tractorUrls: MetadataRoute.Sitemap = listings
    .filter((l) => l.brand !== "KAMA")
    .map((l) => ({
      url: `${BASE}/agricultural/tractors/${l.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const kamaModelUrls: MetadataRoute.Sitemap = KAMA_SERIES.flatMap((s) =>
    s.modelIds.map((id) => ({
      url: `${BASE}/brands/kama/${s.slug}/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  const kamaSeriesUrls: MetadataRoute.Sitemap = KAMA_SERIES.map((s) => ({
    url: `${BASE}/brands/kama/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [
    // Core pages
    { url: BASE,                                     lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/agricultural/tractors`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.95 },
    { url: `${BASE}/camiones`,                       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE}/importacion`,                    lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/cotizar`,                        lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    // Brand hubs
    { url: `${BASE}/brands`,                         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE}/brands/new-holland`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/brands/john-deere`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/brands/massey-ferguson`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/brands/kubota`,                  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/brands/kama`,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    // KAMA series
    ...kamaSeriesUrls,
    // Trust & info pages
    { url: `${BASE}/about`,                          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7  },
    { url: `${BASE}/categories`,                     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5  },
    // Product detail pages
    ...tractorUrls,
    ...kamaModelUrls,
  ];
}
