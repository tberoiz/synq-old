"use client";

// REACT
import React, { useState, useRef } from "react";

// UI COMPONENTS
import { SheetHeader, SheetTitle, SheetContent, Sheet, SheetClose } from "@synq/ui/sheet";
import { useToast } from "@synq/ui/use-toast";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import PurchaseItemsTable, {
  type PurchaseItemsTableRef,
} from "@ui/modules/inventory/purchases/components/tables/purchase-items-table";
import { SheetFooter } from "@synq/ui/sheet";
import { Label } from "@synq/ui/label";
import { Calendar, DollarSign, Box, TrendingUp, Check, X, Loader2, Package, HelpCircle, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@synq/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@synq/ui/tooltip";

// API
import { useQueryClient } from "@tanstack/react-query";
import { type PurchaseDetails } from "@synq/supabase/types";
import { ImportItem } from "@synq/supabase/types";

// UTILS
import { cn } from "@synq/ui/utils";
import { usePurchaseDetailsSheetQueries } from "../../queries/purchases";
import { useIsMobile } from "@synq/ui/use-mobile";
import { format } from "date-fns";

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
  const isMobile = useIsMobile();
  const {
    userId,
    purchaseDetails,
    updateItem,
    updateName,
    removeItem,
    importItems,
  } = usePurchaseDetailsSheetQueries(purchase?.id ?? null);
  const [isBundleMode, setIsBundleMode] = useState(false);
  const [bundleCost, setBundleCost] = useState<number | null>(null);
  const [allocationMethod, setAllocationMethod] = useState('even');

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

  const handleAllocateCosts = () => {
    if (!bundleCost || bundleCost <= 0 || !purchase?.items || purchase.items.length === 0) {
      return;
    }

    const items = [...purchase.items];
    const updates = new Map<string, { quantity: number; unit_cost: number }>();

    // Calculate total quantity
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    if (allocationMethod === 'even') {
      // Distribute cost evenly across items (each item type gets equal share)
      const costPerItemType = bundleCost / items.length;

      items.forEach(item => {
        updates.set(item.id, {
          quantity: item.quantity,
          unit_cost: costPerItemType / item.quantity
        });
      });
    } else if (allocationMethod === 'weighted') {
      // Distribute cost based on quantity (each unit gets equal share)
      const costPerUnit = bundleCost / totalQuantity;

      items.forEach(item => {
        updates.set(item.id, {
          quantity: item.quantity,
          unit_cost: costPerUnit
        });
      });
    } else if (allocationMethod === 'manual') {
      // For manual allocation, we'll enable the unit_cost field in the table
      // The user will set costs manually, so we don't need to set anything here
      toast({
        title: "Manual allocation enabled",
        description: "You can now edit costs directly in the table.",
      });
      return;
    }

    // Apply the updates
    if (tableRef.current) {
      tableRef.current.applyUpdates(updates);
      setIsTableDirty(true);

      toast({
        title: "Cost allocation applied",
        description: `Total cost of $${bundleCost.toFixed(2)} has been allocated using the ${allocationMethod} method.`,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col p-4",
          isMobile ? "w-full h-5/6" : "sm:w-3/4 lg:w-3/4 xl:w-1/2 h-full"
        )}>
        <SheetHeader className="space-y-4 p-6 border-b shrink-0">
          <div className="flex items-center justify-between">
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNameSave}
                  className="h-8 px-2"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNameCancel}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl font-semibold">{details.name}</SheetTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNameEdit}
                  className="h-8 px-2"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-1 space-x-6">
              <div>
                <Label className="text-xs text-muted-foreground">Purchase Date</Label>
                <div className={cn(
                  "flex items-center gap-1 font-medium",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  <Calendar className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "text-muted-foreground")} />
                  <span>{format(new Date(purchase?.created_at || ''), "MMM dd, yyyy")}</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Total Items</Label>
                <div className={cn(
                  "flex items-center gap-1 font-medium",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  <Box className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "text-muted-foreground")} />
                  <span>{purchase?.items?.length || 0}</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Total Cost</Label>
                <div className={cn(
                  "flex items-center gap-1 font-medium",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  <DollarSign className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "text-muted-foreground")} />
                  <span>${purchase?.total_cost?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Total Quantity</Label>
                <div className={cn(
                  "flex items-center gap-1 font-medium",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  <Box className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "text-muted-foreground")} />
                  <span>{purchase?.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0}</span>
                </div>
              </div>
            </div>
          </div>

        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Bundle Cost Management</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBundleMode(!isBundleMode)}
                  className="gap-1 text-xs"
                >
                  <Package className="h-3 w-3" />
                  {isBundleMode ? "Use Individual Costs" : "Set Bundle Cost"}
                </Button>
              </div>

              {isBundleMode && (
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bundleCost" className="text-xs">Bundle Total Cost</Label>
                        <div className="flex">
                          <div className={cn(
                            "flex items-center justify-center rounded-l-md border border-r-0 bg-muted text-muted-foreground",
                            isMobile ? "h-7 w-7" : "h-8 w-8"
                          )}>
                            <DollarSign className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                          </div>
                          <Input
                            id="bundleCost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={bundleCost || ''}
                            onChange={(e) => setBundleCost(Number(e.target.value))}
                            className={cn(
                              "rounded-l-none text-xs",
                              isMobile ? "h-7" : "h-8"
                            )}
                            placeholder="Enter total cost"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Allocation Method</Label>
                        <Select value={allocationMethod} onValueChange={setAllocationMethod}>
                          <SelectTrigger className={cn("w-full text-xs", isMobile ? "h-7" : "h-8")}>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="even" className="text-xs">Distribute Evenly</SelectItem>
                            <SelectItem value="weighted" className="text-xs">By Item Quantity</SelectItem>
                            <SelectItem value="manual" className="text-xs">Manual Allocation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <span className="text-xs text-muted-foreground">
                            {allocationMethod === 'even' && "Each item type gets equal share"}
                            {allocationMethod === 'weighted' && "Cost proportional to quantity"}
                            {allocationMethod === 'manual' && "Set costs manually"}
                          </span>
                          <TooltipContent className="max-w-80">
                            <p className="text-xs"><strong>Distribute Evenly:</strong> Each item gets the same unit cost.</p>
                            <p className="text-xs"><strong>By Item Quantity:</strong> Cost proportional to quantity.</p>
                            <p className="text-xs"><strong>Manual Allocation:</strong> Set costs yourself.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Button
                        variant="secondary"
                        size={isMobile ? "sm" : "default"}
                        onClick={handleAllocateCosts}
                        disabled={!bundleCost || bundleCost <= 0}
                        className="gap-1 text-xs"
                      >
                        <TrendingUp className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        Allocate Costs
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>


            <div>
              <PurchaseItemsTable
                ref={tableRef}
                data={purchase?.items || []}
                onRemoveItem={handleRemoveItem}
                onSaveBatch={handleSaveBatch}
                onDirtyChange={setIsTableDirty}
                bundleMode={isBundleMode}
                manualAllocation={allocationMethod === 'manual'}
                onImport={handleImportItems}
                showDetailIcon={true}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t shrink-0">
          <div className="w-full">
            <div className={cn(
              "flex",
              isMobile ? "flex-col space-y-3" : "items-center justify-end"
            )}>
              <div className={cn(
                "flex items-center gap-2",
                isMobile && "justify-end w-full"
              )}>
                <SheetClose asChild>
                  <Button
                    variant={isMobile ? "ghost" : "outline"}
                    size="sm"
                    className={cn(
                      isMobile && "px-3"
                    )}
                  >
                    {isMobile ? <X className="h-3.5 w-3.5" /> : "Close"}
                  </Button>
                </SheetClose>
                <Button
                  onClick={async () => {
                    if (tableRef.current) {
                      const updates = tableRef.current.getUpdates();
                      if (updates.size > 0) {
                        await handleSaveBatch(updates);
                      }
                    }
                  }}
                  disabled={isSaving || !isTableDirty}
                  size="sm"
                  className="gap-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {isMobile ? "" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
