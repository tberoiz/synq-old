"use client";

import { UserInventory } from "@synq/supabase/models/inventory";
import { ItemCard } from "@ui/cards/item-card";

interface ItemsGridProps {
  data: UserInventory[];
  onItemClick: (item: UserInventory) => void;
}

export function ItemsGrid({ data, onItemClick }: ItemsGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <ItemCard
          key={item.id}
          id={item.id}
          name={item.custom_name || item.global_card?.name || "Unnamed Item"}
          quantity={item.quantity}
          cogs={item.cogs}
          listingPrice={item.listing_price}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
}
