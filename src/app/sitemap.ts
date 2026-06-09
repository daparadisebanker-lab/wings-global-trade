import type { MetadataRoute } from "next";
import { getListings } from "@data/listings";

const BASE = "https://wingsglobaltrade.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getListings();

  const productUrls: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE}/agricultural/tractors/${l.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: BASE,                                     lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/agricultural/tractors`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/brands`,                         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/brands/new-holland`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/brands/john-deere`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/brands/massey-ferguson`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/brands/kubota`,                  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/importacion`,                    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/cotizar`,                        lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/proximamente`,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/categories`,                     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/about`,                          lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`,                        lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/careers`,                        lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/press`,                          lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...productUrls,
  ];
}
