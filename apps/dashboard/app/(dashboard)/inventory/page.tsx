import InventoryCard from "@ui/cards/inventory-card";

// TODO: Simulated data (to be fetched from the database)
const inventoryData = [
  { id: 1, name: "Inventory A", items: 150, stock: 200 },
  { id: 2, name: "Inventory B", items: 120, stock: 300 },
  { id: 3, name: "Inventory C", items: 200, stock: 400 },
  { id: 4, name: "Inventory D", items: 50, stock: 100 },
  { id: 5, name: "Inventory E", items: 180, stock: 250 },
];

export default function InventoryPage() {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {inventoryData.map((inventory) => (
          <InventoryCard
            key={inventory.id}
            name={inventory.name}
            items={inventory.items}
            stock={inventory.stock}
          />
        ))}
      </div>
    </>
  );
}
