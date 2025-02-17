'use client'

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInventories } from "@synq/supabase/queries/inventory";
import { Inventory } from "@synq/supabase/models";
import InventoryGrid from "@ui/grids/inventory-grid";

const InventoryPage = () => {
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  // Query to fetch inventories
  const { data: inventoryData, isLoading: isFetching } = useQuery({
    queryKey: ["inventories"],
    queryFn: async () => {
      return fetchInventories();
    },
  });

  const handleInventoryClick = (inventory: Inventory) => setSelectedInventory(inventory);

  return (
    <div className="space-y-4">
      <InventoryGrid
        inventoryData={inventoryData || []}
        isFetching={isFetching}
        selectedInventory={selectedInventory}
        handleInventoryClick={handleInventoryClick}
      />

      {selectedInventory && (
        <div className="mt-8">
          {/* <CardTable data={itemsData} loading={loading} /> */}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
