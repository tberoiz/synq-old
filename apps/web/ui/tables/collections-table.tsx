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
import { UserCollection } from "@synq/supabase/models/inventory";
import { LayoutGrid, TableProperties } from "lucide-react";
import { CollectionsGrid } from "@ui/grids/collections-grid";
import { CollectionDetailsSheet } from "@ui/sheets/collection-details-sheet";

interface CollectionsTableProps {
  collections: UserCollection[];
  isFetching: boolean;
  selectedCollection: UserCollection | null;
  onCollectionClick: (collection: UserCollection) => void;
}

export function CollectionsTable({
  collections,
  isFetching,
  selectedCollection,
  onCollectionClick,
}: CollectionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [layout, setLayout] = React.useState<"table" | "grid">("table");
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const table = useReactTable({
    data: collections,
    columns: collectionColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  // Handle row click to open the sheet
  const handleRowClick = (collection: UserCollection) => {
    onCollectionClick(collection);
    setIsSheetOpen(true);
  };

  return (
    <div className="w-full">
      {/* Search and Layout Toggle */}
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search collections..."
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
                    colSpan={collectionColumns.length}
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
                      selectedCollection?.id === row.original.id
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
                    colSpan={collectionColumns.length}
                    className="h-24 text-center"
                  >
                    No collections found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <CollectionsGrid
          collections={collections}
          isFetching={isFetching}
          selectedCollection={selectedCollection}
          onCollectionClick={handleRowClick}
        />
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
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

      {/* Collection Details Sheet */}
      <CollectionDetailsSheet
        collection={selectedCollection}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}

/** Columns Definition for Collections */
const collectionColumns: ColumnDef<UserCollection>[] = [
  {
    accessorKey: "name",
    header: "Collection Name",
  },
  {
    accessorKey: "itemCount",
    header: "Items",
    cell: ({ row }) => row.getValue("itemCount") ?? 0,
  },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(row.getValue("totalValue") ?? 0),
  },
  {
    accessorKey: "totalProfit",
    header: "Total Profit",
    cell: ({ row }) => {
      const totalProfit = row.getValue("totalProfit") ?? 0;
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
];
