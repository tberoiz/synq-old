// NOTE: This File is not being used for now.
"use client";

import { UserItem } from "@synq/supabase/models/inventory";
import { ItemCard } from "@ui/cards/item-card";
import { Sheet, SheetContent, SheetTrigger } from "@synq/ui/sheet";
import ItemDetailsSheetContent from "@ui/sheets/inventory/item-details-sheet";
import { CreateItemDialog } from "@ui/dialogs/inventory/create-item-dialog";

interface ItemsGridProps {
  data: UserItem[];
  selectedItems: UserItem[];
  onSelectItem: (item: UserItem) => void;
}

export function ItemsGrid({
  data,
  selectedItems,
  onSelectItem,
}: ItemsGridProps) {
  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <Sheet key={item.id}>
            <SheetTrigger asChild>
              <ItemCard
                key={item.id}
                id={item.id}
                name={
                  item.name
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
        <CreateItemDialog />
      </div>
    </div>
  );
}
