import type { MetadataRoute } from "next";
import { siteUrl } from "~/lib/env-urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    "",
    "/products/buzz",
    "/products/channels",
    "/products/file-management",
    "/pricing",
    "/about-us",
    "/download",
  ];

  return routes.map((route) => ({
    url: siteUrl(route),
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
