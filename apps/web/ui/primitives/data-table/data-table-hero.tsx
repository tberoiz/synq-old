import { Input } from "@synq/ui/input";
import { Table } from "@tanstack/react-table";

interface HeroProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

export function DataTableHero<TData>({
  table,
  searchPlaceholder = "Search...",
  actions,
}: HeroProps<TData>) {
  return (
    <div className="flex flex-row items-center justify-between gap-2 py-4">
      <Input
        placeholder={searchPlaceholder}
        className="max-w-sm flex-1"
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
      />
      <div className="flex gap-2">{actions}</div>
    </div>
  );
}
