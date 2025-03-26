"use client";

// React
import React, { useState, useRef, ReactNode } from "react";

// Types
import type { ItemDetails } from "@synq/supabase/types";

// UI Components
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "@synq/ui/sheet";
import { cn } from "@synq/ui/utils";
import { useIsMobile } from "@synq/ui/use-mobile";
import { Label } from "@synq/ui/label";
import { Package, Box, X, Check, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@synq/ui/button";
import { useToast } from "@synq/ui/use-toast";

// Local Components
import { EditItemForm } from "../forms/edit-item-form";

// API
import { useItemDetailsQuery, useCategoriesQuery } from "../../queries/items";

interface ItemDetailsSheetProps {
  itemId: Pick<ItemDetails, "item_id"> | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete?: (itemId: string) => void;
  trigger?: ReactNode;
}

export function ItemDetailsSheet({
  itemId,
  open,
  onOpenChange,
  trigger
}: ItemDetailsSheetProps): React.ReactElement {
  // API Hooks
  const { data: categories, isLoading: isLoadingCategories } = useCategoriesQuery();
  const { data: itemDetails, isLoading: isLoadingItem } = useItemDetailsQuery(itemId);
  const { toast } = useToast();

  // UI Hooks
  const isMobile = useIsMobile();
  const [isSaving, setIsSaving] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(itemDetails?.name || "");
  // Derived State
  const isLoading = isLoadingCategories || isLoadingItem;

  const handleSave = async () => {
    if (!formRef.current) return;
    setIsSaving(true);
    try {
      await formRef.current.requestSubmit();
      toast({ title: "Success", description: "Item updated successfully!" });
      onOpenChange?.(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update item." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
      ) : null}
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col p-4",
          isMobile ? "w-full h-3/4" : "sm:w-1/2 lg:1/2 xl:w-1/4 h-full"
        )}
      >
        <SheetHeader className="space-y-4 p-6 border-b shrink-0">
          <SheetTitle className="text-xl font-semibold">Item Details</SheetTitle>
          {itemDetails ? (
            <div className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-3" : "grid-cols-3"
            )}>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <div className="flex items-center gap-1 font-medium text-sm">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{itemDetails?.category || "Uncategorized"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Stock</Label>
                <div className="flex items-center gap-1 font-medium text-sm">
                  <Box className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{itemDetails?.total_quantity || 0}</span>
                  <span className="text-xs text-muted-foreground">units</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Sold</Label>
                <div className="flex items-center gap-1 font-medium text-sm">
                  <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{itemDetails?.total_sold || 0}</span>
                  <span className="text-xs text-muted-foreground">units</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-destructive">
              Error loading item details. Please try again.
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {isLoading && (
              <div className="text-center text-muted-foreground">Loading...</div>
            )}

            {!isLoading && (!itemDetails || !categories) && (
              <div className="text-center text-muted-foreground">
                Select an item to view details
              </div>
            )}

            {!isLoading && itemDetails && categories && (
              <EditItemForm
                item={itemDetails}
                categories={categories}
                onSuccess={() => onOpenChange?.(false)}
                onDirtyChange={setIsFormDirty}
                ref={formRef}
              />
            )}
          </div>
        </div>

        {itemId?.item_id && (
          <SheetFooter className="px-6 py-4 border-t shrink-0">
            <div className="w-full">
              <div className={cn(
                "flex items-center gap-2",
                isMobile && "justify-end"
              )}>
                <SheetClose asChild>
                  <Button
                    variant={isMobile ? "ghost" : "outline"}
                    size="sm"
                    className={isMobile ? "px-3" : "gap-1"}
                  >
                    {isMobile ? <X className="h-3.5 w-3.5" /> : "Close"}
                  </Button>
                </SheetClose>
                <Button
                  onClick={handleSave}
                  disabled={!isFormDirty || isSaving}
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
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
