"use client";

// REACT
import React, { useState, useRef } from "react";

// UI COMPONENTS
import { SheetHeader, SheetTitle, SheetContent, Sheet } from "@synq/ui/sheet";
import { useToast } from "@synq/ui/use-toast";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { Badge } from "@synq/ui/badge";
import PurchaseItemsTable, {
  type PurchaseItemsTableRef,
} from "@ui/modules/inventory/purchases/components/tables/purchase-items-table";
import { Avatar, AvatarFallback, AvatarImage } from "@synq/ui/avatar";
import { ImportItemsDialog } from "../dialogs/import-items-dialog";

// API
import { useQueryClient } from "@tanstack/react-query";
import { type PurchaseDetails } from "@synq/supabase/types";
import { ImportItem } from "@synq/supabase/types";

// ICONS
import {
  DollarSign,
  Box,
  TrendingUp,
  Pencil,
  Check,
  X,
  Tag,
  User,
} from "lucide-react";

// UTILS
import { cn } from "@synq/ui/utils";
import { usePurchaseDetailsSheetQueries } from "../../queries/purchase-details-sheet";

interface PurchaseDetailsSheetProps {
  purchase: PurchaseDetails | null;
  isMobile: boolean;
  onSaveBatch: (
    updates: { id: string; quantity: number; unit_cost: number }[]
  ) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PurchaseDetailsSheet({
  purchase,
  isMobile,
  open,
  onOpenChange,
}: PurchaseDetailsSheetProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isTableDirty, setIsTableDirty] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const tableRef = useRef<PurchaseItemsTableRef>(null);

  const {
    userId,
    purchaseDetails,
    updateItem,
    updateName,
    removeItem,
    importItems,
  } = usePurchaseDetailsSheetQueries(purchase?.id ?? null);

  if (!purchase || !purchaseDetails) return null;

  const details: PurchaseDetails = purchaseDetails;
  const items = details.items || [];

  const handleNameEdit = () => {
    setEditedName(details.name);
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (editedName.trim() !== details.name) {
      updateName(editedName.trim())
        .then(() => {
          setIsEditingName(false);
          toast({ title: "Success", description: "Purchase name updated!" });
        })
        .catch((error: any) => {
          toast({ title: "Error", description: error.message });
        });
    } else {
      setIsEditingName(false);
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleImportItems = async (selectedItems: ImportItem[]) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await importItems(selectedItems);
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
      await removeItem(purchaseItemId);
      toast({ title: "Success", description: "Item removed from purchase!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

  const handleSaveBatch = async (
    updates: Map<string, { quantity: number; unit_cost: number }>
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
          updateItem({
            id: update.id,
            quantity: update.quantity,
            unit_cost: update.unit_cost,
          })
        )
      );

      toast({ title: "Success", description: "Purchase items updated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setIsSaving(false);
      setIsTableDirty(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "sm:w-3/4 lg:w-1/2",
          isMobile && "h-[90vh]"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle className="flex items-start gap-4">
                <Box className="h-6 w-6 mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="h-8 w-[200px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleNameSave();
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleNameSave}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleNameCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium truncate max-w-[500px]">
                          {details.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleNameEdit}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize",
                      details.status === "active" &&
                        "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300",
                      details.status === "archived" &&
                        "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-950/20 dark:text-slate-300"
                    )}
                  >
                    {details.status}
                  </Badge>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4 py-4">
                {/* Total COGS Card */}
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-600">Total COGS</p>
                  </div>
                  <p className="text-lg font-semibold text-blue-900">
                    ${(details.total_cost || 0).toFixed(2)}
                  </p>
                </div>

                {/* Total Listing Price Card */}
                <div className="p-4 border rounded-lg bg-purple-50">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-600" />
                    <p className="text-sm text-purple-600">
                      Total Listing Price
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-purple-900">
                    $
                    {(
                      items?.reduce(
                        (acc, item) =>
                          acc +
                          (item.listing_price || 0) * (item.quantity || 0),
                        0
                      ) || 0
                    ).toFixed(2)}
                  </p>
                </div>

                {/* Total Profit Card */}
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-600">Total Profit</p>
                  </div>
                  <p className="text-lg font-semibold text-green-900">
                    $
                    {(
                      (items?.reduce(
                        (acc, item) =>
                          acc +
                          (item.listing_price || 0) * (item.quantity || 0),
                        0
                      ) || 0) - (details.total_cost || 0)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Suppliers</h3>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="https://via.placeholder.com/150"
                      alt="test-supplier"
                    />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Example Supplier</p>
                    <p className="text-sm text-muted-foreground">
                      m@example.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Purchase Items</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImportItemsDialog
                      title="Add Items to Purchase"
                      onImport={handleImportItems}
                    />
                  </div>
                </div>

                <PurchaseItemsTable
                  ref={tableRef}
                  data={items}
                  onRemoveItem={handleRemoveItem}
                  onSaveBatch={handleSaveBatch}
                  onDirtyChange={setIsTableDirty}
                  showHeader={false}
                />
              </div>
            </div>
          </div>

          {isTableDirty && (
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["purchase_details", details.id],
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
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
