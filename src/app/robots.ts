import type { MetadataRoute } from "next";
import { siteUrl } from "~/lib/env-urls";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/"],
    },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
