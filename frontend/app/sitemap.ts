import type { MetadataRoute } from "next";
import { LIVE_TOOLS } from "@/lib/tools-data";

const BASE_URL = "https://devtools.pantane.is-a.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tools`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = LIVE_TOOLS.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...toolRoutes];
}
