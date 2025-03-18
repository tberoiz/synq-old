import type { Database } from "./database.types";

export type PurchaseBatch =
  Database["public"]["Tables"]["user_purchase_batches"]["Row"];
export type PurchaseItem =
  Database["public"]["Tables"]["user_purchase_items"]["Row"];
export type ItemView = Database["public"]["Views"]["vw_items_ui_table"]["Row"];

export const PURCHASE_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  PENDING: "pending",
  COMPLETED: "completed",
} as const;

export type PurchaseStatus =
  (typeof PURCHASE_STATUS)[keyof typeof PURCHASE_STATUS];

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

export interface PurchaseTableRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  total_cost: number;
  status: PurchaseStatus;
  potential_revenue: number;
  actual_revenue: number;
}

/**
 * @interface PurchaseDetails
 * @description Extended type for the items details sheet.
 * @table: vw_items_ui_table
 */
export interface PurchaseDetails extends PurchaseTableRow {
  items: PurchaseItemWithDetails[];
}

export type PurchaseItemWithDetails = PurchaseItem & {
  name: string;
  sku: string;
  listing_price: number;
  potential_revenue: number;
  is_archived: boolean;
};

/**
 * @interface ImportItem
 * @description Type for items that can be imported into a purchase.
 * @table: user_inventory_items
 */
export interface ImportItem {
  item_id: string;
  item_name: string;
  sku: string | null;
  category: string | null;
  listing_price: number;
  is_archived: boolean;
  total_quantity: number;
}

/**
 * @interface ImportItemWithDetails
 * @description Extended type for import items with additional details.
 */
export type ImportItemWithDetails = ImportItem;
