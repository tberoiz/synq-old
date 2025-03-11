import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";
import {
  ItemView,
  TransformedPurchaseBatch,
  BatchWithDetails,
  PaginatedResponse,
  ItemUpdateParams,
  ItemViewWithPurchaseBatches,
} from "../types/inventory";

// Error handling utility
function handleSupabaseError(error: any, operation: string): never {
  throw new Error(`${operation} failed: ${error.message}`);
}

// Constants for query optimization
const ITEMS_PER_PAGE = 10;
const ITEMS_VIEW_SELECT = `
  *,
  purchase_batches:user_purchase_items!item_id (
    id,
    quantity,
    unit_cost,
    created_at,
    batch:user_purchase_batches!batch_id (
      id,
      name
    )
  )
`;

type PurchaseItemWithBatch = Database["public"]["Tables"]["user_purchase_items"]["Row"] & {
  batch: Database["public"]["Tables"]["user_purchase_batches"]["Row"];
};

// Transform nested purchase batch data
function transformPurchaseBatches(
  batches: PurchaseItemWithBatch[],
): TransformedPurchaseBatch[] {
  return (
    batches?.map((batch) => ({
      id: batch.batch.id,
      name: batch.batch.name,
      quantity: batch.quantity,
      unit_cost: batch.unit_cost,
      created_at: batch.created_at || "",
    })) || []
  );
}

export async function fetchItemsView(
  supabase: SupabaseClient,
  params: {
    userId: string;
    page: number;
    pageSize?: number;
    includeArchived?: boolean;
  },
): Promise<PaginatedResponse<ItemViewWithPurchaseBatches>> {
  const pageSize = params.pageSize || ITEMS_PER_PAGE;
  const start = (params.page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from("vw_items_ui_table")
    .select(ITEMS_VIEW_SELECT, { count: "exact" })
    .eq("user_id", params.userId)
    .order("item_name")
    .range(start, end);

  const { data, error, count } = await query;

  if (error) handleSupabaseError(error, "Items fetch");

  const transformedData =
    data?.map((item) => ({
      ...item,
      purchase_batches: transformPurchaseBatches(item.purchase_batches),
    })) || [];

  return { data: transformedData, count: count ?? 0 };
}

export async function fetchItemDetails(
  supabase: SupabaseClient,
  itemId: string,
): Promise<ItemView & { purchase_batches: TransformedPurchaseBatch[] }> {
  const { data, error } = await supabase
    .from("vw_items_ui_table")
    .select(ITEMS_VIEW_SELECT)
    .eq("item_id", itemId)
    .single();

  if (error) handleSupabaseError(error, "Item details fetch");

  return {
    ...data,
    purchase_batches: transformPurchaseBatches(data.purchase_batches),
  };
}

export async function updateItemDetails(
  supabase: SupabaseClient,
  itemId: string,
  updates: ItemUpdateParams,
): Promise<void> {
  const { error } = await supabase
    .from("user_inventory_items")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (error) handleSupabaseError(error, "Item update");
}
