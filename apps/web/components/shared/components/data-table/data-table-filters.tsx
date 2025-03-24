import { Table } from "@tanstack/react-table";
import { Input } from "@synq/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";
import React, { useEffect, useState } from "react";

interface HeroProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  searchColumn?: string;
  onSearch?: (term: string) => void;
  filterComponent?: React.ReactNode;
}

export function DataTableFilters<TData>({
  table,
  searchPlaceholder = "Search...",
  actions,
  searchColumn = "name",
  onSearch,
  filterComponent,
}: HeroProps<TData>) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue] = useDebounce(searchValue, 300);

  useEffect(() => {
    onSearch?.(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8 w-full"
            value={searchValue}
            onChange={(event) => {
              const value = event.target.value;
              setSearchValue(value);
              table.getColumn(searchColumn)?.setFilterValue(value);
            }}
          />
        </div>
        {filterComponent}
      </div>
      {actions && <div className="w-full sm:w-auto">{actions}</div>}
    </div>
  );
}
