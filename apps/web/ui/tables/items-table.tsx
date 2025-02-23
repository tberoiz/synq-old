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
import { Sheet, SheetTrigger, SheetContent } from "@synq/ui/sheet";
import { Skeleton } from "@synq/ui/skeleton";
import ItemDetailsSheetContent from "@ui/sheets/item-details-sheet";
import { UserInventory } from "@synq/supabase/models/inventory";
import { LayoutGrid, TableProperties } from "lucide-react";
import { ItemsGrid } from "@ui/grids/items-grid";
import { NewSalesBatchDialog } from "@ui/dialogs/create-sales-batch-dialog";
import { BatchRowSettingsButton } from "@ui/dialogs/batch-row-settings-button";
import { ItemRowSettingsButton } from "@ui/dialogs/items-row-settings-button";

interface CardTableProps {
  data: UserInventory[];
  loading?: boolean;
}

export function ItemsTable({ data, loading }: CardTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [layout, setLayout] = React.useState<"table" | "grid">("table");
  const [selectedItems, setSelectedItems] = React.useState<UserInventory[]>([]);

  const handleSelectItem = (item: UserInventory) => {
    setSelectedItems(
      (prev) =>
        prev.some((i) => i.id === item.id)
          ? prev.filter((i) => i.id !== item.id)
          : [...prev, item]
    );
  };

  const handleCreateBatch = (batchData: any) => {
    console.log("Batch Data:", batchData);
    console.log("Selected Items:", selectedItems);
    // Save batch logic here
  };

  // Define columns as before.
  const itemColumns: ColumnDef<UserInventory>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            selectedItems.length === table.getRowModel().rows.length &&
            table.getRowModel().rows.length > 0
          }
          onCheckedChange={(value) => {
            if (value) {
              // When checked, select all rows by updating the custom state.
              setSelectedItems(table.getRowModel().rows.map(row => row.original));
            } else {
              // Deselect all
              setSelectedItems([]);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedItems.some((i) => i.id === row.original.id)}
            onCheckedChange={() => handleSelectItem(row.original)}
            aria-label="Select row"
          />
        </div>
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
          <NewSalesBatchDialog
            selectedItems={selectedItems}
            onCreateBatch={handleCreateBatch}
          />
        </div>
      </div>

      {/* Conditional Rendering: Table or Grid */}
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
                        header.column.id === "select"
                          ? "text-center"
                          : header.column.id === "name"
                            ? "text-left"
                            : "text-center"
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
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
                    // Wrap each row in its own Sheet with the TableRow acting as trigger.
                    <Sheet key={row.id}>
                      <SheetTrigger asChild>
                        <TableRow className="cursor-pointer transition">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={
                                cell.column.id === "select"
                                  ? "text-center"
                                  : cell.column.id === "name"
                                    ? "text-left"
                                    : "text-center"
                              }
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </SheetTrigger>
                      <SheetContent
                        side="right"
                        className="w-full max-w-2xl overflow-y-auto"
                      >
                        <ItemDetailsSheetContent item={row.original} />
                      </SheetContent>
                    </Sheet>
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
        <ItemsGrid data={data} onItemClick={() => {}} />
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
    </div>
  );
}
