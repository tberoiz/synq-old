"use client";

import {
  DollarSign,
  Box,
  TrendingUp,
  ShoppingCart,
  BarChart,
  PieChart,
  Archive,
  RefreshCcw,
} from "lucide-react";
import {
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetContent,
} from "@synq/ui/sheet";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { useToast } from "@synq/ui/use-toast";
import {
  addItemToPurchase,
  archivePurchase,
  fetchInventoryItems,
  fetchPurchaseDetails,
  getUserId,
  Purchase,
  restorePurchase,
  updatePurchaseItem,
} from "@synq/supabase/queries";

import { Button } from "@synq/ui/button";
import React, { useState, useRef } from "react";
import { cn } from "@synq/ui/utils";
import { Badge } from "@synq/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@synq/ui/card";
import PurchaseItemsTable, {
  type PurchaseItemsTableRef,
} from "@ui/modules/inventory/components/tables/purchase-items-table";
import { InventoryItemWithDetails } from "@synq/supabase/types";
import { CreateItemDialog } from "../dialogs/create-item-dialog";
import { ImportItemsDialog } from "../dialogs/import-items-dialog";

interface PurchaseDetailsSheetProps {
  purchase: Purchase | null;
  isMobile: boolean;
  onSaveBatch: (
    updates: { id: string; quantity: number; unit_cost: number }[],
  ) => void;
}

export default function PurchaseDetailsSheet({
  purchase,
  isMobile,
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

  const { data: purchaseDetails } = useQuery<Purchase | null>({
    queryKey: ["purchase_details", purchase?.id],
    queryFn: () => {
      if (!purchase?.id) return null;
      return fetchPurchaseDetails(supabase, purchase.id);
    },
    enabled: !!purchase?.id,
    initialData: purchase || null,
  });

  const { data: inventoryItems, isLoading: isItemsLoading } = useQuery({
    queryKey: ["inventory_items"],
    queryFn: () => fetchInventoryItems(supabase, false),
    enabled: !!purchase,
  });

  useMutation({
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
        userId
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
          queryKey: ["purchase_details", purchase?.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
        queryClient.invalidateQueries({ queryKey: ["item_details"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory_stats"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase_stats"] }),
      ]);

      queryClient.refetchQueries({
        queryKey: ["purchase_details", purchase?.id],
        exact: true,
      });

      toast({ title: "Success", description: "Item updated!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const { mutate: archivePurchaseMutation } = useMutation({
    mutationFn: async () => {
      if (!purchase) throw new Error("Purchase is required");
      return archivePurchase(supabase, purchase.id);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_purchases"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase_details"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
      toast({ title: "Success", description: "Purchase archived!" });
      const closeButton = document.querySelector(
        '[role="dialog"]',
      ) as HTMLButtonElement;
      closeButton?.click();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const { mutate: restorePurchaseMutation } = useMutation({
    mutationFn: async () => {
      if (!purchase) throw new Error("Purchase is required");
      return restorePurchase(supabase, purchase.id);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_purchases"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase_details"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
      toast({ title: "Success", description: "Purchase restored!" });
      const closeButton = document.querySelector(
        '[role="dialog"]',
      ) as HTMLButtonElement;
      closeButton?.click();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  if (!purchaseDetails) {
    return null;
  }

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
    updates: Map<string, { quantity: number; unit_cost: number }>,
  ) => {
    setIsSaving(true);
    try {
      const updatesArray = Array.from(updates.entries()).map(([id, data]) => ({
        id,
        quantity: data.quantity,
        unit_cost: data.unit_cost,
      }));

      await Promise.all(
        updatesArray.map((update) =>
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

  if (!purchase) return null;

  return (
    <SheetContent
      side={isMobile ? "bottom" : "right"}
      className={cn("w-full sm:max-w-xl lg:max-w-2xl", isMobile && "h-[90vh]")}
    >
      <div className="flex flex-col h-full">
        {purchaseDetails.status === "archived" && (
          <div className="bg-muted/50 border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  This purchase is archived
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => restorePurchaseMutation()}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Restore Purchase
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="flex items-center gap-2">
              <Box className="h-6 w-6" />
              <div>
                <div className="text-lg font-medium truncate max-w-[300px]">
                  {purchaseDetails.name}
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    purchaseDetails.status === "active" &&
                      "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300",
                    purchaseDetails.status === "archived" &&
                      "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-950/20 dark:text-slate-300",
                  )}
                >
                  {purchaseDetails.status}
                </Badge>
              </div>
              {purchaseDetails.status !== "archived" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => archivePurchaseMutation()}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Box className="h-4 w-4 text-blue-600" />
                    Total Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="text-lg">
                    {purchaseDetails?.total_quantity ?? 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    Total Cost
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="text-lg">
                    ${(purchaseDetails?.total_cost ?? 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="text-lg">
                    {purchaseDetails?.remaining_quantity ?? 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-amber-600" />
                    Sold
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="text-lg">
                    {purchaseDetails?.sold_quantity ?? 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-indigo-600" />
                    Sell Through
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="text-lg">
                    {purchaseDetails?.sell_through_rate ?? 0}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-rose-600" />
                    Margin
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="text-lg">
                    {purchaseDetails?.profit_margin ?? 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Purchase Items</h3>
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

        {isTableDirty && (
          <SheetFooter className="flex justify-end gap-2 p-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ["purchase_details", purchaseDetails.id],
                });
                setIsTableDirty(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (tableRef.current) {
                  const updates = tableRef.current.getUpdates();
                  if (updates.size > 0) {
                    await handleSaveBatch(updates);
                  }
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </SheetFooter>
        )}
      </div>
    </SheetContent>
  );
}
