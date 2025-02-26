export interface UserCategory {
  id: string;
  name: string;
  user_id: string;
}

export interface UserSupplier {
  id: string;
  user_id: string;
  name: string;
  contact_info?: string;
  created_at: string;
}

export interface UserAcquisitionBatch {
  id: string;
  user_id: string;
  suppliers: string[];
  name: string;
  created_at: string;
  item_count: number;
  total_listing_price: number;
  total_profit: number;
  total_cogs: number;
  updated_at: string;
}

export interface UserItem {
  id: string;
  user_id: string;
  acquisition_batch_id: string | null;
  category_id: string;
  sku: string;
  name: string;
  quantity: number;
  cogs: number;
  listing_price: number;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}
