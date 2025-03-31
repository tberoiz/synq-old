"use client";

// REACT
import React, { useState, useRef, useCallback } from "react";

// TYPES
import { type SaleItemsTableRef } from "../tables/sale-items-table";
import { type UpdateSaleFormData } from "../forms/edit-sale-form";

// UI COMPONENTS
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetContent,
} from "@synq/ui/sheet";
import { useToast } from "@synq/ui/use-toast";
import { Button } from "@synq/ui/button";
import { ShoppingCart } from "lucide-react";

// HOOKS
import { useIsMobile } from "@synq/ui/use-mobile";

// QUERIES & MUTATIONS
import { useSaleDetailsQuery, useSaleMutations } from "../../queries/sales";

// COMPONENTS
import SaleItemsTable from "../tables/sale-items-table";
import { EditSaleForm } from "../forms/edit-sale-form";

// UTILS
import { cn } from "@synq/ui/utils";
import { format } from "date-fns";

interface SaleDetailsSheetProps {
  saleId: string | null;
  onOpenChange?: (open: boolean) => void;
}

export default function SaleDetailsSheet({
  saleId,
  onOpenChange,
}: SaleDetailsSheetProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { data: sale, isLoading } = useSaleDetailsQuery(saleId);
  const { update, addItems } = useSaleMutations();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const tableRef = useRef<SaleItemsTableRef>(null);
  const [isTableDirty, setIsTableDirty] = useState(false);

  const handleSubmit = async (data: UpdateSaleFormData) => {
    if (!sale) return;

    try {
      await update.mutate({
        saleId: sale.id,
        updates: {
          status: data.status,
          platform: data.platform,
          saleDate: data.sale_date,
          shippingCost: data.shipping_cost,
          taxAmount: data.tax_amount,
          platformFees: data.platform_fees,
          notes: data.notes,
        },
      });
      toast({
        title: "Success",
        description: "Sale updated successfully",
      });
      setIsFormDirty(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update sale",
      });
    }
  };

  const handleBatchUpdateItems = useCallback(async (localChanges: Record<string, { quantity?: number; price?: number }>) => {
    if (!sale) return;
    
    try {
      // Only update items that have changes
      const itemsToUpdate = Object.keys(localChanges).map(itemId => {
        const item = sale.items.find(i => i.id === itemId);
        if (!item) return null;
        
        const updates = localChanges[itemId] || {};
        return {
          id: itemId, // Include the ID for existing items
          purchaseItemId: item.item_id, // Use item_id as the purchase item ID
          quantity: updates.quantity !== undefined ? updates.quantity : item.quantity,
          salePrice: updates.price !== undefined ? updates.price : item.unit_price,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);
      
      if (itemsToUpdate.length > 0) {
        await update.mutate({
          saleId: sale.id,
          updates: {
            items: itemsToUpdate,
          },
        });
        toast({
          title: "Success",
          description: "Items updated successfully",
        });
        
        if (tableRef.current) {
          tableRef.current.resetUpdates();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update items",
        variant: "destructive",
      });
    }
  }, [sale, update, toast]);

  // Combined save handler for both form and table changes
  const handleSaveAll = async () => {
    if (!sale) return;

    try {
      let hasFormUpdates = false;
      let hasTableUpdates = false;
      
      // Get form updates if the form is dirty
      if (isFormDirty) {
        // Trigger form submission
        const formElement = document.getElementById('edit-sale-form') as HTMLFormElement;
        if (formElement) {
          formElement.requestSubmit();
          hasFormUpdates = true;
        }
      }
      
      // Get table updates if the table is dirty
      if (isTableDirty && tableRef.current) {
        const updates = tableRef.current.getUpdates();
        if (updates.size > 0) {
          // Convert Map to Record for the handleBatchUpdateItems function
          const changesRecord: Record<string, { quantity?: number; price?: number }> = {};
          updates.forEach((value, key) => {
            changesRecord[key] = value;
          });
          
          await handleBatchUpdateItems(changesRecord);
          hasTableUpdates = true;
        }
      }
      
      if (!hasFormUpdates && !hasTableUpdates) {
        toast({
          title: "Info",
          description: "No changes to save",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  if (!saleId || isLoading) return null;
  if (!sale) return null;

  return (
    <SheetContent
      side={isMobile ? "bottom" : "right"}
      className={cn(
        "flex flex-col",
        isMobile ? "w-full h-3/4" : "h-full w-1/2",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <div>
                  <div className="text-lg font-medium">Sale Details</div>
                  <SheetDescription className="text-sm text-muted-foreground">
                    Sale information and items
                  </SheetDescription>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Sale Items</h3>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <SaleItemsTable
                  ref={tableRef}
                  saleId={sale?.id}
                  showImportButton={sale?.status !== "completed"}
                  onUpdateItem={handleBatchUpdateItems}
                  isEditable={sale?.status !== "completed"}
                  onDirtyChange={setIsTableDirty}
                  hideSaveButton={true} // Hide the table's save button
                />
              </div>
            </div>
          </div>

          <EditSaleForm
            sale={sale}
            onSubmit={handleSubmit}
            onFormStateChange={setIsFormDirty}
          />
        </div>

        <SheetFooter className="border-t bg-background p-4">
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center h-10">
              <p className="text-sm text-muted-foreground">
                Sale created on {format(new Date(sale.sale_date), "MMM dd, yyyy")}
              </p>
            </div>
            {(isFormDirty || isTableDirty) && (
              <Button
                onClick={handleSaveAll}
                disabled={update.isPending}
                className="w-full"
              >
                {update.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}

