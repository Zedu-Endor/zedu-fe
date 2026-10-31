import type { HomeFAQ } from "../faqData";

export type CompareLink = {
  label: string;
  href: string;
};

export type CompareRow = {
  area: string;
  zedu: string;
  other: string;
};

export type CompareUseCase = {
  title: string;
  otherText: string;
  zeduText: string;
  link?: CompareLink;
};

export type CompareContent = {
  slug: string;
  competitor: string;
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    keywords: string[];
  };
  hero: {
    accent: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  intro: {
    title: string;
    description: string;
    otherTitle: string;
    otherText: string;
    zeduTitle: string;
    zeduText: string;
    links: CompareLink[];
  };
  table: {
    title: string;
    description: string;
    rows: CompareRow[];
    footnote: string;
  };
  fits: {
    title: string;
    description: string;
    otherTitle: string;
    otherItems: string[];
    zeduItems: string[];
  };
  useCases: {
    description: string;
    items: CompareUseCase[];
    link?: CompareLink;
  };
  faq: {
    title: string;
    description: string;
    items: HomeFAQ[];
  };
  cta: {
    title: string;
    description: string;
    links: CompareLink[];
  };
};
