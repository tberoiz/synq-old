'use client'

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInventories } from "@synq/supabase/queries/inventory";
import { fetchItemsByInventory } from "@synq/supabase/queries/items";
import { Inventory } from "@synq/supabase/models";
import InventoryGrid from "@ui/grids/inventory-grid";
import { CardTable } from "@ui/tables/cards-table";

const InventoryPage = () => {
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(
    null
  );

  // Fetch inventories
  const { data: inventoryData, isLoading: isFetchingInventories } = useQuery({
    queryKey: ["inventories"],
    queryFn: fetchInventories,
  });

  // Fetch items when an inventory is selected
  const { data: items, isLoading: isFetchingItems } = useQuery({
    queryKey: ["items", selectedInventory?.id],
    queryFn: () => (selectedInventory ? fetchItemsByInventory(selectedInventory.id) : []),
    enabled: !!selectedInventory,
  });

  const handleInventoryClick = (inventory: Inventory) =>
    setSelectedInventory(inventory);

  return (
    <div className="space-y-4">
      <InventoryGrid
        inventoryData={inventoryData || []}
        isFetching={isFetchingInventories}
        selectedInventory={selectedInventory}
        handleInventoryClick={handleInventoryClick}
      />

      <div className="mt-8">
        <CardTable data={items || []} loading={isFetchingItems} />
      </div>
    </div>
  );
};

export default InventoryPage;
