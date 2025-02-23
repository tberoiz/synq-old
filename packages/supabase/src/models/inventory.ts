//FIXME: rename camelcase values
export interface UserCollection {
  id: string;
  user_id: string;
  name: string;
  code: string;
  created_at: string;
  itemCount: number;
  totalValue: number;
  totalProfit: number;
}

export interface GlobalCard {
  id: string;
  collection_id: string;
  name: string;
  code: string;
  rarity?: string;
  image_url?: string;
  created_at: string;
}

export interface UserAcquisitionBatch {
  id: string;
  user_id: string;
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
  acquisition_batch_id: string;
  collection_id: string;
  global_card_id: { id: string; name: string } | null;
  global_card?: { id: string; name: string };
  custom_name: string | null;
  quantity: number;
  cogs: number;
  listing_price: number;
  created_at: string;
}
