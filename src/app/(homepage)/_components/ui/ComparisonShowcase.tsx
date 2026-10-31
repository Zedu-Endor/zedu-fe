import { Check, X } from "lucide-react";
import { ArrowBtn } from "~/app/(homepage)/_components/ui/Button";
import { cn } from "~/lib/utils";

type ComparisonShowcaseProps = {
  withoutTitle: string;
  withoutItems: string[];
  withTitle: string;
  withItems: string[];
  ctaText: string;
  ctaHref: string;
  className?: string;
  wrapperClassName?: string;
  withoutPanelClassName?: string;
  withPanelClassName?: string;
  ctaContainerClassName?: string;
  withoutIcon?: "x" | "check";
};

export const ComparisonShowcase = ({
  withoutTitle = "Without Zedu",
  withoutItems,
  withTitle = "With Zedu",
  withItems,
  ctaText = "Book a demo",
  ctaHref = "/contact-sales",
  className,
  wrapperClassName,
  withoutPanelClassName,
  withPanelClassName,
  ctaContainerClassName,
  withoutIcon = "x",
}: ComparisonShowcaseProps) => {
  const WithoutIcon = withoutIcon === "check" ? Check : X;

  return (
    <div className={cn("mx-auto w-full max-w-7xl", className)}>
      <div
        className={cn(
          "grid w-full grid-cols-1 gap-4 overflow-hidden rounded-3xl bg-primary-500 p-3 sm:px-6 sm:py-4 md:grid-cols-2 md:gap-0",
          wrapperClassName
        )}
      >
        <div
          className={cn(
            "space-y-3 px-6 py-8 text-white md:rounded-none",
            withoutPanelClassName
          )}
        >
          <h3 className="text-lg font-semibold">{withoutTitle}</h3>
          <ul className="ml-2 space-y-3">
            {withoutItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <WithoutIcon size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={cn(
            "space-y-3 rounded-3xl border border-neutral-200 bg-white px-6 py-8",
            withPanelClassName
          )}
        >
          <h3 className="text-lg font-semibold text-[#1f2530]">{withTitle}</h3>
          <ul className="ml-2 space-y-3">
            {withItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check
                  size={18}
                  className="mt-0.5 flex-shrink-0 text-primary-500"
                />
                <span className="text-sm leading-relaxed text-neutral-600">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div
            className={cn(
              "ml-2 mt-8 flex justify-start",
              ctaContainerClassName
            )}
          >
            <ArrowBtn text={ctaText} href={ctaHref} />
          </div>
        </div>
      </div>
    </div>
  );
};
