import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { ArrowBtn, OutlineBtn } from "~/app/(homepage)/_components/ui/Button";
import { ComparisonShowcase } from "~/app/(homepage)/_components/ui/ComparisonShowcase";
import { FAQSection } from "../../_components/home/FAQSection";
import { DynamicFooter } from "../../_components/footer/dynamic-footer";
import { ComparisonTable } from "../../_components/compare/ComparisonTable";
import { UseCaseCard } from "../../_components/compare/UseCaseCard";
import { comparisons, type CompareContent } from "../../_lib/compare";
import type { CompareLink } from "../../_lib/compare/types";

// schema.org's fixed vocabulary identifier required by JSON-LD (not a Zedu
// URL, so it is not an environment value).
const SCHEMA_CONTEXT = ["https:", "schema.org"].join("//");

type ComparePageProps = {
  params: Promise<{ slug: string }>;
};

const headingClass =
  "text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]";
const sectionClass =
  "relative isolate overflow-hidden space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(comparisons).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = comparisons[slug];
  if (!content) return {};

  const { meta } = content;
  const url = siteUrl(`/compare/${slug}`);

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.ogTitle,
      description: meta.description,
      url,
      siteName: "Zedu",
      images: [
        {
          url: ogImageUrl("og-image-5.png"),
          width: 1200,
          height: 630,
          alt: meta.ogTitle,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.description,
      images: [ogImageUrl("og-image-5.png")],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    category: "education",
    applicationName: "Zedu",
    creator: "Zedu",
    publisher: "Zedu",
  };
}

function getStructuredData(content: CompareContent) {
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: content.faq.items.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `Zedu vs ${content.competitor}`,
            item: siteUrl(`/compare/${content.slug}`),
          },
        ],
      },
    ],
  };
}

const LinkList = ({
  label,
  links,
}: {
  label: string;
  links: CompareLink[];
}) => (
  <p className="text-sm text-[#5a6170]">
    {label}{" "}
    {links.map((link, index) => (
      <span key={link.href}>
        {index > 0 && " · "}
        <Link
          href={link.href}
          className="font-semibold text-primary-500 hover:underline"
        >
          {link.label}
        </Link>
      </span>
    ))}
  </p>
);

const ComparePage = async ({ params }: ComparePageProps) => {
  const { slug } = await params;
  const content = comparisons[slug];
  if (!content) notFound();

  const { competitor, hero, intro, table, fits, useCases, faq, cta } = content;
  const structuredData = JSON.stringify(getStructuredData(content)).replace(
    /</g,
    "\\u003c"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[30%] w-screen -translate-x-1/2 bg-gradient-to-t from-blue-50/30 to-white"
        />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-12 lg:py-14">
          <div className="flex flex-col items-center gap-5 text-center lg:max-w-[500px] lg:items-start lg:text-left">
            <h1 className={headingClass}>
              <span className="text-primary-500">{hero.accent}</span>{" "}
              {hero.title}
            </h1>
            <p className="max-w-[52ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
              {hero.description}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#5a6170] lg:justify-start">
              <div
                className="flex items-center gap-0.5"
                role="img"
                aria-label="Rated 4.9 out of 5"
              >
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <Star
                      key={index}
                      color="gold"
                      fill="gold"
                      size={14}
                      aria-hidden="true"
                    />
                  ))}
              </div>
              <span className="font-semibold text-[#1f2530]">4.9</span>
              <span className="text-[#8a90a0]">|</span>
              <span>Users love us</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowBtn text="Book a Demo" href="/contact-sales" />
              <OutlineBtn text="Start for Free" href="/auth/sign-up" />
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-3xl">
            <div className="relative aspect-[16/11] w-full sm:aspect-[4/3] lg:aspect-[16/10]">
              <Image
                src={hero.image}
                alt={hero.imageAlt}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 680px"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className={headingClass}>{intro.title}</h2>
          <p className="max-w-2xl text-sm text-neutral-600 sm:text-base lg:text-lg">
            {intro.description}
          </p>
        </div>
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#1f2530]">
              {intro.otherTitle}
            </h3>
            <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
              {intro.otherText}
            </p>
          </div>
          <div className="space-y-3 border-t border-[#E6E6EC] pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            <h3 className="text-lg font-semibold text-[#1f2530]">
              {intro.zeduTitle}
            </h3>
            <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
              {intro.zeduText}
            </p>
            <LinkList label="See Zedu for" links={intro.links} />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className={headingClass}>{table.title}</h2>
          <p className="max-w-2xl text-sm text-neutral-600 sm:text-base lg:text-lg">
            {table.description}
          </p>
        </div>
        <ComparisonTable competitor={competitor} rows={table.rows} />
        <p className="mx-auto max-w-6xl text-xs leading-relaxed text-[#63636E] sm:text-[13px]">
          {table.footnote}
        </p>
      </section>

      <section className={sectionClass}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className={headingClass}>{fits.title}</h2>
          <p className="max-w-2xl text-sm text-neutral-600 sm:text-base lg:text-lg">
            {fits.description}
          </p>
        </div>
        <ComparisonShowcase
          withoutTitle={fits.otherTitle}
          withoutItems={fits.otherItems}
          withoutIcon="check"
          withTitle="When Zedu may be a better fit"
          withItems={fits.zeduItems}
          ctaText="Book a Demo"
          ctaHref="/contact-sales"
        />
      </section>

      <section className={sectionClass}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className={headingClass}>Use Cases, Side by Side</h2>
          <p className="max-w-2xl text-sm text-neutral-600 sm:text-base lg:text-lg">
            {useCases.description}
          </p>
        </div>
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2">
          {useCases.items.map((item) => (
            <UseCaseCard key={item.title} competitor={competitor} {...item} />
          ))}
        </div>
        {useCases.link && (
          <div className="flex justify-center">
            <ArrowBtn text={useCases.link.label} href={useCases.link.href} />
          </div>
        )}
      </section>

      <FAQSection
        faqs={faq.items}
        title={faq.title}
        accent="Your Questions Answered"
        description={faq.description}
        headingAs="h2"
      />

      <DynamicFooter
        text={cta.title}
        description={cta.description}
        headingAs="h2"
      >
        <LinkList label="Explore Zedu for" links={cta.links} />
      </DynamicFooter>
    </>
  );
};

export default ComparePage;
