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
import {
  deletePurchase,
  updatePurchaseItem,
  archivePurchase,
  restorePurchase,
} from "@synq/supabase/queries";
import { Badge } from "@synq/ui/badge";

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
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name")}</span>
          <Badge
            variant="secondary"
            className={cn(
              row.original.status === "active" &&
                "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300",
              row.original.status === "archived" &&
                "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-950/20 dark:text-slate-300",
            )}
          >
            {row.original.status}
          </Badge>
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
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <span>{row.original.unique_items}</span>
          <span className="text-muted-foreground">/</span>
          <span>{row.original.total_quantity}</span>
        </div>
      );
    },
  },
  {
    id: "inventory",
    header: "Inventory",
    cell: ({ row }) => {
      const sold = row.original.sold_quantity;
      const total = row.original.total_quantity;
      const remaining = row.original.remaining_quantity;
      const sellThrough = row.original.sell_through_rate;

      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Remaining:</span>
            <span>{remaining}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {sellThrough}% sell through
          </div>
        </div>
      );
    },
  },
  {
    id: "financials",
    header: "Financials",
    cell: ({ row }) => {
      const cost = row.original.total_cost;
      const revenue = row.original.actual_revenue;
      const profit = row.original.actual_profit;
      const margin = row.original.profit_margin;

      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-green-600">${profit.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">
              ({margin}% margin)
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            ${revenue.toFixed(2)} rev / ${cost.toFixed(2)} cost
          </div>
        </div>
      );
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
  const [purchaseToArchive, setPurchaseToArchive] =
    React.useState<Purchase | null>(null);
  const [showArchived, setShowArchived] = React.useState(false);
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

  const { mutate: archivePurchasesMutation } = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => archivePurchase(supabase, id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_purchases"] });
      toast({ title: "Success", description: "Purchases archived!" });
      table.toggleAllPageRowsSelected(false);
      setPurchaseToArchive(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const { mutate: restorePurchasesMutation } = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => restorePurchase(supabase, id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_purchases"] });
      toast({ title: "Success", description: "Purchases restored!" });
      table.toggleAllPageRowsSelected(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const filteredData = React.useMemo(() => {
    return data.filter((purchase) => {
      if (showArchived) {
        return purchase.status === "archived";
      }
      return purchase.status !== "archived";
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
                    (row) => row.original.id,
                  );
                  const firstSelected = selectedRows[0]?.original;
                  if (firstSelected && firstSelected.status === "archived") {
                    restorePurchasesMutation(selectedIds);
                  } else {
                    setPurchaseToArchive({ id: selectedIds[0] } as Purchase);
                  }
                }}
              >
                {selectedRows[0]?.original.status === "archived" ? (
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
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {row.original.status === "archived" ? (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                restorePurchasesMutation([row.original.id]);
                              }}
                            >
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              Restore
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setPurchaseToArchive(row.original);
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
        open={!!purchaseToArchive}
        onOpenChange={(open) => !open && setPurchaseToArchive(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Archive Purchase{hasSelectedRows ? "s" : ""}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to archive{" "}
              {hasSelectedRows ? "these purchases" : "this purchase"}? Archived
              purchases will no longer appear in the active list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPurchaseToArchive(null)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (purchaseToArchive) {
                  const ids = hasSelectedRows
                    ? selectedRows.map((row) => row.original.id)
                    : [purchaseToArchive.id];
                  archivePurchasesMutation(ids);
                  setPurchaseToArchive(null);
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
