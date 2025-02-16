"use client";

import { useEffect, useState } from "react";
import { Button } from "@synq/ui/button";
import { createClient } from "@synq/supabase/client";
import InventoryCard from "@ui/cards/inventory-card";
import { Plus, Package2 } from "lucide-react";
// import { CardTable } from "@ui/tables/cards-table";

const supabase = createClient();

// TODO: Fetch data from the db
const itemsData = [
  {
    id: 1,
    name: "Black Lotus",
    sku: "MTG-ALPHA-BL",
    stock: 2,
    platforms: ["tcgplayer", "ebay"],
    listingsCount: 3,
    lastSold: new Date("2024-03-15"),
    lastSynced: new Date(),
    priceHistory: [
      { date: "2024-01-01", price: 25000 },
      { date: "2024-03-01", price: 27500 },
    ],
  },
  {
    id: 2,
    name: "Charizard (1st Ed.)",
    sku: "POKE-BS-4",
    stock: 5,
    platforms: ["ebay", "shopify"],
    listingsCount: 2,
    lastSold: new Date("2024-03-14"),
    lastSynced: new Date(),
  },
];

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);

  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventories")
        .select("id, name, created_at");

      if (error) {
        console.error("Error fetching inventory:", error.message);
      } else {
        setInventoryData(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            items: Math.floor(Math.random() * 20),
            stock: Math.round(Math.random() * 100),
            platforms: ["shopify", "cardmarket"],
            lastSynced: new Date(item.created_at),
          })),
        );
      }
      setLoading(false);
    }

    fetchInventory();
  }, []);

  const handleInventoryClick = (inventory: any) => {
    setSelectedInventory(inventory);
  };

  return (
    <div className="space-y-4">
      {/* Inventory Controls */}
      {/* <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Input
            placeholder="Search inventories..."
            className="max-w-xs text-sm"
          />
        </div>

        <Button className="text-sm">
          <Plus className="h-3 w-3 mr-2" />
          New Inventory
        </Button>
      </div> */}

      {/* Inventory Grid */}
      {loading ? (
        <p className="text-center text-muted-foreground">
          Loading inventory...
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {inventoryData.map((inventory) => (
            <InventoryCard
              key={inventory.id}
              name={inventory.name}
              items={inventory.items}
              stock={inventory.stock}
              channel={inventory.platforms}
              lastSynced={inventory.lastSynced}
              isActive={selectedInventory?.id === inventory.id}
              onClick={() => handleInventoryClick(inventory)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && inventoryData.length === 0 && (
        <div className="text-center py-8">
          <Package2 className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium mb-1 text-sm">No inventories found</h3>
          <p className="text-muted-foreground mb-3 text-sm">
            Start by creating a new inventory or connecting a platform.
          </p>
          <Button className="text-sm">
            <Plus className="h-3 w-3 mr-2" />
            Create Inventory
          </Button>
        </div>
      )}

      {/* Display Items for Selected Inventory */}
      {selectedInventory && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Items in {selectedInventory.name}
          </h2>
          {/* <CardTable data={itemsData} loading={loading} /> */}
        </div>
      )}
    </div>
  );
}
