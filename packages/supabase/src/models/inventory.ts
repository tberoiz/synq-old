export interface UserCategory {
  id: string;
  user_id: string;
  name: string;
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
  suppliers: UserSupplier[];
  name: string;
  created_at: string;
  item_count: number;
  total_listing_price: number;
  total_profit: number;
  total_cogs: number;
}

export interface UserInventory {
  id: string;
  user_id: string;
  acquisition_batch_id: string | null;
  category_id: string;
  name: string;
  quantity: number;
  cogs: number;
  listing_price: number;
  created_at: string;
}
