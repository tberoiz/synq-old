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
import { ChevronDown, MoreVertical, Trash2 } from "lucide-react";

import { Button } from "@synq/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
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
import { Sheet } from "@synq/ui/sheet";
import PurchaseDetailsSheet from "@ui/sheets/inventory/purchase-details-sheet";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { useToast } from "@synq/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@synq/ui/dialog";
import { CreatePurchaseDialog } from "@ui/dialogs/inventory/create-purchase-dialog";
import { type Purchase } from "@synq/supabase/queries";
import { cn } from "@synq/ui/utils";
import { Checkbox } from "@synq/ui/checkbox";
import { deletePurchase, updatePurchaseItem } from "@synq/supabase/queries";

export const columns: ColumnDef<Purchase>[] = [
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
    header: "Name",
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.getValue("items") as Purchase["items"];
      const archivedCount = items.filter(
        (item) => item.item.is_archived,
      ).length;
      return (
        <div className="flex items-center gap-2">
          <span>{items.length}</span>
          {archivedCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {archivedCount} archived
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString();
    },
  },
];

interface PurchasesDataTableProps {
  data: Purchase[];
}

export default function PurchasesDataTable({ data }: PurchasesDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedPurchase, setSelectedPurchase] =
    React.useState<Purchase | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] =
    React.useState<Purchase | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  const queryClient = useQueryClient();
  const supabase = createClient();
  const { toast } = useToast();

  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { mutate: deletePurchasesMutation } = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deletePurchase(supabase, id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_purchases"] });
      toast({ title: "Success", description: "Purchases deleted!" });
      table.toggleAllPageRowsSelected(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handlePurchaseCreated = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
  };

  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;

  return (
    <>
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter purchases..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex items-center gap-2 ml-auto">
            {hasSelectedRows && (
              <Button
                variant="destructive"
                onClick={() => {
                  const selectedIds = selectedRows.map(
                    (row) => row.original.id,
                  );
                  setPurchaseToDelete({ id: selectedIds[0] } as Purchase);
                }}
              >
                Delete Selected ({selectedRows.length})
              </Button>
            )}
            <CreatePurchaseDialog onSuccess={handlePurchaseCreated} />
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
                    onClick={() => setSelectedPurchase(row.original)}
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
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPurchaseToDelete(row.original);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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
        open={!!selectedPurchase}
        onOpenChange={(open) => !open && setSelectedPurchase(null)}
      >
        <PurchaseDetailsSheet
          purchase={selectedPurchase}
          isMobile={isMobile}
          onOpenChange={(open) => !open && setSelectedPurchase(null)}
          onDelete={async (id) => {
            await deletePurchase(supabase, id);
            await queryClient.invalidateQueries({
              queryKey: ["user_purchases"],
            });
            toast({ title: "Success", description: "Purchase deleted!" });
          }}
          onSaveBatch={async (updates) => {
            await Promise.all(
              updates.map((update) =>
                updatePurchaseItem(supabase, update.id, {
                  quantity: update.quantity,
                  unit_cost: update.unit_cost,
                }),
              ),
            );
            await queryClient.invalidateQueries({
              queryKey: ["user_purchases"],
            });
            toast({ title: "Success", description: "Purchase updated!" });
          }}
        />
      </Sheet>

      <Dialog
        open={!!purchaseToDelete}
        onOpenChange={(open) => !open && setPurchaseToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete Purchase{hasSelectedRows ? "s" : ""}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {hasSelectedRows ? "these purchases" : "this purchase"}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (purchaseToDelete) {
                  const ids = hasSelectedRows
                    ? selectedRows.map((row) => row.original.id)
                    : [purchaseToDelete.id];
                  deletePurchasesMutation(ids);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
