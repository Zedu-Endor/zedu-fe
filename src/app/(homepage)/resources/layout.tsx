import type { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides, case studies, templates and webinars to help universities, schools, and bootcamps run better learning communities with Zedu.",
  openGraph: {
    title: "Zedu Resources - Guides and Webinars for Learning Teams",
    description:
      "Explore guides, case studies, templates and webinars that help educators and administrators run structured learning communities.",
    url: siteUrl("/resources"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu resources for modern learning teams",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu Resources - Guides and Webinars for Learning Teams",
    description:
      "Guides, case studies, templates and webinars for educators running structured learning communities.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/resources"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
