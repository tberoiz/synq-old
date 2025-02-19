"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInventoryGroups } from "@synq/supabase/queries/inventory";
import { fetchItemsByInventory } from "@synq/supabase/queries/items";
import { InventoryGroup } from "@synq/supabase/models";
import InventoryGrid from "@ui/grids/inventory-grid";
import { CardTable } from "@ui/tables/cards-table";

const InventoryPage = () => {
  const [selectedInventoryGroup, setSelectedInventoryGroup] = useState<InventoryGroup | null>(
    null
  );

  // Fetch inventory groups
  const { data: inventoryGroups, isLoading: isFetchingInventoryGroups } = useQuery({
    queryKey: ["inventory_groups"],
    queryFn: fetchInventoryGroups,
  });

  // Fetch items when an inventory group is selected
  // const { data: items, isLoading: isFetchingItems } = useQuery({
  //   queryKey: ["items", selectedInventoryGroup?.id],
  //   queryFn: () => (selectedInventoryGroup ? fetchItemsByInventory(selectedInventoryGroup.id as number) : []),
  //   enabled: !!selectedInventoryGroup,
  // });

  const handleInventoryClick = (inventory: InventoryGroup) =>
    setSelectedInventoryGroup(inventory);

  return (
    <div className="space-y-4">
      <InventoryGrid
        inventoryData={inventoryGroups || []}
        isFetching={isFetchingInventoryGroups}
        selectedInventory={selectedInventoryGroup}
        handleInventoryClick={handleInventoryClick}
      />

      <div className="mt-8">
        {/* <CardTable data={items || []} loading={isFetchingItems} /> */}
      </div>
    </div>
  );
};

export default InventoryPage;
