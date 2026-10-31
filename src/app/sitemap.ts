import type { MetadataRoute } from "next";
import { siteUrl } from "~/lib/env-urls";
import { MARKETING_PAGES, marketingPageUrl } from "~/lib/marketing-site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const baseUrl = siteUrl();

  return MARKETING_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: marketingPageUrl(path, baseUrl),
    lastModified,
    changeFrequency,
    priority,
  }));
}
