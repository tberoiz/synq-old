"use client";

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

import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  actions: React.ReactNode;
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

  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedData = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelectionChange(selectedData);
    }
  }, [rowSelection]);

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

  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-between gap-2 py-4">
        <Input
          placeholder={searchPlaceholder}
          className="max-w-sm flex-1"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
        />
        <div className="flex gap-2">
          {actions}
        </div>
      </div>

      {tableComponent?.(table.getRowModel().rows.map((row) => row.original))}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[8, 16, 24, 32, 40].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
