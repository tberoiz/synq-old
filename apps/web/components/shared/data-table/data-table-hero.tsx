import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "@synq/ui/input";
import { Search } from "lucide-react";

interface HeroProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  searchColumn?: string;
}

export function DataTableHero<TData>({
  table,
  searchPlaceholder = "Search...",
  actions,
  searchColumn = "name",
}: HeroProps<TData>) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-8"
          value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
          }
        />
      </div>
      {actions && <div className="ml-4">{actions}</div>}
    </div>
  );
}
