import type { ReactNode } from "react";
import { ArrowBtn, OutlineBtn } from "../ui/Button";

export const DynamicFooter = ({
  text,
  description,
  headingAs: Heading = "h1",
  children,
}: {
  text: string;
  description: string;
  headingAs?: "h1" | "h2";
  children?: ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center gap-5 bg-blue-50/30 px-4 py-12 text-center sm:gap-6 sm:px-8 sm:py-16">
      <Heading className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
        {text}
      </Heading>
      <p className="max-w-2xl text-base text-neutral-600">{description}</p>
      <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-2">
        <ArrowBtn
          text="Get started for free"
          className="w-full sm:w-auto"
          linkToHome
        />
        <OutlineBtn
          text="Contact Sales"
          className="w-full sm:w-auto"
          href="/contact-sales"
        />
      </div>
      {children}
    </div>
  );
};
