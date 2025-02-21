"use client";
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { Skeleton } from "@synq/ui/skeleton";
import { cn } from "@synq/ui/utils";
import { UserAcquisitionBatch } from "@synq/supabase/models/inventory";
import { BatchRowSettingsButton } from "@ui/dialogs/batch-row-settings-button";
import { LayoutGrid, TableProperties } from "lucide-react";
import { AcquisitionBatchesGrid } from "@ui/grids/acquisition-batches-grid";
import { BatchDetailsSheet } from "@ui/sheets/batch-details-sheet";

interface BatchesTableProps {
  batches: UserAcquisitionBatch[];
  isFetching: boolean;
  selectedBatch: UserAcquisitionBatch | null;
  onBatchClick: (batch: any) => void;
}

export function AcquisitionBatchesTable({
  batches,
  isFetching,
  selectedBatch,
  onBatchClick,
}: BatchesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [layout, setLayout] = React.useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const itemsPerPage = 4;

  const table = useReactTable({
    data: batches,
    columns: batchColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: itemsPerPage,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  // Pagination logic for grid layout
  const paginatedBatches = React.useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return batches.slice(start, end);
  }, [batches, currentPage]);

  const totalPages = Math.ceil(batches.length / itemsPerPage);

  const handleNextPage = () => {
    if (layout === "table") {
      table.nextPage();
    } else {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    }
  };

  const handlePreviousPage = () => {
    if (layout === "table") {
      table.previousPage();
    } else {
      setCurrentPage((prev) => Math.max(prev - 1, 0));
    }
  };

  // Handle row click to open the sheet
  const handleRowClick = (batch: UserAcquisitionBatch) => {
    onBatchClick(batch);
    setIsSheetOpen(true);
  };

  return (
    <div className="w-full">
      {/* Search and Layout Toggle */}
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search batches..."
          className="max-w-sm mr-2"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
        />
        <div>
          <Button variant="outline" onClick={() => setLayout("grid")}>
            <LayoutGrid />
          </Button>
          <Button variant="outline" onClick={() => setLayout("table")}>
            <TableProperties />
          </Button>
        </div>
      </div>

      {/* Conditional Rendering based on Layout */}
      {layout === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell
                    colSpan={batchColumns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <span>Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "cursor-pointer transition",
                      selectedBatch?.id === row.original.id
                        ? "bg-primary/10"
                        : "",
                    )}
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={batchColumns.length}
                    className="h-24 text-center"
                  >
                    No batches found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <AcquisitionBatchesGrid
          batches={paginatedBatches}
          selectedBatch={selectedBatch}
          currentPage={currentPage}
          totalPages={totalPages}
          onBatchClick={handleRowClick}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      )}

      {/* Batch Details Sheet */}
      <BatchDetailsSheet
        batch={selectedBatch}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}

/** Columns Definition for Batches */
const batchColumns: ColumnDef<UserAcquisitionBatch>[] = [
  {
    accessorKey: "name",
    header: "Batch Name",
  },
  {
    accessorKey: "item_count",
    header: "Items",
    cell: ({ row }) => row.getValue("item_count") ?? 0,
  },
  {
    accessorKey: "total_cogs",
    header: "Total COGS",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(row.getValue("total_cogs") ?? 0),
  },
  {
    accessorKey: "total_listing_price",
    header: "Total Listing Price",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(row.getValue("total_listing_price") ?? 0),
  },
  {
    accessorKey: "total_profit",
    header: "Total Profit",
    cell: ({ row }) => {
      const totalProfit = row.getValue("total_profit") ?? 0;
      return (
        <span
          className={
            Number(totalProfit) >= 0 ? "text-green-500" : "text-red-500"
          }
        >
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalProfit as number)}
        </span>
      );
    },
  },
  {
    accessorKey: "Actions",
    header: "",
    cell: ({ row }) => <BatchRowSettingsButton batchId={row.original.id} />,
  },
];
