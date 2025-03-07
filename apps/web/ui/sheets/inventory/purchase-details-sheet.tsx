"use client";

import { Package, DollarSign, Box, TrendingUp } from "lucide-react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetContent,
} from "@synq/ui/sheet";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { useToast } from "@synq/ui/use-toast";
import { getUserId } from "@synq/supabase/queries";
import {
  fetchInventoryItems,
  addItemToPurchase,
  updatePurchaseItem,
  deletePurchase,
  type InventoryItemWithDetails,
  type Purchase,
  type PurchaseItem,
} from "@synq/supabase/queries";
import { ImportItemsDialog } from "@ui/dialogs/inventory/import-items-dialog";
import { CreateItemDialog } from "@ui/dialogs/inventory/create-item-dialog";
import PurchaseItemsTable, {
  PurchaseItemsTableRef,
} from "@ui/tables/inventory/purchase-items-table";
import { Button } from "@synq/ui/button";
import React, { useState, useRef } from "react";
import { cn } from "@synq/ui/utils";
import { format } from "date-fns";

interface PurchaseDetailsSheetProps {
  purchase: Purchase | null;
  isMobile: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (purchaseId: string) => void;
  onSaveBatch: (
    updates: { id: string; quantity: number; unit_cost: number }[],
  ) => void;
}

