import { cn } from "~/lib/utils";
import type { CompareRow } from "../../_lib/compare/types";

type ComparisonTableProps = {
  competitor: string;
  rows: CompareRow[];
};

const cellClass =
  "px-4 py-3.5 align-top text-[13px] leading-relaxed text-[#5a6170] before:mb-1 before:block before:text-xs before:font-black before:tracking-wide before:content-[attr(data-label)] md:px-6 md:py-5 md:text-sm md:before:hidden";

export const ComparisonTable = ({ competitor, rows }: ComparisonTableProps) => {
  return (
    <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-[#E6E6EC] bg-white">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Zedu and {competitor} compared by feature area
        </caption>
        <thead className="hidden bg-[#F9F6FD] md:table-header-group">
          <tr>
            <th
              scope="col"
              className="w-1/5 px-6 py-4 text-sm font-semibold text-[#1f2530]"
            >
              Area
            </th>
            <th
              scope="col"
              className="px-6 py-4 text-sm font-semibold text-primary-500"
            >
              Zedu
            </th>
            <th
              scope="col"
              className="px-6 py-4 text-sm font-semibold text-[#1f2530]"
            >
              {competitor}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.area}
              className="grid grid-cols-2 border-t border-[#E6E6EC] first:border-t-0 md:table-row md:first:border-t"
            >
              <th
                scope="row"
                className="col-span-2 bg-[#F9F6FD] px-4 py-3.5 text-sm font-semibold text-[#1f2530] md:bg-transparent md:px-6 md:py-5"
              >
                {row.area}
              </th>
              <td
                data-label="Zedu"
                className={cn(cellClass, "before:text-primary-500")}
              >
                {row.zedu}
              </td>
              <td
                data-label={competitor}
                className={cn(
                  cellClass,
                  "border-l border-[#E6E6EC] before:text-[#1f2530] md:border-l-0"
                )}
              >
                {row.other}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
