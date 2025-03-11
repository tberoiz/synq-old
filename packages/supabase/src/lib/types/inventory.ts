import type { Database } from "./database.types";

export type InventoryItem = Database["public"]["Tables"]["user_inventory_items"]["Row"];
export type InventoryGroup = Database["public"]["Tables"]["user_inventory_groups"]["Row"];
export type PurchaseBatch = Database["public"]["Tables"]["user_purchase_batches"]["Row"];
export type PurchaseItem = Database["public"]["Tables"]["user_purchase_items"]["Row"];
export type ItemView = Database["public"]["Views"]["vw_items_ui_table"]["Row"];

export const PURCHASE_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  PENDING: "pending",
  COMPLETED: "completed",
} as const;

export type PurchaseStatus = typeof PURCHASE_STATUS[keyof typeof PURCHASE_STATUS];

export type InventoryItemWithDetails = InventoryItem & {
  category: string | null;
};

export interface PurchaseMetrics {
  unique_items: number;
  total_quantity: number;
  remaining_quantity: number;
  sold_quantity: number;
  sell_through_rate: number;
}

export interface PurchaseFinancials {
  total_cost: number;
  potential_revenue: number;
  actual_revenue: number;
  actual_profit: number;
  profit_margin: number;
}

export interface Purchase extends PurchaseMetrics, PurchaseFinancials {
  id: string;
  user_id: string;
  name: string;
  status: PurchaseStatus;
  created_at: string;
  updated_at: string;
  items: PurchaseItemWithDetails[];
}

export type PurchaseItemWithDetails = PurchaseItem & {
  name: string;
  sku: string;
  listing_price: number;
  potential_revenue: number;
  is_archived: boolean;
};

export type BatchWithDetails = Pick<PurchaseBatch, "id" | "name" | "created_at" | "status">;

export type TransformedPurchaseBatch = {
  id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
};

export type ItemViewWithPurchaseBatches = ItemView & {
  purchase_batches: TransformedPurchaseBatch[];
};

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}

export type ItemUpdateParams = {
  name: string;
  sku: string | null;
  default_cogs: number;
  listing_price: number;
  inventory_group_id: string;
  is_archived?: boolean;
};

export type CreateItemParams = {
  categoryId: string;
  name: string;
  sku?: string;
  cogs: number;
  listingPrice: number;
  userId: string;
};

export type CreatePurchaseParams = {
  name: string;
  userId: string;
  items: Array<{
    item_id: string;
    quantity: number;
    unit_cost: number;
  }>;
};