export default function PurchaseDetailsSheet({
  purchase,
  isMobile,
  onOpenChange,
  onDelete,
  onSaveBatch,
}: PurchaseDetailsSheetProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isTableDirty, setIsTableDirty] = useState(false);
  const tableRef = useRef<PurchaseItemsTableRef>(null);

  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: getUserId,
    enabled: !!purchase,
  });

  const { data: purchaseDetails } = useQuery({
    queryKey: ["purchase_details", purchase?.id],
    queryFn: async () => {
      if (!purchase?.id) return null;
      const { data, error } = await supabase
        .from("user_purchase_batches")
        .select(
          `
          *,
          items:user_purchase_items (
            id,
            quantity,
            unit_cost,
            remaining_quantity,
            item:user_inventory_items (
              id,
              name,
              sku,
              is_archived
            )
          )
        `,
        )
        .eq("id", purchase.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!purchase?.id,
    initialData: purchase || undefined,
  });

  const { data: inventoryItems, isLoading: isItemsLoading } = useQuery({
    queryKey: ["inventory_items"],
    queryFn: () => fetchInventoryItems(supabase, false),
    enabled: !!purchase,
  });

  const { mutate: addItemMutation } = useMutation({
    mutationFn: async (data: {
      item_id: string;
      quantity: number;
      unit_cost: number;
    }) => {
      if (!userId || !purchase)
        throw new Error("User ID and Purchase are required");
      return addItemToPurchase(
        supabase,
        purchase.id,
        data.item_id,
        data.quantity,
        data.unit_cost,
        userId,
      );
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_purchases"] }),
        queryClient.invalidateQueries({
          queryKey: ["purchase_details", purchase?.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
      toast({ title: "Success", description: "Item added to purchase!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const { mutate: updateItemMutation } = useMutation({
    mutationFn: async (data: {
      id: string;
      quantity: number;
      unit_cost: number;
    }) => {
      return updatePurchaseItem(supabase, data.id, {
        quantity: data.quantity,
        unit_cost: data.unit_cost,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_purchases"] }),
        queryClient.invalidateQueries({
          queryKey: ["purchase_details", purchaseDetails.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
        queryClient.invalidateQueries({ queryKey: ["item_details"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory_stats"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase_stats"] }),
      ]);

      await queryClient.refetchQueries({
        queryKey: ["purchase_details", purchaseDetails.id],
        exact: true,
      });

      toast({ title: "Success", description: "Item updated!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const { mutate: deletePurchaseMutation } = useMutation({
    mutationFn: async () => {
      if (!purchase) throw new Error("Purchase is required");
      return deletePurchase(supabase, purchase.id);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_purchases"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase_details"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
      toast({ title: "Success", description: "Purchase deleted!" });
      const closeButton = document.querySelector(
        '[role="dialog"]',
      ) as HTMLButtonElement;
      closeButton?.click();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  // Early return if no purchase
  if (!purchaseDetails) {
    return null;
  }

  const totalQuantity = (purchaseDetails.items || []).reduce(
    (sum: number, item: PurchaseItem) =>
      !item.item.is_archived ? sum + item.quantity : sum,
    0,
  );
  const totalCost = (purchaseDetails.items || []).reduce(
    (sum: number, item: PurchaseItem) =>
      !item.item.is_archived ? sum + item.quantity * item.unit_cost : sum,
    0,
  );
  const totalRemaining = (purchaseDetails.items || []).reduce(
    (sum: number, item: PurchaseItem) =>
      !item.item.is_archived ? sum + (item.remaining_quantity || 0) : sum,
    0,
  );

  const archivedItemsCount = (purchaseDetails.items || []).reduce(
    (sum: number, item: PurchaseItem) =>
      item.item.is_archived ? sum + 1 : sum,
    0,
  );

  const handleImportItems = async (
    selectedItems: InventoryItemWithDetails[],
  ) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await Promise.all(
        selectedItems.map((item) =>
          addItemToPurchase(
            supabase,
            purchaseDetails.id,
            item.id,
            1,
            item.default_cogs || 0,
            userId,
          ),
        ),
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_purchases"] }),
        queryClient.invalidateQueries({
          queryKey: ["purchase_details", purchaseDetails.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
      toast({ title: "Success", description: "Items added to purchase!" });
    } catch (error) {
      console.error("Error adding items:", error);
      toast({
        title: "Error",
        description: "Failed to add items. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (purchaseItemId: string) => {
    try {
      const { error } = await supabase
        .from("user_purchase_items")
        .delete()
        .eq("id", purchaseItemId);

      if (error) throw error;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_purchases"] }),
        queryClient.invalidateQueries({
          queryKey: ["purchase_details", purchaseDetails.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
      toast({ title: "Success", description: "Item removed from purchase!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

  const handleSaveBatch = async (
    updates: { id: string; quantity: number; unit_cost: number }[],
  ) => {
    setIsSaving(true);
    try {
      await Promise.all(
        updates.map((update) =>
          updateItemMutation({
            id: update.id,
            quantity: update.quantity,
            unit_cost: update.unit_cost,
          }),
        ),
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_purchases"] }),
        queryClient.invalidateQueries({
          queryKey: ["purchase_details", purchaseDetails.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["purchase_details"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
        queryClient.invalidateQueries({ queryKey: ["item_details"] }),
        queryClient.invalidateQueries({ queryKey: ["user_inv_items"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory_stats"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase_stats"] }),
      ]);

      await queryClient.refetchQueries({
        queryKey: ["purchase_details", purchaseDetails.id],
        exact: true,
      });

      toast({ title: "Success", description: "Purchase items updated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setIsSaving(false);
      setIsTableDirty(false);
    }
  };

  const handleDelete = async () => {
    if (!purchase) return;
    await onDelete(purchase.id);
    onOpenChange(false);
  };

  if (!purchase) return null;

  return (
    <SheetContent
      side={isMobile ? "bottom" : "right"}
      className={cn(isMobile ? "h-1/2 overflow-y-scroll" : "w-1/2")}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <div>
                <div className="text-lg font-medium">
                  {purchaseDetails.name}
                </div>
                <SheetDescription className="text-sm text-muted-foreground">
                  Created on{" "}
                  {format(new Date(purchaseDetails.created_at), "MMM dd, yyyy")}
                </SheetDescription>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2">
                <Box className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-600">Total Items</p>
              </div>
              <p className="text-lg font-semibold text-blue-900">
                {totalQuantity}
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-purple-50">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <p className="text-sm text-purple-600">Total Cost</p>
              </div>
              <p className="text-lg font-semibold text-purple-900">
                ${totalCost.toFixed(2)}
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-600">Remaining Items</p>
              </div>
              <p className="text-lg font-semibold text-green-900">
                {totalRemaining}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Purchase Items</h3>
                {archivedItemsCount > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {archivedItemsCount} archived
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ImportItemsDialog
                  items={inventoryItems || []}
                  title="Add Items to Purchase"
                  onImport={handleImportItems}
                  loading={isItemsLoading}
                />
                <CreateItemDialog />
              </div>
            </div>
            <div className="border rounded-md">
              <div className="relative">
                <div className="max-h-[300px] overflow-y-auto">
                  <PurchaseItemsTable
                    ref={tableRef}
                    data={purchaseDetails.items}
                    onRemoveItem={handleRemoveItem}
                    onSaveBatch={handleSaveBatch}
                    onDirtyChange={setIsTableDirty}
                    showHeader={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t bg-background p-4">
          <div className="w-full">
            {isTableDirty ? (
              <Button
                onClick={() => tableRef.current?.saveChanges()}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <div className="flex items-center justify-center h-10">
                <p className="text-sm text-muted-foreground">
                  No changes to save
                </p>
              </div>
            )}
          </div>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}
