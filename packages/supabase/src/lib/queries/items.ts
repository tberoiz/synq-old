import { SupabaseClient } from "@supabase/supabase-js";
import { PaginatedResponse } from "../types/inventory";
import {
  ItemDetails,
  ItemUpdateParams,
  ItemTableRow,
  TransformedPurchaseBatch,
} from "lib/types/items";

// Constants
const DEFAULT_ITEMS_PER_PAGE = 10;

/**
 * Handles Supabase errors by throwing a descriptive error message.
 * @param error - The error object returned by Supabase.
 * @param operation - A string describing the operation that failed.
 * @throws {Error} - Throws an error with a descriptive message.
 */
function handleSupabaseError(error: any, operation: string): never {
  throw new Error(`${operation} failed: ${error.message}`);
}

/**
 * Fetches a paginated list of items from the `vw_items_ui_table` view.
 * @param supabase - The Supabase client instance.
 * @param params - An object containing userId, page, pageSize, and includeArchived flag.
 * @returns {Promise<PaginatedResponse<ItemTableRow>>} - A paginated response containing the items and total count.
 */
export async function fetchItemsView(
  supabase: SupabaseClient,
  params: {
    userId: string;
    page: number;
    pageSize?: number;
    includeArchived?: boolean;
  },
): Promise<PaginatedResponse<ItemTableRow>> {
  const pageSize = params.pageSize || DEFAULT_ITEMS_PER_PAGE;
  const start = (params.page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Build the query
  let query = supabase
    .from("vw_items_ui_table")
    .select(
      `item_id, item_name, sku, category, listing_price, is_archived, total_quantity`,
      {
        count: "exact",
      },
    )
    .eq("user_id", params.userId)
    .order("item_name")
    .range(start, end);

  // Execute the query
  const { data, error, count } = await query;

  if (error) handleSupabaseError(error, "Items fetch");

  return { data: data as ItemTableRow[], count: count ?? 0 };
}

/**
 * Fetches detailed information about a specific item from the `vw_items_ui_table` view.
 * @param supabase - The Supabase client instance.
 * @param itemId - The ID of the item to fetch details for.
 * @returns {Promise<ItemDetails>} - The detailed information about the item.
 */
export async function fetchItemDetails(
  supabase: SupabaseClient,
  itemId: Pick<ItemDetails, "item_id">,
): Promise<ItemDetails> {
  const { data, error } = await supabase
    .from("vw_items_ui_table")
    .select("*")
    .eq("item_id", itemId.item_id)
    .single();

  if (error) handleSupabaseError(error, "Item details fetch");

  return {
    ...data,
    purchase_batches: transformPurchaseBatches(data.purchase_batches),
  };
}

/**
 * Transforms purchase batches into a standardized format.
 * @param batches - An array of purchase batches or null.
 * @returns {TransformedPurchaseBatch[]} - An array of transformed purchase batches.
 */
function transformPurchaseBatches(
  batches: Array<{
    batch_id: string;
    name: string;
    quantity: number;
    unit_cost: number;
    created_at: string;
  }> | null,
): TransformedPurchaseBatch[] {
  return (
    batches?.map((batch) => ({
      id: batch.batch_id,
      name: batch.name,
      quantity: batch.quantity,
      unit_cost: batch.unit_cost,
      created_at: batch.created_at,
    })) || []
  );
}

/**
 * Updates the details of a specific item in the `user_inventory_items` table.
 * @param supabase - The Supabase client instance.
 * @param itemId - The ID of the item to update.
 * @param updates - An object containing the fields to update.
 * @returns {Promise<void>}
 */
export async function updateItemDetails(
  supabase: SupabaseClient,
  itemId: Pick<ItemDetails, "item_id">,
  updates: ItemUpdateParams,
): Promise<void> {
  const { error } = await supabase
    .from("user_inventory_items")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId.item_id);

  if (error) handleSupabaseError(error, "Item update");
}
