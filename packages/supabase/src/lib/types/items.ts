/**
 * @interface ItemTableRow
 * @description Base type for the items table.
 * @table: vw_items_ui_table
 */
export interface ItemTableRow {
  item_id: string;
  user_id: string;
  item_name: string;
  total_quantity: number;
  sku: string | null;
  category: string;
  listing_price: number;
  is_archived: boolean;
}

/**
 * @interface ItemDetails
 * @description Extended type for the items details sheet.
 * @table: vw_items_ui_table
 */
export interface ItemDetails extends ItemTableRow {
  default_cogs: number;
  inventory_group_id: string;
  total_sold: number;
  purchase_batches: TransformedPurchaseBatch[];
}

/**
 * @type TransformedPurchaseBatch
 * @description Represents a transformed purchase batch.
 */
export type TransformedPurchaseBatch = {
  id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
};

/**
 * @type ItemUpdateParams
 * @description Represents the parameters for updating an item.
 */
export type ItemUpdateParams = {
  name: string;
  sku: string | null;
  default_cogs: number;
  listing_price: number;
  inventory_group_id: string;
  is_archived?: boolean;
};
