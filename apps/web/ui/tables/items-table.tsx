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
import { Checkbox } from "@synq/ui/checkbox";
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
import { Sheet, SheetContent } from "@synq/ui/sheet";
import { Skeleton } from "@synq/ui/skeleton";
import ItemDetailsSheetContent from "@ui/sheets/item-details-sheet";
import { UserInventory } from "@synq/supabase/models/inventory";
import { ItemRowSettingsButton } from "@ui/dialogs/items-row-settings-button";
import { LayoutGrid, TableProperties } from "lucide-react";
import { ItemsGrid } from "@ui/grids/items-grid";

interface CardTableProps {
  data: UserInventory[];
  loading?: boolean;
}

export function ItemsTable({ data, loading }: CardTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [selectedItem, setSelectedItem] = React.useState<any | null>(null);
  const [layout, setLayout] = React.useState<"table" | "grid">("table");

  const table = useReactTable({
    data,
    columns: itemColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  // Handle item click to open the sheet
  const handleItemClick = (item: UserInventory) => {
    setSelectedItem(item);
  };

  return (
    <div className="w-full">
      {/* Search and Layout Toggle */}
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search items..."
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
                    <TableHead
                      key={header.id}
                      className={
                        header.column.id === "name"
                          ? "text-left"
                          : "text-center"
                      }
                    >
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={itemColumns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <span>Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer transition"
                      onClick={() => handleItemClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === "name"
                              ? "text-left"
                              : "text-center"
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={itemColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <ItemsGrid data={data} onItemClick={handleItemClick} />
      )}

      {/* Item Details Sheet */}
      <Sheet
        open={!!selectedItem}
        onOpenChange={(isOpen) => !isOpen && setSelectedItem(null)}
      >
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto">
          <ItemDetailsSheetContent item={selectedItem} />
        </SheetContent>
      </Sheet>

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
    </div>
  );
}

/** Columns Definition */
export const itemColumns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Item Name",
    cell: ({ row }) => {
      const customName = row.original.custom_name;
      const globalCardName = row.original.global_card?.name;
      const name = customName || globalCardName || "Unnamed Item";
      return <span className="font-medium">{name}</span>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <span className="text-center">{row.getValue("quantity")}</span>
    ),
  },
  {
    accessorKey: "cogs",
    header: "COGS (Cost)",
    cell: ({ row }) => {
      const cogs = parseFloat(row.getValue("cogs")) || 0;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(cogs);
    },
  },
  {
    accessorKey: "listing_price",
    header: "Selling Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("listing_price")) || 0;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
    },
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => {
      const cogs = parseFloat(row.getValue("cogs")) || 0;
      const price = parseFloat(row.getValue("listing_price")) || 0;
      const profit = price - cogs;
      return (
        <span className={profit >= 0 ? "text-green-500" : "text-red-500"}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(profit)}
        </span>
      );
    },
  },
  {
    accessorKey: "Actions",
    header: "",
    cell: ({ row }) => <ItemRowSettingsButton itemId={row.original.id} />,
  },
];
