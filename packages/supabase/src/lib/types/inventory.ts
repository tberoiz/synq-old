import type { Database } from "./database.types";

// Base types from database
export type InventoryItem =
  Database["public"]["Tables"]["user_inventory_items"]["Row"];
export type InventoryGroup =
  Database["public"]["Tables"]["user_inventory_groups"]["Row"];
export type PurchaseBatch =
  Database["public"]["Tables"]["user_purchase_batches"]["Row"];
export type ItemView = Database["public"]["Views"]["vw_items_ui_table"]["Row"];

// Extended types
export interface InventoryItemWithDetails extends InventoryItem {
  category?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  unique_items: number;
  total_quantity: number;
  remaining_quantity: number;
  sold_quantity: number;
  total_cost: number;
  potential_revenue: number;
  actual_revenue: number;
  actual_profit: number;
  sell_through_rate: number;
  profit_margin: number;
  items: {
    id: string;
    item_id: string;
    name: string;
    sku: string;
    quantity: number;
    remaining_quantity: number;
    unit_cost: number;
    total_cost: number;
    listing_price: number;
    potential_revenue: number;
    is_archived: boolean;
  }[];
}

export interface PurchaseItem {
  id: string;
  quantity: number;
  unit_cost: number;
  remaining_quantity: number;
  item: {
    id: string;
    name: string;
    sku: string;
    is_archived: boolean;
  };
}

export interface PurchaseBatchWithNested {
  id: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
  batch: {
    id: string;
    name: string;
  };
}

export interface TransformedPurchaseBatch {
  id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
}

export interface ItemViewWithPurchaseBatches {
  item_id: string | null;
  item_name: string | null;
  sku: string | null;
  category: string | null;
  listing_price: number | null;
  default_cogs: number | null;
  total_quantity: number | null;
  total_sold: number | null;
  user_id: string | null;
  inventory_group_id: string | null;
  is_archived: boolean | null;
  purchase_batches: TransformedPurchaseBatch[];
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}

export interface ItemUpdateParams {
  name: string;
  sku?: string | null;
  default_cogs: number;
  listing_price: number;
  inventory_group_id: string;
  is_archived?: boolean;
}

export interface CreateItemParams {
  categoryId: string;
  name: string;
  sku: string | undefined;
  cogs: number;
  listingPrice: number;
  userId: string;
}

export interface CreatePurchaseParams {
  name: string;
  userId: string;
  items: {
    item_id: string;
    quantity: number;
    unit_cost: number;
  }[];
}
