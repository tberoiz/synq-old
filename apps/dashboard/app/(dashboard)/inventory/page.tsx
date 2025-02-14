"use client";

import { useEffect, useState } from "react";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { createClient } from "@synq/supabase/client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@synq/ui/select";
import InventoryCard from "@ui/cards/inventory-card";
import { Plus, Filter, Package2 } from "lucide-react";

// Initialize Supabase client
const supabase = createClient();

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            stock: Math.random(),
            platforms: ["tcgplayer", "ebay"],
            lastSynced: new Date(item.created_at),
          }))
        );
      }
      setLoading(false);
    }

    fetchInventory();
  }, []);

  return (
    <div className="space-y-4">
      {/* Inventory Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Input placeholder="Search inventories..." className="max-w-xs text-sm" />
          <Select>
            <SelectTrigger className="w-[160px] text-sm">
              <Filter className="h-3 w-6 mr-2" />
              Filter by Platform
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Inventories</SelectItem>
              <SelectItem value="tcgplayer">TCGplayer</SelectItem>
              <SelectItem value="ebay">eBay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="text-sm">
          <Plus className="h-3 w-3 mr-2" />
          New Inventory
        </Button>
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <p className="text-center text-muted-foreground">Loading inventory...</p>
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
    </div>
  );
}
