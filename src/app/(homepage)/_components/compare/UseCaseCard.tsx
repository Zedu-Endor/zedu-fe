import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CompareUseCase } from "../../_lib/compare/types";

type UseCaseCardProps = CompareUseCase & {
  competitor: string;
};

export const UseCaseCard = ({
  title,
  competitor,
  otherText,
  zeduText,
  link,
}: UseCaseCardProps) => {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-[#F5F5F5] p-6 text-left sm:p-8">
      <h3 className="text-lg font-semibold text-[#1f2530]">{title}</h3>
      <div className="space-y-1">
        <p className="text-xs font-black tracking-wide text-[#1f2530]">
          On {competitor}
        </p>
        <p className="text-sm leading-relaxed text-[#5a6170]">{otherText}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-black tracking-wide text-primary-500">
          On Zedu
        </p>
        <p className="text-sm leading-relaxed text-[#5a6170]">{zeduText}</p>
      </div>
      {link && (
        <Link
          href={link.href}
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary-500 hover:underline"
        >
          {link.label}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};
