export interface InventoryGroup {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  unit_cost: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface InventoryItemWithDetails extends InventoryItem {
  category: InventoryGroup;
  default_cogs: number;
  sku?: string;
  listing_price?: number;
}

export interface Purchase {
  id: string;
  user_id: string;
  batch_id: string;
  item_id: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  status: "active" | "archived";
  name: string;
  // Inventory metrics
  unique_items: number;
  total_quantity: number;
  sold_quantity: number;
  remaining_quantity: number;
  sell_through_rate: number;
  // Financial metrics
  total_cost: number;
  actual_revenue: number;
  actual_profit: number;
  profit_margin: number;
  // Purchase items
  items: Array<{
    id: string;
    is_archived: boolean;
  }>;
}

export interface PurchaseBatch {
  id: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface CreateItemParams {
  userId: string;
  categoryId: string;
  name: string;
  description?: string;
  sku?: string;
  cogs: number;
  listingPrice: number;
}

export interface CreatePurchaseParams {
  name: string;
  userId: string;
  items: Array<{
    item_id: string;
    quantity: number;
    unit_cost: number;
  }>;
}

export interface ItemView extends InventoryItem {
  inventory_group_id: string;
  default_cogs: number;
  listing_price: number;
  sku: string;
  item_id?: string;
  item_name?: string;
}

export interface TransformedPurchaseBatch {
  id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}

export interface ItemUpdateParams {
  name?: string;
  description?: string;
  inventory_group_id?: string;
  sku?: string;
  default_cogs?: number;
  listing_price?: number;
  is_archived?: boolean;
}

export interface ItemViewWithPurchaseBatches extends ItemView {
  purchase_batches: TransformedPurchaseBatch[];
  item_id: string;
  item_name: string;
  category: string;
  total_quantity: number;
  total_sold: number;
}
