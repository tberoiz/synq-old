"use client";

// React
import React from "react";

// Types
import type { ItemDetails } from "@synq/supabase/types";

// UI Components
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
  SheetDescription,
} from "@synq/ui/sheet";
import { cn } from "@synq/ui/utils";
import { useIsMobile } from "@synq/ui/use-mobile";

// Local Components
import { EditItemForm } from "../forms/edit-item-form";

// API Hooks
import { useItemDetailsQuery, useCategoriesQuery } from "../../queries/items";

interface ItemDetailsSheetProps {
  itemId: Pick<ItemDetails, "item_id"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDetailsSheet({
  itemId,
  open,
  onOpenChange,
}: ItemDetailsSheetProps): React.ReactElement {
  // API Hooks
  const { data: item, isLoading: isLoadingItem } = useItemDetailsQuery(itemId);
  const { data: categories, isLoading: isLoadingCategories } = useCategoriesQuery();
  
  // UI Hooks
  const isMobile = useIsMobile();

  // Derived State
  const isLoading = isLoadingItem || isLoadingCategories;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col",
          isMobile ? "w-full h-[90vh]" : "w-1/2 md:w-1/4 h-full"
        )}
      >
        <SheetHeader>
          <SheetTitle>Item Details</SheetTitle>
          <SheetDescription>View and edit item details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading && (
            <div className="text-center text-muted-foreground">
              Loading...
            </div>
          )}

          {!isLoading && (!item || !categories) && (
            <div className="text-center text-muted-foreground">
              Select an item to view details
            </div>
          )}

          {!isLoading && item && categories && (
            <EditItemForm
              item={item}
              categories={categories}
              onSuccess={() => onOpenChange(false)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
