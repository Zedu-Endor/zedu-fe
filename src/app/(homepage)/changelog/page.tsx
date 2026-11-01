import type { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import Image from "next/image";
import { DynamicFooter } from "../_components/footer/dynamic-footer";
import { ArrowBtn } from "../_components/ui/Button";

const changelogEntries = [
  {
    date: "Nov 1, 2026",
    title: "Osprey contributor cards use Telex logo as every contributor's picture",
    description:
      "Fixed contributor cards showing the old Telex logo as every contributor's profile picture. Replaced with contributor initials using the Avatar component, removing leftover Telex branding from the contributors page.",
  },
  {
    date: "Nov 1, 2026",
    title: "Add a public What's new (changelog) page",
    description:
      "Created a static marketing page at /changelog listing recent product entries (features, improvements, fixes) to give users and schools something to share, showing the product is active and providing a link to share when a feature ships.",
  },
];

export const metadata: Metadata = {
  title: "Changelog - Zedu",
  description:
    "View recent product updates, features, improvements, and fixes for Zedu - the AI-powered education platform for bootcamps, schools, and cohorts.",
  keywords: [
    "Zedu changelog",
    "product updates",
    "release notes",
    "Zedu features",
    "education platform updates",
  ],
  openGraph: {
    title: "Changelog - Zedu",
    description:
      "View recent product updates, features, improvements, and fixes for Zedu - the AI-powered education platform for bootcamps, schools, and cohorts.",
    url: siteUrl("/changelog"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu changelog page",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog - Zedu",
    description:
      "View recent product updates, features, improvements, and fixes for Zedu - the AI-powered education platform for bootcamps, schools, and cohorts.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/changelog"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

const ChangelogPage = () => {
  return (
    <div className="min-h-screen">
      <section className="relative isolate flex w-full flex-col items-center gap-4 overflow-hidden px-4 py-10 text-center sm:gap-6 sm:px-8 sm:py-16 lg:gap-8 lg:px-12 mt-10">
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-4xl md:text-5xl text-center">
          What's New at Zedu
        </h1>
        <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[45%] lg:text-lg">
          Browse recent product updates, features, improvements, and fixes.
        </p>
      </section>

      <section className="w-full px-4 pt-10 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-3xl text-left">
          {changelogEntries.map((entry) => (
            <div
              key={entry.date}
              className="w-full rounded-xl border border-neutral-200 bg-white p-6 mb-8 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-neutral-500 text-sm capitalize">
                  {entry.date}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">
                {entry.title}
              </h2>
              <p className="text-neutral-600 text-base leading-relaxed">
                {entry.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <DynamicFooter
        text="Start Building Structured Learning Today"
        description="Create organized channels, manage cohorts, and bring AI into your learning environment."
      />
    </div>
  );
};

export default ChangelogPage;