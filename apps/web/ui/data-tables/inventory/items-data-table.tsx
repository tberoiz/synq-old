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
import { ChevronDown, CheckSquare, Archive } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@synq/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@synq/ui/dropdown-menu";
import { Input } from "@synq/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import ItemDetailsSheet from "@ui/sheets/inventory/item-details-sheet";
import {
  type ItemViewWithPurchaseBatches,
  updateItemDetails,
} from "@synq/supabase/queries";
import { createClient } from "@synq/supabase/client";
import { useToast } from "@synq/ui/use-toast";
import { cn } from "@synq/ui/utils";

export type Item = ItemViewWithPurchaseBatches;

export const columns: ColumnDef<Item>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <CheckSquare
          className={`h-4 w-4 cursor-pointer ${table.getIsAllPageRowsSelected() ? "text-primary" : "text-muted-foreground"}`}
          onClick={() =>
            table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected())
          }
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10" onClick={(e) => e.stopPropagation()}>
        <CheckSquare
          className={`h-4 w-4 cursor-pointer ${row.getIsSelected() ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => row.toggleSelected(!row.getIsSelected())}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "item_name",
    header: () => <div className="w-[35%]">Name</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 w-[35%]">
        <div className="truncate font-medium">{row.getValue("item_name")}</div>
        {row.original.is_archived && (
          <span className="shrink-0 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Archived
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "sku",
    header: () => <div className="w-24">SKU</div>,
    cell: ({ row }) => (
      <div className="w-24 truncate">{row.getValue("sku")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: () => <div className="w-28">Category</div>,
    cell: ({ row }) => (
      <div className="w-28 truncate">{row.getValue("category")}</div>
    ),
  },
  {
    accessorKey: "listing_price",
    header: () => <div className="w-16 text-right">Price</div>,
    cell: ({ row }) => (
      <div className="w-16 text-right">${row.getValue("listing_price")}</div>
    ),
  },
  {
    accessorKey: "total_quantity",
    header: () => <div className="w-16 text-right">Stock</div>,
    cell: ({ row }) => (
      <div className="w-16 text-right">{row.getValue("total_quantity")}</div>
    ),
  },
  {
    accessorKey: "total_sold",
    header: () => <div className="w-16 text-right">Sold</div>,
    cell: ({ row }) => (
      <div className="w-16 text-right">{row.getValue("total_sold")}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="w-10"></div>,
    cell: ({ row }) => {
      const item = row.original;
      const supabase = createClient();
      const { toast } = useToast();
      const queryClient = useQueryClient();

      const handleArchive = async () => {
        try {
          await updateItemDetails(supabase, item.item_id!, {
            name: item.item_name!,
            sku: item.sku,
            listing_price: item.listing_price!,
            default_cogs: item.default_cogs!,
            inventory_group_id: item.inventory_group_id!,
            is_archived: true,
          });
          await queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
          toast({ title: "Success", description: "Item archived!" });
        } catch (error: any) {
          toast({ title: "Error", description: error.message });
        }
      };

      const handleRestore = async () => {
        try {
          await updateItemDetails(supabase, item.item_id!, {
            name: item.item_name!,
            sku: item.sku,
            listing_price: item.listing_price!,
            default_cogs: item.default_cogs!,
            inventory_group_id: item.inventory_group_id!,
            is_archived: false,
          });
          await queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
          toast({ title: "Success", description: "Item restored!" });
        } catch (error: any) {
          toast({ title: "Error", description: error.message });
        }
      };

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {item.is_archived ? (
                <DropdownMenuItem onClick={handleRestore}>
                  <Archive className="mr-2 h-4 w-4" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

interface ItemsDataTableProps {
  data: Item[];
  actions?: React.ReactNode;
  onSelectionChange?: (selectedItems: Item[]) => void;
  includeArchived?: boolean;
}

export default function ItemsDataTable({
  data,
  actions,
  onSelectionChange,
  includeArchived = false,
}: ItemsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);
  const queryClient = useQueryClient();

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
    onRowSelectionChange: (updatedSelection) => {
      setRowSelection(updatedSelection);
      if (onSelectionChange) {
        const selectedData = table
          .getSelectedRowModel()
          .rows.map((row) => row.original);
        onSelectionChange(selectedData);
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter items..."
          value={
            (table.getColumn("item_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("item_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2 ml-auto">
          {actions}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "cursor-pointer bg-secondary/50 hover:bg-primary/10",
                    row.original.is_archived && "opacity-50",
                  )}
                  onClick={(e) => {
                    // Don't open sheet if clicking on actions column
                    const target = e.target as HTMLElement;
                    if (target.closest('[data-column-id="actions"]')) {
                      return;
                    }
                    setSelectedItem(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} data-column-id={cell.column.id}>
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
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

      {/* Item Details Sheet */}
      <ItemDetailsSheet
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </div>
  );
}
