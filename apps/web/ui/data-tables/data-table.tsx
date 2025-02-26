import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableHero } from "./data-table-hero";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  actions?: React.ReactNode;
  defaultPageSize?: number;
  searchPlaceholder?: string;
  tableComponent?: (filteredData: TData[]) => React.ReactNode;
  enableRowSelection?: boolean;
  selectedRows?: TData[];
  onRowSelectionChange?: (rows: TData[]) => void;
}

export function DataTable<TData>({
  columns,
  data,
  actions,
  defaultPageSize = 8,
  searchPlaceholder = "Search...",
  tableComponent,
  enableRowSelection = false,
  selectedRows = [],
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
      rowSelection: enableRowSelection
        ? Object.fromEntries(selectedRows.map((row) => [(row as any).id, true]))
        : {},
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: enableRowSelection ? rowSelection : {},
    },
    enableRowSelection,
  });

  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedData = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelectionChange(selectedData);
    }
  }, [rowSelection]);

  return (
    <div className="w-full">
      <DataTableHero
        table={table}
        searchPlaceholder={searchPlaceholder}
        actions={actions}
      />
      {tableComponent?.(table.getRowModel().rows.map((row) => row.original))}
      <DataTablePagination table={table} />
    </div>
  );
}
