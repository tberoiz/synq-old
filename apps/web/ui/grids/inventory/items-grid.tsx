"use client";

import { UserInventory } from "@synq/supabase/models/inventory";
import { ItemCard } from "@ui/cards/item-card";
import { Sheet, SheetContent, SheetTrigger } from "@synq/ui/sheet";
import ItemDetailsSheetContent from "@ui/sheets/item-details-sheet";
import { Button } from "@synq/ui/button";
import { Plus } from "lucide-react";
import { AddNewCollectionDialog } from "@ui/dialogs/add-new-collection-dialog";
import { CreateItemsDropdown } from "@ui/dropdowns/create-items-dropdown";

interface ItemsGridProps {
  data: UserInventory[];
  selectedItems: UserInventory[];
  onSelectItem: (item: UserInventory) => void;
}

export function ItemsGrid({
  data,
  selectedItems,
  onSelectItem,
}: ItemsGridProps) {
  return (
    <div>
      {/* Grid Items */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <Sheet key={item.id}>
            <SheetTrigger asChild>
              <ItemCard
                key={item.id}
                id={item.id}
                name={
                  item.custom_name || item.global_card?.name || "Unnamed Item"
                }
                quantity={item.quantity}
                cogs={item.cogs}
                listingPrice={item.listing_price}
                isSelected={selectedItems.some((i) => i.id === item.id)}
                onSelect={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
              />
            </SheetTrigger>
            <SheetContent
              key={item.id}
              side="right"
              className="w-full max-w-2xl overflow-y-auto"
            >
              <ItemDetailsSheetContent item={item} />
            </SheetContent>
          </Sheet>
        ))}
        {/* Add New Collection Button */}
        <CreateItemsDropdown
          trigger={
            <Button variant="outline" className="border-dashed h-full w-full">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
