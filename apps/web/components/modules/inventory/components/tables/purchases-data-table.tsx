"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Archive, RefreshCcw } from "lucide-react";

import { Button } from "@synq/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@synq/ui/dropdown-menu";
import { Sheet } from "@synq/ui/sheet";
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
import { type Purchase } from "@synq/supabase/queries";
import { cn } from "@synq/ui/utils";
import { Checkbox } from "@synq/ui/checkbox";
import {
  updatePurchaseItem,
  archivePurchase,
  restorePurchase,
} from "@synq/supabase/queries";
import { Badge } from "@synq/ui/badge";
import { format } from "date-fns";
import PurchaseDetailsSheet from "@ui/modules/inventory/components/sheets/purchase-details-sheet";
import { DataTable } from "@ui/shared/data-table/data-table";

interface PurchasesDataTableProps {
  data: Purchase[];
  actions?: React.ReactNode;
}

export default function PurchasesDataTable({
  data,
  actions,
}: PurchasesDataTableProps) {
  const [selectedPurchase, setSelectedPurchase] =
    React.useState<Purchase | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = React.useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [purchaseToArchive, setPurchaseToArchive] =
    React.useState<Purchase | null>(null);
  const [purchaseToRestore, setPurchaseToRestore] =
    React.useState<Purchase | null>(null);
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
    mutationFn: async (purchase: Purchase) => {
      const supabase = createClient();
      await archivePurchase(supabase, purchase.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast({
        title: "Success",
        description: "Purchase archived successfully",
      });
      setIsArchiveDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error archiving purchase:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to archive purchase",
        variant: "destructive",
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (purchase: Purchase) => {
      const supabase = createClient();
      await restorePurchase(supabase, purchase.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast({
        title: "Success",
        description: "Purchase restored successfully",
      });
      setIsRestoreDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error restoring purchase:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to restore purchase",
        variant: "destructive",
      });
    },
  });

  const handleSaveBatch = async (
    updates: { id: string; quantity: number; unit_cost: number }[]
  ) => {
    const supabase = createClient();
    await Promise.all(
      updates.map((update) =>
        updatePurchaseItem(supabase, update.id, {
          quantity: update.quantity,
          unit_cost: update.unit_cost,
        })
      )
    );
    await queryClient.invalidateQueries({
      queryKey: ["purchases"],
    });
    toast({
      title: "Success",
      description: "Purchase updated successfully",
    });
  };

  const columns: ColumnDef<Purchase>[] = [
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
      accessorKey: "name",
      header: () => <div className="w-[35%]">Name</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <div>{format(new Date(row.original.created_at), "MMM dd, yyyy")}</div>
      ),
    },
    {
      accessorKey: "total_cost",
      header: "Total Cost",
      cell: ({ row }) => <div>${row.original.total_cost.toFixed(2)}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={cn(
            row.original.status === "completed" &&
              "bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-950/20 dark:text-green-300",
            row.original.status === "pending" &&
              "bg-yellow-50 text-yellow-700 hover:bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-300",
            row.original.status === "archived" &&
              "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-300",
            row.original.status === "active" &&
              "bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-950/20 dark:text-green-300"
          )}
        >
          {row.original.status === "archived" ? "Archived" : "Active"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const purchase = row.original;
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
                  setSelectedPurchase(purchase);
                  setIsDetailsOpen(true);
                }}
              >
                View details
              </DropdownMenuItem>
              {purchase.status === "archived" ? (
                <DropdownMenuItem
                  onClick={() => {
                    setPurchaseToRestore(purchase);
                    setIsRestoreDialogOpen(true);
                  }}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setPurchaseToArchive(purchase);
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
        searchPlaceholder="Search purchases..."
        searchColumn="name"
        onRowClick={(purchase) => {
          setSelectedPurchase(purchase);
          setIsDetailsOpen(true);
        }}
        actions={actions}
      />

      <Sheet
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedPurchase(null);
        }}
      >
        <PurchaseDetailsSheet
          purchase={selectedPurchase}
          isMobile={isMobile}
          onSaveBatch={handleSaveBatch}
        />
      </Sheet>

      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this purchase? This action can be
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
                if (purchaseToArchive) {
                  archiveMutation.mutate(purchaseToArchive);
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
            <DialogTitle>Restore Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this purchase?
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
                if (purchaseToRestore) {
                  restoreMutation.mutate(purchaseToRestore);
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
