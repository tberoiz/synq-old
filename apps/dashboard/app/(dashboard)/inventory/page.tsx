import { Button } from "@refrom/ui/button";
import { Input } from "@refrom/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@refrom/ui/select";
import InventoryCard from "@ui/cards/inventory-card";
import { Plus, Filter, Package2 } from "lucide-react";

const inventoryData = [
  {
    id: 1,
    name: "Digital Products",
    items: 15,
    stock: undefined,
    platforms: ["gumroad" as const, "etsy" as const],
    lastSynced: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: 2,
    name: "Pokemon TCG",
    items: 8,
    stock: 5, // Low stock
    platforms: ["ebay" as const, "tcgplayer" as const, "cardmarket" as const],
    lastSynced: new Date(Date.now() - 86400000), // 24 hours ago
  },
];

export default function InventoryPage() {
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
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {inventoryData.map((inventory) => (
          <InventoryCard
            key={inventory.id}
            name={inventory.name}
            items={inventory.items}
            stock={inventory.stock}
            channel={inventory.platforms}
            lastSynced={new Date()}
          />
        ))}
      </div>

      {/* Empty State */}
      {inventoryData.length === 0 && (
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
