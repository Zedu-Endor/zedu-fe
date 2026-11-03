export type MarketingChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type MarketingPage = {
  path: string;
  changeFrequency: MarketingChangeFrequency;
  priority: number;
};

export const DEFAULT_MARKETING_SITE_URL = "https://zedu.chat";

export const MARKETING_PAGES: MarketingPage[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/resources", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact-sales", changeFrequency: "monthly", priority: 0.6 },
  { path: "/download", changeFrequency: "monthly", priority: 0.6 },
  { path: "/policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
  {
    path: "/solutions/bootcamps",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/solutions/schools",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/solutions/universities",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  { path: "/products/buzz", changeFrequency: "weekly", priority: 0.8 },
  { path: "/products/channels", changeFrequency: "weekly", priority: 0.8 },
  {
    path: "/products/file-management",
    changeFrequency: "weekly",
    priority: 0.8,
  },
];

export function normalizeMarketingSiteUrl(baseUrl?: string): string {
  const value = baseUrl?.trim().replace(/\/+$/, "");
  return value || DEFAULT_MARKETING_SITE_URL;
}

export function marketingPageUrl(path: string, baseUrl?: string): string {
  const base = normalizeMarketingSiteUrl(baseUrl);
  const normalizedPath = path.replace(/^\/+/, "");
  return normalizedPath ? `${base}/${normalizedPath}` : `${base}/`;
}
