import { Inventory } from "@synq/supabase/models";
import { Package2 } from "lucide-react";
import InventoryCard from "@ui/cards/inventory-card";

interface InventoryGridProps {
  inventoryData: Inventory[];
  isFetching: boolean;
  selectedInventory: Inventory | null;
  handleInventoryClick: (inventory: Inventory) => void;
}
const InventoryGrid = ({
  inventoryData,
  isFetching,
  selectedInventory,
  handleInventoryClick,
}: InventoryGridProps) => {

  if (isFetching) {
    return (
      <p className="text-center text-muted-foreground">
        Loading inventory...
      </p>
    );
  }

  if (inventoryData?.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {inventoryData?.map((inventory) => (
        <InventoryCard
          key={inventory.id}
          id={inventory.id}
          name={inventory.name}
          isActive={selectedInventory?.id === inventory.id}
          onClick={() => handleInventoryClick(inventory)}
        />
      ))}
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-8">
    <Package2 className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
    <h3 className="font-medium mb-1 text-sm">No inventories found</h3>
    <p className="text-muted-foreground mb-3 text-sm">
      Start by creating a new inventory or connecting a platform.
    </p>
  </div>
);

export default InventoryGrid;
