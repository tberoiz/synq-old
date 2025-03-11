"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Archive, RefreshCcw } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { Button } from "@synq/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@synq/ui/dropdown-menu";
import { Sheet } from "@synq/ui/sheet";
import { type ItemViewWithPurchaseBatches } from "@synq/supabase/types";
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
import { archiveItem, restoreItem } from "@synq/supabase/queries";
import ItemDetailsSheet from "@ui/modules/inventory/components/sheets/item-details-sheet";
import { DataTable } from "@ui/shared/data-table/data-table";

export type Item = ItemViewWithPurchaseBatches;

interface ItemsDataTableProps {
  data: Item[];
  actions?: React.ReactNode;
}

export default function ItemsDataTable({ data, actions }: ItemsDataTableProps) {
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = React.useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [itemToArchive, setItemToArchive] = React.useState<Item | null>(null);
  const [itemToRestore, setItemToRestore] = React.useState<Item | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const archiveMutation = useMutation({
    mutationFn: async (item: Item) => {
      if (!item.item_id) throw new Error("Item ID is required");
      const supabase = createClient();
      await archiveItem(supabase, item.item_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
      toast({
        title: "Success",
        description: "Item archived successfully",
      });
      setIsArchiveDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error archiving item:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to archive item",
        variant: "destructive",
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (item: Item) => {
      if (!item.item_id) throw new Error("Item ID is required");
      const supabase = createClient();
      await restoreItem(supabase, item.item_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
      toast({
        title: "Success",
        description: "Item restored successfully",
      });
      setIsRestoreDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error restoring item:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to restore item",
        variant: "destructive",
      });
    },
  });

  const columns: ColumnDef<Item>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("item_name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: () => <div className="w-24">SKU</div>,
      cell: ({ row }) => <p className="w-24 truncate">{row.getValue("sku")}</p>,
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
      id: "inventory",
      header: () => <div className="w-40 text-right">Inventory</div>,
      cell: ({ row }) => {
        const remainingStock = row.original.total_quantity ?? 0;
        const sold = row.original.total_sold ?? 0;
        const purchaseBatches = row.original.purchase_batches ?? [];
        const totalQuantityEver = purchaseBatches.reduce(
          (acc, batch) => acc + (batch.quantity ?? 0),
          0
        );
        const sellThrough =
          totalQuantityEver > 0
            ? Math.round((sold / totalQuantityEver) * 100)
            : 0;

        return (
          <div className="w-40 text-right">
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              <span className="text-muted-foreground">Stock:</span>
              <span>{remainingStock}</span>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              <span
                className={cn(
                  sellThrough >= 75 && "text-green-600 dark:text-green-400",
                  sellThrough >= 50 &&
                    sellThrough < 75 &&
                    "text-yellow-600 dark:text-yellow-400",
                  sellThrough < 50 && "text-orange-600 dark:text-orange-400"
                )}
              >
                {sellThrough}%
              </span>{" "}
              sell through ({sold} sold)
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "is_archived",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={cn(
            !row.original.is_archived &&
              "bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-950/20 dark:text-green-300",
            row.original.is_archived &&
              "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-300"
          )}
        >
          {row.original.is_archived ? "Archived" : "Active"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setIsDetailsOpen(true);
                }}
              >
                View details
              </DropdownMenuItem>
              {item.is_archived ? (
                <DropdownMenuItem
                  onClick={() => {
                    setItemToRestore(item);
                    setIsRestoreDialogOpen(true);
                  }}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setItemToArchive(item);
                    setIsArchiveDialogOpen(true);
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        defaultPageSize={10}
        searchPlaceholder="Search items..."
        searchColumn="item_name"
        onRowClick={(item) => {
          setSelectedItem(item);
          setIsDetailsOpen(true);
        }}
        actions={actions}
      />

      <Sheet
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedItem(null);
        }}
      >
        <ItemDetailsSheet
          item={selectedItem}
          open={isDetailsOpen}
          onOpenChange={(open) => {
            setIsDetailsOpen(open);
            if (!open) setSelectedItem(null);
          }}
        />
      </Sheet>

      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this item? This action can be
              undone later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsArchiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (itemToArchive) {
                  archiveMutation.mutate(itemToArchive);
                }
              }}
            >
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this item?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRestoreDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (itemToRestore) {
                  restoreMutation.mutate(itemToRestore);
                }
              }}
            >
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
