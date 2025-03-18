import type { Database } from "./database.types";

export type InventoryItem =
  Database["public"]["Tables"]["user_inventory_items"]["Row"];
export type InventoryGroup =
  Database["public"]["Tables"]["user_inventory_groups"]["Row"];

export type InventoryItemWithDetails = InventoryItem & {
  category: string;
};



