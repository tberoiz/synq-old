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
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8"
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
      {actions && <div className="ml-4">{actions}</div>}
    </div>
  );
}
