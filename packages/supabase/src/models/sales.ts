// Define union types for status fields to match the SQL constraints
export type SalesBatchStatus = "draft" | "listed" | "completed";
export type SalesBatchItemStatus = "pending" | "listed" | "sold";

interface SalesBatch {
  id: string;
  name: string;
  status: "draft" | "listed" | "completed";
  created_at: string;
  listed_at?: string;
  user_sales_batch_items?: {
    inventory_id: string;
    listing_price: number;
    quantity_to_list: number;
    ebay_category_id: string | null;
    status: string;
    created_at: string;
    user_inventory: {
      name: string;
      image_url: string;
    };
  }[];
}

export interface UserSalesBatch {
  id: string;
  user_id: string;
  name: string;
  status: SalesBatchStatus;
  created_at: string;
  listed_at: string | null;
}
