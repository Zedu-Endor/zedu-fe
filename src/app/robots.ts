import type { MetadataRoute } from "next";
import { siteUrl } from "~/lib/env-urls";
import { normalizeMarketingSiteUrl } from "~/lib/marketing-site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = normalizeMarketingSiteUrl(siteUrl());

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/accept_general_invitation",
          "/accept_org_invitation",
          "/account",
          "/billing",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
