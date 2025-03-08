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
import { ChevronDown, MoreVertical, Archive, RefreshCcw } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

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
import { Checkbox } from "@synq/ui/checkbox";
import { Badge } from "@synq/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@synq/ui/dialog";
import { Sheet } from "@synq/ui/sheet";

export type Item = ItemViewWithPurchaseBatches;

export const columns: ColumnDef<Item>[] = [
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
    accessorKey: "item_name",
    header: () => <div className="w-[35%]">Name</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 w-[35%]">
        <div className="truncate font-medium">{row.getValue("item_name")}</div>
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
    accessorKey: "is_archived",
    header: "Status",
    cell: ({ row }) => {
      const isArchived = row.getValue("is_archived") as boolean;
      return (
        <Badge variant={isArchived ? "secondary" : "outline"}>
          {isArchived ? "archived" : "active"}
        </Badge>
      );
    },
  },
];

interface ItemsDataTableProps {
  data: Item[];
}

export default function ItemsDataTable({ data }: ItemsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);
  const [itemToArchive, setItemToArchive] = React.useState<Item | null>(null);
  const [showArchived, setShowArchived] = React.useState(false);

  const queryClient = useQueryClient();
  const supabase = createClient();
  const { toast } = useToast();

  const { mutate: archiveItemsMutation } = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) => {
          const item = data.find((i) => i.item_id === id);
          if (!item) throw new Error("Item not found");
          return updateItemDetails(supabase, id, {
            name: item.item_name!,
            sku: item.sku,
            default_cogs: item.default_cogs!,
            listing_price: item.listing_price!,
            inventory_group_id: item.inventory_group_id!,
            is_archived: true,
          });
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
      toast({ title: "Success", description: "Items archived!" });
      table.toggleAllPageRowsSelected(false);
      setItemToArchive(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const { mutate: restoreItemsMutation } = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) => {
          const item = data.find((i) => i.item_id === id);
          if (!item) throw new Error("Item not found");
          return updateItemDetails(supabase, id, {
            name: item.item_name!,
            sku: item.sku,
            default_cogs: item.default_cogs!,
            listing_price: item.listing_price!,
            inventory_group_id: item.inventory_group_id!,
            is_archived: false,
          });
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
      toast({ title: "Success", description: "Items restored!" });
      table.toggleAllPageRowsSelected(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      if (showArchived) {
        return item.is_archived;
      }
      return !item.is_archived;
    });
  }, [data, showArchived]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;

  return (
    <>
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
            <Button
              variant="outline"
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? "Show Active" : "Show Archived"}
            </Button>
            {hasSelectedRows && (
              <Button
                variant="outline"
                onClick={() => {
                  const selectedIds = selectedRows.map(
                    (row) => row.original.item_id!,
                  );
                  const firstSelected = selectedRows[0]?.original;
                  if (firstSelected && firstSelected.is_archived) {
                    restoreItemsMutation(selectedIds);
                  } else {
                    setItemToArchive({ item_id: selectedIds[0] } as Item);
                  }
                }}
              >
                {selectedRows[0]?.original.is_archived ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Restore Selected ({selectedRows.length})
                  </>
                ) : (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Selected ({selectedRows.length})
                  </>
                )}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
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
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer bg-secondary hover:bg-muted/50"
                    onClick={() => setSelectedItem(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {row.original.is_archived ? (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                restoreItemsMutation([row.original.item_id!]);
                              }}
                            >
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              Restore
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToArchive(row.original);
                              }}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
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
      </div>

      <Sheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <ItemDetailsSheet
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      </Sheet>

      <Dialog
        open={!!itemToArchive}
        onOpenChange={(open) => !open && setItemToArchive(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Item{hasSelectedRows ? "s" : ""}</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive{" "}
              {hasSelectedRows ? "these items" : "this item"}? Archived items
              will no longer appear in the active list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToArchive(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (itemToArchive) {
                  const ids = hasSelectedRows
                    ? selectedRows.map((row) => row.original.item_id!)
                    : [itemToArchive.item_id!];
                  archiveItemsMutation(ids);
                  setItemToArchive(null);
                }
              }}
            >
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
