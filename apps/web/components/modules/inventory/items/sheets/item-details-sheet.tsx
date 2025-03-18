"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
  SheetDescription,
} from "@synq/ui/sheet";
import { fetchCategories, fetchItemDetails } from "@synq/supabase/queries";
import { createClient } from "@synq/supabase/client";
import type { ItemDetails } from "@synq/supabase/types";
import { EditItemForm } from "../forms/edit-item-form";

interface ItemDetailsSheetProps {
  itemId: Pick<ItemDetails, "item_id"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ItemDetailsSheet({
  itemId,
  open,
  onOpenChange,
}: ItemDetailsSheetProps) {
  const supabase = createClient();

  const { data: item, isLoading: isLoadingItem } = useQuery({
    queryKey: ["item_details", itemId],
    queryFn: () => (itemId ? fetchItemDetails(supabase, itemId) : null),
    enabled: !!itemId,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["inventory_groups"],
    queryFn: () => fetchCategories(supabase),
  });

  const isLoading = isLoadingItem || isLoadingCategories;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-1/4 flex flex-col">
        <SheetHeader>
          <SheetTitle>Item Details</SheetTitle>
          <SheetDescription>View and edit item details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading && <div className="text-center">Loading...</div>}

          {!isLoading && (!item || !categories) && (
            <div className="text-center">Select an item to view details</div>
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
